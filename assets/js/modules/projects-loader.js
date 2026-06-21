/**
 * projects-loader.js
 * Dynamically loads featured projects from projects.json
 * and renders them as featured cards.
 * Supports both image thumbnails and video thumbnails.
 */
(function () {
    'use strict';

    // Escape HTML to prevent XSS from project data
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Dynamically load projects from projects.json
    fetch('./projects.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('projects-container');
            if (!container) return;
            container.innerHTML = '';
            data.forEach(project => {
                const card = document.createElement('div');
                card.className = 'featured-card';

                // Build thumbnail: use image/gif linked to the video if project has a "video" field, else normal image
                let thumbHtml;
                if (project.video) {
                    thumbHtml = `
                        <a href="${escapeHtml(project.video)}" data-popup data-title="${escapeHtml(project.name)} — Demo Video" class="featured-thumb-link">
                            <img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.name)}" class="featured-thumb" loading="lazy">
                        </a>`;
                } else {
                    thumbHtml = `<img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.name)}" class="featured-thumb" loading="lazy">`;
                }

                // Handle category: can be a string or an array of categories
                let categoryHtml = '';
                if (Array.isArray(project.category)) {
                    categoryHtml = `<div class="featured-badges">` +
                        project.category.map(cat => `<span class="featured-badge">${escapeHtml(cat)}</span>`).join('') +
                        `</div>`;
                } else {
                    categoryHtml = `<span class="featured-badge">${escapeHtml(project.category)}</span>`;
                }

                // Handle tech stack: can be a string or an array of technologies
                let techHtml = '';
                if (Array.isArray(project.tech)) {
                    techHtml = project.tech.map(t => escapeHtml(t)).join(' · ');
                } else {
                    techHtml = escapeHtml(project.tech);
                }

                card.innerHTML = `
                    ${thumbHtml}
                    <div class="featured-content">
                        ${categoryHtml}
                        <h3 class="featured-name">${escapeHtml(project.name)}</h3>
                        <p class="featured-desc">${escapeHtml(project.description)}</p>
                        <div class="featured-footer">
                            <span style="font-family: var(--pixel-font); font-size: 0.75rem; color: var(--text-muted);">${techHtml}</span>
                            <a href="${escapeHtml(project.url)}" data-popup data-title="${escapeHtml(project.name)}" class="featured-link">
                                Launch <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i>
                            </a>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            // Append the "Lihat Lebih Banyak" card pointing to rasyidkurniawan.my.id
            const moreCard = document.createElement('div');
            moreCard.className = 'featured-card featured-more-card';
            moreCard.innerHTML = `
                <a href="https://rasyidkurniawan.my.id" data-popup data-title="rasyidkurniawan.my.id" class="featured-more-link">
                    <div class="featured-more-content">
                        <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 2.5rem; margin-bottom: 16px; color: var(--accent-color);"></i>
                        <span class="featured-more-text">LIHAT LEBIH BANYAK</span>
                        <span class="featured-more-sub">rasyidkurniawan.my.id</span>
                    </div>
                </a>
            `;
            container.appendChild(moreCard);
        })
        .catch(error => console.error('Gagal memuat proyek:', error));

})();
