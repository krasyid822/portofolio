/**
 * balloon-popup.js
 * Balloon popup / iframe system.
 * Intercepts external links and opens them in a floating iframe popup
 * instead of a new tab.
 *
 * Handles iframe load failures (X-Frame-Options/CSP blocking) by
 * showing a fallback notice with a direct link to open in a new tab.
 */
(function () {
    'use strict';

    let activePopup = null;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function openPopup(url, title) {
        closePopup();

        const isVideo = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url);

        const popup = document.createElement('div');
        popup.className = 'balloon-popup';

        let bodyContent = '';
        if (isVideo) {
            bodyContent = `<video src="${escapeHtml(url)}" controls autoplay playsinline style="width: 100%; height: 100%; object-fit: contain; background: #000; border: none;"></video>`;
        } else {
            bodyContent = `
                <iframe src="${escapeHtml(url)}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" title="${escapeHtml(title || url)}"></iframe>
                <div class="balloon-popup-banner" style="display: none;">
                    <span>Situs tidak dapat dimuat atau menolak koneksi?</span>
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="balloon-popup-banner-link">
                        Buka di Tab Baru <i class="fa-solid fa-external-link-alt"></i>
                    </a>
                </div>
                <div class="balloon-popup-fallback" style="display: none;">
                    <div class="balloon-popup-fallback-content">
                        <i class="fa-solid fa-lock" style="font-size: 2rem; margin-bottom: 12px; opacity: 0.6;"></i>
                        <p>Situs ini menolak untuk dibuka di dalam jendela popup.</p>
                        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="balloon-popup-fallback-link">
                            <i class="fa-solid fa-external-link-alt"></i> Buka di Tab Baru
                        </a>
                    </div>
                </div>
            `;
        }

        popup.innerHTML = `
            <div class="balloon-popup-container">
                <div class="balloon-popup-header">
                    <span class="balloon-popup-title">${escapeHtml(title || url)}</span>
                    <div class="balloon-popup-header-actions">
                        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="balloon-popup-open-tab" title="Buka di tab baru" aria-label="Buka di tab baru">
                            <i class="fa-solid fa-external-link-alt"></i>
                        </a>
                        <button class="balloon-popup-close" aria-label="Tutup">&times;</button>
                    </div>
                </div>
                <div class="balloon-popup-body">
                    ${bodyContent}
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        activePopup = popup;

        // Trigger entrance animation
        requestAnimationFrame(() => {
            popup.classList.add('open');
        });

        if (!isVideo) {
            // --- Detect iframe load failure ---
            const iframe = popup.querySelector('iframe');
            const fallback = popup.querySelector('.balloon-popup-fallback');
            const banner = popup.querySelector('.balloon-popup-banner');

            let proxyCheckFinished = false;
            let proxyCheckPassed = false;

            const isCrossOrigin = new URL(url, window.location.href).origin !== window.location.origin;
            // Using corsproxy.io (hosted on Cloudflare Workers) to fetch headers of cross-origin URLs
            const fetchUrl = isCrossOrigin ? `https://corsproxy.io/?${encodeURIComponent(url)}` : url;

            // Pre-check via fetch: detect X-Frame-Options / CSP headers
            fetch(fetchUrl, { method: 'GET', credentials: 'omit' })
                .then(res => {
                    proxyCheckFinished = true;
                    const xfo = res.headers.get('X-Frame-Options');
                    const csp = res.headers.get('Content-Security-Policy');

                    let blocked = false;
                    if (xfo && (xfo.toUpperCase() === 'DENY' || xfo.toUpperCase() === 'SAMEORIGIN')) {
                        blocked = true;
                    } else if (csp && /frame-ancestors/i.test(csp)) {
                        if (/frame-ancestors\s+('none'|'self')/i.test(csp)) {
                            blocked = true;
                        }
                    }

                    if (blocked) {
                        showFallback(iframe, fallback);
                    } else {
                        proxyCheckPassed = true;
                        // If it successfully verified that it is not blocked, hide banner if it was shown
                        if (banner) banner.style.display = 'none';
                    }
                })
                .catch(() => {
                    proxyCheckFinished = true;
                });

            // If iframe fails to load (network error, DNS failure, etc.)
            iframe.addEventListener('error', () => {
                showFallback(iframe, fallback);
            });

            // Detect blocking via load event (same-origin only)
            let loadCount = 0;
            iframe.addEventListener('load', () => {
                loadCount++;
                try {
                    if (iframe.contentDocument && iframe.contentDocument.body) {
                        // Same-origin: check if body is essentially empty
                        const body = iframe.contentDocument.body;
                        const textLen = (body.textContent || '').trim().length;
                        const hasMedia = body.querySelectorAll('img, svg, canvas, video, object, embed').length > 0;
                        if (textLen < 30 && !hasMedia && loadCount > 1) {
                            showFallback(iframe, fallback);
                        }
                    }
                } catch (_) { }
            });

            // Timeout-based detection:
            // - Same-origin: check if body is blank after 3 seconds, show fallback if empty.
            // - Cross-origin: show a bottom helper banner after 2.5 seconds ONLY if the proxy check
            //   did not explicitly pass (e.g. proxy failed, timed out, or is still loading).
            setTimeout(() => {
                if (fallback.style.display === 'flex') return;

                try {
                    if (iframe.contentDocument && iframe.contentDocument.body) {
                        // Same-origin: final content check
                        const body = iframe.contentDocument.body;
                        const textLen = (body.textContent || '').trim().length;
                        const hasMedia = body.querySelectorAll('img, svg, canvas, video, object, embed').length > 0;
                        if (textLen < 30 && !hasMedia) {
                            showFallback(iframe, fallback);
                        }
                    } else {
                        // Cross-origin: show helper banner if proxy check did not explicitly confirm allowed
                        if (!proxyCheckPassed && banner) {
                            banner.style.display = 'flex';
                        }
                    }
                } catch (_) {
                    // Cross-origin access error: show helper banner if proxy check did not confirm allowed
                    if (!proxyCheckPassed && banner) {
                        banner.style.display = 'flex';
                    }
                }
            }, 2500);
        }

        // Close button
        const closeBtn = popup.querySelector('.balloon-popup-close');
        closeBtn.addEventListener('click', closePopup);

        // Click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup();
        });

        // Escape key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') closePopup();
        };
        document.addEventListener('keydown', escHandler);
        popup._escHandler = escHandler;
    }

    function showFallback(iframe, fallback) {
        if (!iframe || !fallback) return;
        if (fallback.style.display === 'flex') return; // already shown
        iframe.style.display = 'none';
        fallback.style.display = 'flex';
    }

    function closePopup() {
        if (activePopup) {
            activePopup.classList.remove('open');
            if (activePopup._escHandler) {
                document.removeEventListener('keydown', activePopup._escHandler);
            }
            setTimeout(() => {
                if (activePopup && activePopup.parentNode) {
                    activePopup.parentNode.removeChild(activePopup);
                }
                activePopup = null;
            }, 300);
        }
    }

    // Intercept all external links with data-popup attribute
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-popup]');
        if (link) {
            e.preventDefault();
            const url = link.getAttribute('href');
            const title = link.getAttribute('data-title') || link.textContent.trim();
            openPopup(url, title);
        }
    });

    // Also intercept dynamically created links with data-popup-external
    // (for repo-index.js cards that use window.open)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-popup-external]');
        if (link) {
            e.preventDefault();
            const url = link.getAttribute('href');
            const title = link.getAttribute('data-title') || link.textContent.trim();
            openPopup(url, title);
        }
    });

    // Expose popup functions globally for other scripts (e.g., repo-index.js)
    window.openPopup = openPopup;
    window.closePopup = closePopup;

})();
