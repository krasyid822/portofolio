/**
 * acknowledgment-loader.js
 * Dynamically loads certificates / awards from acknowledgment.json
 * and renders them as certificate cards in the projects page.
 */
(function () {
    'use strict';

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    fetch('./acknowledgment.json')
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('acknowledgment-container');
            if (!container) return;

            // If no data or empty array, hide the entire section
            if (!data || data.length === 0) {
                const section = document.getElementById('acknowledgment-section');
                if (section) section.style.display = 'none';
                return;
            }

            container.innerHTML = '';
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'acknowledgment-card';

                // Image
                const img = document.createElement('img');
                img.className = 'acknowledgment-img';
                img.src = item.image || '';
                img.alt = item.title + ' — ' + item.issuer;
                img.loading = 'lazy';
                img.onerror = function () {
                    this.style.display = 'none';
                };
                card.appendChild(img);

                // Info wrapper
                const info = document.createElement('div');
                info.className = 'acknowledgment-info';

                // Title
                const title = document.createElement('h3');
                title.className = 'acknowledgment-title';
                title.textContent = item.title;
                info.appendChild(title);

                // Issuer + date
                const meta = document.createElement('div');
                meta.className = 'acknowledgment-meta';
                meta.textContent = (item.issuer || '') + (item.date ? ' • ' + item.date : '');
                info.appendChild(meta);

                // Description
                if (item.description) {
                    const desc = document.createElement('p');
                    desc.className = 'acknowledgment-desc';
                    desc.textContent = item.description;
                    info.appendChild(desc);
                }

                // Link (if url exists)
                if (item.url) {
                    const link = document.createElement('a');
                    link.href = item.url;
                    link.className = 'acknowledgment-link';
                    link.setAttribute('data-popup', '');
                    link.setAttribute('data-title', item.title || 'Lihat Sertifikat');
                    link.textContent = 'Lihat Sertifikat';
                    link.innerHTML += ' <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7rem;"></i>';
                    info.appendChild(link);
                }

                card.appendChild(info);
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Gagal memuat acknowledgment:', error);
            const section = document.getElementById('acknowledgment-section');
            if (section) section.style.display = 'none';
        });

})();
