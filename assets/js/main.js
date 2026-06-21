/**
 * main.js
 * Entry point for the portfolio site.
 * Loads all modules in dependency order.
 *
 * Dependency order:
 * 1. scan-transition.js       - Canvas scan-line (no deps)
 * 2. theme-transition.js      - Circular reveal (no deps)
 * 3. page-router.js           - SPA routing (depends on scan-transition)
 * 4. magnetic-cursor.js       - Mouse effect (no deps)
 * 5. balloon-popup.js         - Iframe popup (no deps)
 * 6. theme-toggle.js          - Theme toggle (depends on theme-transition)
 * 7. projects-loader.js       - Projects JSON loader (no deps)
 * 8. acknowledgment-loader.js - Certificates JSON loader (no deps)
 * 9. service-worker.js        - PWA registration (no deps)
 *
 * Using document.write for synchronous loading ensures
 * proper execution order without race conditions.
 */

(function () {
    'use strict';

    var scripts = [
        'assets/js/modules/scan-transition.js',
        'assets/js/modules/theme-transition.js',
        'assets/js/modules/page-router.js',
        'assets/js/modules/magnetic-cursor.js',
        'assets/js/modules/balloon-popup.js',
        'assets/js/modules/theme-toggle.js',
        'assets/js/modules/projects-loader.js',
        'assets/js/modules/acknowledgment-loader.js',
        'assets/js/modules/service-worker.js',
        'assets/js/modules/scroll-nav.js',
    ];

    scripts.forEach(function (src) {
        var script = document.createElement('script');
        script.src = src;
        script.defer = false;
        document.body.appendChild(script);
    });

})();
