/**
 * projects-loader.js
 * Dynamically loads featured projects from projects.json
 * and renders them as featured cards.
 */
(function () {
    'use strict';

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
                card.innerHTML = `
                    <img src="${project.thumbnail}" alt="${project.name}" class="featured-thumb" loading="lazy">
                    <div class="featured-content">
                        <span class="featured-badge">${project.category}</span>
                        <h3 class="featured-name">${project.name}</h3>
                        <p class="featured-desc">${project.description}</p>
                        <div class="featured-footer">
                            <span style="font-family: var(--pixel-font); font-size: 0.75rem; color: var(--text-muted);">${project.tech}</span>
                            <a href="${project.url}" data-popup data-title="${project.name}" class="featured-link">
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
