/**
 * magnetic-cursor.js
 * Cursor magnetic attraction effect.
 * Elements subtly pull toward the cursor when within range.
 */
(function () {
    'use strict';

    const MAGNETIC_SELECTOR = [
        '.retro-card',
        '.featured-card',
        '.nav-links a',
        '.theme-toggle-btn',
        '.retro-link-btn',
        '.featured-link',
        '.retro-badge',
    ].join(', ');

    function getMagneticElements() {
        return document.querySelectorAll(MAGNETIC_SELECTOR);
    }

    let animFrame;
    document.addEventListener('mousemove', (e) => {
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(() => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            getMagneticElements().forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) return;

                const elX = rect.left + rect.width / 2;
                const elY = rect.top + rect.height / 2;
                const distanceX = mouseX - elX;
                const distanceY = mouseY - elY;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                const radius = 130;
                if (distance < radius) {
                    const strength = 0.12;
                    const pullX = (distanceX * strength * (1 - distance / radius)).toFixed(2);
                    const pullY = (distanceY * strength * (1 - distance / radius)).toFixed(2);
                    el.style.transform = `translate(${pullX}px, ${pullY}px)`;
                    el.style.transition = 'transform 0.15s ease-out';
                } else {
                    el.style.transform = '';
                    el.style.transition = 'transform 0.4s ease-out';
                }
            });
        });
    });

    document.addEventListener('mouseleave', () => {
        getMagneticElements().forEach(el => {
            el.style.transform = '';
            el.style.transition = 'transform 0.4s ease-out';
        });
    });

})();
