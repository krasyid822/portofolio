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

        const popup = document.createElement('div');
        popup.className = 'balloon-popup';
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
                    <iframe src="${escapeHtml(url)}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" title="${escapeHtml(title || url)}"></iframe>
                    <div class="balloon-popup-fallback" style="display: none;">
                        <div class="balloon-popup-fallback-content">
                            <i class="fa-solid fa-lock" style="font-size: 2rem; margin-bottom: 12px; opacity: 0.6;"></i>
                            <p>Situs ini menolak untuk dibuka di dalam jendela popup.</p>
                            <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="balloon-popup-fallback-link">
                                <i class="fa-solid fa-external-link-alt"></i> Buka di Tab Baru
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        activePopup = popup;

        // Trigger entrance animation
        requestAnimationFrame(() => {
            popup.classList.add('open');
        });

        // --- Detect iframe load failure ---
        const iframe = popup.querySelector('iframe');
        const fallback = popup.querySelector('.balloon-popup-fallback');

        // Pre-check via fetch: detect X-Frame-Options / CSP headers
        // before the iframe loads. Works for same-origin URLs.
        // For cross-origin, the fetch will fail (CORS) and we fall through.
        fetch(url, { method: 'HEAD', mode: 'cors', credentials: 'omit' })
            .then(res => {
                const xfo = res.headers.get('X-Frame-Options');
                const csp = res.headers.get('Content-Security-Policy');
                if (xfo && (xfo.toUpperCase() === 'DENY' || xfo.toUpperCase() === 'SAMEORIGIN')) {
                    showFallback(iframe, fallback);
                } else if (csp && /frame-ancestors\s+'none'/i.test(csp)) {
                    showFallback(iframe, fallback);
                }
            })
            .catch(() => {
                // CORS or network error — cannot pre-check headers.
                // Fall through to iframe-based detection below.
            });

        // If iframe fails to load (network error, DNS failure, etc.)
        iframe.addEventListener('error', () => {
            showFallback(iframe, fallback);
        });

        // Detect blocking via load event.
        // When X-Frame-Options blocks, the browser still fires 'load'
        // but renders an empty document. For same-origin iframes we can
        // check contentDocument.body directly.
        let loadCount = 0;
        iframe.addEventListener('load', () => {
            loadCount++;
            try {
                if (iframe.contentDocument && iframe.contentDocument.body) {
                    // Same-origin: check if body is essentially empty
                    const body = iframe.contentDocument.body;
                    const textLen = (body.textContent || '').trim().length;
                    const hasMedia = body.querySelectorAll('img, svg, canvas, video, object, embed').length > 0;
                    // Blocked pages render a blank body with no meaningful content
                    if (textLen < 30 && !hasMedia && loadCount > 1) {
                        showFallback(iframe, fallback);
                    }
                }
                // contentDocument is null for cross-origin iframes (both
                // blocked and successful). We cannot distinguish them here.
            } catch (_) { }
        });

        // Timeout-based detection: after 5 seconds, check if the iframe
        // rendered anything. For cross-origin iframes, we use a no-cors
        // fetch to verify the server is reachable.
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
                    // Cross-origin: contentDocument is null.
                    // Use no-cors fetch to check server reachability.
                    fetch(url, { method: 'HEAD', mode: 'no-cors' })
                        .then(() => {
                            // Server is reachable but iframe contentDocument
                            // is null — likely X-Frame-Options blocking.
                            // Check iframe height as additional heuristic.
                            if (iframe.offsetHeight < 80) {
                                showFallback(iframe, fallback);
                            }
                        })
                        .catch(() => {
                            // Network error — definitely blocked/unreachable
                            showFallback(iframe, fallback);
                        });
                }
            } catch (_) {
                // Cross-origin access error
                fetch(url, { method: 'HEAD', mode: 'no-cors' })
                    .then(() => {
                        if (iframe.offsetHeight < 80) {
                            showFallback(iframe, fallback);
                        }
                    })
                    .catch(() => {
                        showFallback(iframe, fallback);
                    });
            }
        }, 5000);

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
