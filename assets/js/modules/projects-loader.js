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

                card.innerHTML = `
                    ${thumbHtml}
                    <div class="featured-content">
                        <span class="featured-badge">${escapeHtml(project.category)}</span>
                        <h3 class="featured-name">${escapeHtml(project.name)}</h3>
                        <p class="featured-desc">${escapeHtml(project.description)}</p>
                        <div class="featured-footer">
                            <span style="font-family: var(--pixel-font); font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(project.tech)}</span>
                            <a href="${escapeHtml(project.url)}" data-popup data-title="${escapeHtml(project.name)}" class="featured-link">
                                Launch <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i>
                            </a>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => console.error('Gagal memuat proyek:', error));

})();
