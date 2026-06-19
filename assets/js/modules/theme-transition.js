/**
 * theme-transition.js
 * Circular reveal transition for theme toggle.
 * A semi-transparent circle of the NEW theme color expands from
 * the toggle button outward. Content stays visible through it
 * (old & new colors blend). Midway, the theme switches so content
 * matches the spreading color wave.
 */
(function () {
    'use strict';

    const overlay = document.getElementById('transition-overlay');

    function getNextThemeColor() {
        // Determine the next theme color based on current state
        const isLight = document.body.classList.contains('light-theme');
        const isDark = document.body.classList.contains('dark');
        const variant = document.body.getAttribute('data-theme') || '';

        // Theme cycle: Dark → Gold → Emerald → Light → Dark
        if (isLight) return '#000000'; // Going to Dark
        if (isDark && variant === 'gold') return '#000000'; // Going to Emerald (use dark bg)
        if (isDark && variant === 'emerland') return '#ffffff'; // Going to Light
        // Default Dark → Gold
        return '#000000';
    }

    function playRevealTransition(originX, originY, callback) {
        if (!overlay) { callback(); return; }

        // Determine the NEW theme color (the color that will spread)
        const newThemeColor = getNextThemeColor();

        // Set overlay to the NEW theme color with transparency
        // so content underneath remains visible (colors blend)
        overlay.style.display = 'block';
        overlay.style.background = newThemeColor;
        overlay.style.opacity = '0.35';
        overlay.style.transition = 'none';

        // Start as a tiny circle at the toggle button position
        overlay.style.clipPath = `circle(0px at ${originX}px ${originY}px)`;

        // Force reflow
        void overlay.offsetWidth;

        // Expand the circle to cover the entire viewport —
        // the new color spreads outward from the toggle like a wave,
        // blending with the content underneath
        overlay.style.transition = 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        overlay.style.clipPath = `circle(200vmax at ${originX}px ${originY}px)`;

        // Midway through expansion, switch the theme so content
        // matches the overlay color
        const callbackTimer = setTimeout(() => {
            callback();
        }, 400);

        // Fade out the overlay after theme has switched
        const fadeTimer = setTimeout(() => {
            overlay.style.transition = 'opacity 0.3s ease';
            overlay.style.opacity = '0';
        }, 700);

        // Clean up after animation completes
        const cleanupTimer = setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '1';
            overlay.style.transition = '';
            overlay.style.background = '';
            overlay.style.clipPath = '';
        }, 1100);

        overlay._timers = [callbackTimer, fadeTimer, cleanupTimer];
    }

    // Expose globally for theme-toggle to use
    window.playRevealTransition = playRevealTransition;

})();
