/**
 * scroll-nav.js
 * Behavior di mobile (≤768px):
 *  - Tampil saat halaman pertama load
 *  - Auto-hide setelah AUTO_HIDE_DELAY ms jika tidak ada interaksi
 *  - Muncul kembali saat scroll ke atas
 *  - Sembunyi saat scroll ke bawah (setelah MIN_SCROLL_TO_HIDE px)
 *  - Sembunyi saat klik area kosong (bukan link/button/interaktif)
 */

(function () {
    'use strict';

    var MOBILE_BREAKPOINT  = 768;
    var DELTA_THRESHOLD    = 8;    // px minimum per event agar tidak jitter
    var MIN_SCROLL_TO_HIDE = 60;   // px dari atas sebelum nav boleh sembunyi
    var SHOW_THRESHOLD     = 30;   // px dari atas → paksa tampilkan nav
    var AUTO_HIDE_DELAY    = 2500; // ms sebelum auto-hide setelah load/show

    var header = document.querySelector('header.top-nav');
    var footer = document.querySelector('footer.main-footer');

    if (!header || !footer) return;

    var lastScrollY    = 0;
    var ticking        = false;
    var currentTarget  = null;
    var isHidden       = false;
    var autoHideTimer  = null;

    /* ─── Core show / hide ─── */

    function showNav() {
        if (!isHidden) return;
        isHidden = false;
        header.classList.remove('nav-hidden');
        footer.classList.remove('nav-hidden');
    }

    function hideNav() {
        if (isHidden) return;
        isHidden = true;
        clearAutoHide();
        header.classList.add('nav-hidden');
        footer.classList.add('nav-hidden');
    }

    /* ─── Auto-hide timer ─── */

    function scheduleAutoHide() {
        clearAutoHide();
        autoHideTimer = setTimeout(function () {
            if (window.innerWidth <= MOBILE_BREAKPOINT) hideNav();
        }, AUTO_HIDE_DELAY);
    }

    function clearAutoHide() {
        if (autoHideTimer) {
            clearTimeout(autoHideTimer);
            autoHideTimer = null;
        }
    }

    /* ─── Scroll handler ─── */

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }

    function update() {
        ticking = false;

        if (window.innerWidth > MOBILE_BREAKPOINT) {
            showNav();
            lastScrollY = 0;
            return;
        }

        var scrollEl = currentTarget;
        if (!scrollEl) return;

        var currentY = scrollEl.scrollTop;
        var delta    = currentY - lastScrollY;

        // Paksa tampilkan saat mendekati atas
        if (currentY <= SHOW_THRESHOLD) {
            if (isHidden) {
                showNav();
                scheduleAutoHide();
            }
            lastScrollY = currentY;
            return;
        }

        if (Math.abs(delta) < DELTA_THRESHOLD) return;

        if (delta > 0 && currentY >= MIN_SCROLL_TO_HIDE) {
            hideNav();
        } else if (delta < 0) {
            if (isHidden) {
                showNav();
                scheduleAutoHide();
            }
        }

        lastScrollY = currentY;
    }

    /* ─── Tap area kosong → hide ─── */

    function onTapContent(e) {
        if (window.innerWidth > MOBILE_BREAKPOINT) return;

        // Jika klik pada header, footer, atau elemen interaktif → batal
        var interactiveTags = ['A', 'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA'];
        var target = e.target;

        if (header.contains(target) || footer.contains(target)) return;
        if (interactiveTags.indexOf(target.tagName) !== -1) return;
        if (target.closest && target.closest('a, button, input, label, select, textarea')) return;

        // Toggle: sembunyi jika tampil, tampil jika sembunyi
        if (isHidden) {
            showNav();
            scheduleAutoHide();
        } else {
            hideNav();
        }
    }

    /* ─── Attach scroll listener ke page aktif ─── */

    function attachToActivePage() {
        if (currentTarget) {
            currentTarget.removeEventListener('scroll', onScroll);
            currentTarget.removeEventListener('click', onTapContent);
        }

        var active = document.querySelector('.page-section:not(.inactive)');
        if (!active) return;

        currentTarget = active;
        lastScrollY   = active.scrollTop;

        active.addEventListener('scroll', onScroll, { passive: true });
        active.addEventListener('click', onTapContent);
    }

    /* ─── Observer: ganti halaman ─── */

    var observer = new MutationObserver(function (mutations) {
        var relevant = mutations.some(function (m) {
            return m.type === 'attributes' && m.attributeName === 'class';
        });
        if (relevant) {
            // Tampilkan nav sebentar saat pindah halaman, lalu auto-hide
            showNav();
            scheduleAutoHide();
            attachToActivePage();
        }
    });

    document.querySelectorAll('.page-section').forEach(function (section) {
        observer.observe(section, { attributes: true });
    });

    /* ─── Init ─── */

    function initNav() {
        attachToActivePage();
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            // Tampil dulu, lalu auto-hide
            scheduleAutoHide();
        }
    }

    initNav();

    window.addEventListener('resize', function () {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            clearAutoHide();
            showNav();
        } else if (isHidden) {
            // Masuk ke mobile dalam kondisi hidden → tetap hidden
        }
    }, { passive: true });

})();
