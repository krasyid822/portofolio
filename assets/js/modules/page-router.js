/**
 * page-router.js
 * SPA page routing / multipage system.
 * Handles navigation between page sections with scan-line transition.
 */
(function () {
    'use strict';

    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    const sections = document.querySelectorAll('.page-section');

    function switchPage(targetId) {
        // Update active nav button immediately
        tabBtns.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-tab-btn[data-target="${targetId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Play scan transition (original effect for page navigation)
        window.playScanTransition(() => {
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.remove('inactive');
                    section.style.opacity = '0';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            section.style.transition = 'opacity 0.2s ease-in-out';
                            section.style.opacity = '1';
                        });
                    });
                    window.scrollTo({ top: 0, behavior: 'instant' });
                } else {
                    section.classList.add('inactive');
                    section.style.opacity = '';
                    section.style.transition = '';
                }
            });
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return;
            e.preventDefault();
            switchPage(targetId);
        });
    });

    // --- Logo Hover: reveal "portofolio." prefix ---
    const logo = document.querySelector('a.logo');
    const subdomain = document.querySelector('.logo .subdomain');
    if (logo && subdomain) {
        logo.addEventListener('mouseenter', () => {
            subdomain.style.maxWidth = '250px';
            subdomain.style.opacity = '1';
        });
        logo.addEventListener('mouseleave', () => {
            subdomain.style.maxWidth = '0';
            subdomain.style.opacity = '0';
        });
    }

})();
