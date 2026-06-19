/**
 * service-worker.js
 * Registers the PWA Service Worker on page load.
 */
(function () {
    'use strict';

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => {
                    console.log('PWA ServiceWorker registered. Scope: ', reg.scope);
                })
                .catch(err => {
                    console.error('PWA ServiceWorker registration failed: ', err);
                });
        });
    }

})();
