/**
 * theme-toggle.js
 * Theme toggle with variant cycling.
 * Cycles through: Dark → Gold → Emerland → Light → Dark
 * Persists preference in localStorage.
 */
(function () {
    'use strict';

    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    // Theme cycle order
    const THEME_CYCLE = [
        { label: '[ Dark ]', className: '', variant: '' },
        { label: '[ Gold ]', className: 'dark', variant: 'gold' },
        { label: '[ Emerald ]', className: 'dark', variant: 'emerland' },
        { label: '[ Light ]', className: 'light-theme', variant: '' },
    ];

    function getCurrentThemeIndex() {
        const isLight = document.body.classList.contains('light-theme');
        const isDark = document.body.classList.contains('dark');
        const variant = document.body.getAttribute('data-theme') || '';

        if (isLight) return 3; // Light
        if (isDark && variant === 'gold') return 1;
        if (isDark && variant === 'emerland') return 2;
        return 0; // Default Dark
    }

    function applyTheme(index) {
        const theme = THEME_CYCLE[index];

        // Remove all theme classes and variants
        document.body.classList.remove('light-theme', 'dark');
        document.body.removeAttribute('data-theme');

        // Apply new theme
        if (theme.className) {
            document.body.classList.add(theme.className);
        }
        if (theme.variant) {
            document.body.setAttribute('data-theme', theme.variant);
        }

        themeBtn.textContent = theme.label;
        localStorage.setItem('theme', theme.label);
    }

    // Restore saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        const savedIndex = THEME_CYCLE.findIndex(t => t.label === savedTheme);
        if (savedIndex >= 0) {
            applyTheme(savedIndex);
        } else {
            applyTheme(0);
        }
    }

    themeBtn.addEventListener('click', () => {
        // Get toggle button position for reveal origin
        const btnRect = themeBtn.getBoundingClientRect();
        const originX = btnRect.left + btnRect.width / 2;
        const originY = btnRect.top + btnRect.height / 2;

        const currentIndex = getCurrentThemeIndex();
        const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;

        // Use circular reveal transition for theme toggle
        window.playRevealTransition(originX, originY, () => {
            applyTheme(nextIndex);
        });
    });

})();
