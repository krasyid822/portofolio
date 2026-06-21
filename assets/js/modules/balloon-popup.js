/**
 * balloon-popup.js
 * Balloon popup / iframe system.
 * Intercepts external links and opens them in a floating iframe popup
 * instead of a new tab.
 *
 * Supports playing video files directly using a native video element.
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
            bodyContent = `<iframe src="${escapeHtml(url)}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" title="${escapeHtml(title || url)}"></iframe>`;
        }

        popup.innerHTML = `
            <div class="balloon-popup-container">
                <div class="balloon-popup-header">
                    <span class="balloon-popup-title">${escapeHtml(title || url)}</span>
                    <div class="balloon-popup-header-actions">
                        <span class="balloon-popup-help-text" style="font-family: var(--code-font); font-size: 0.75rem; color: var(--text-muted); opacity: 0.8;">Web gagal diload?</span>
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
