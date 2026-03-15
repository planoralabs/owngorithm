// ============================================
// OWNGORITHM — Main Entry Point
// ============================================

import './style.css';
import { renderAllWidgets, handleResize } from './widgets.js';
import { loadSavedTheme, initThemeCarousel } from './themes.js';

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    // Load theme
    loadSavedTheme();

    // Initialize theme carousel & re-render widgets on theme change
    initThemeCarousel(() => {
        // Small delay for CSS transition to apply new colors
        setTimeout(() => renderAllWidgets(), 50);
    });

    // Render all widgets
    renderAllWidgets();

    // Setup toolbar toggle
    initToolbar();

    // Resize handler
    window.addEventListener('resize', handleResize);

    // Stagger tile animations
    staggerTileAnimations();
});


// ---- Toolbar ----
function initToolbar() {
    const btnDesign = document.getElementById('btn-design');
    const panel = document.getElementById('toolbar-panel');

    if (btnDesign && panel) {
        btnDesign.addEventListener('click', () => {
            const isOpen = panel.getAttribute('data-open') === 'true';
            panel.setAttribute('data-open', isOpen ? 'false' : 'true');
            btnDesign.classList.toggle('active', !isOpen);
        });
    }

    // Share button (copy URL)
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
        btnShare.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Owngorithm — Meu Algoritmo Pessoal',
                    url: window.location.href,
                });
            } else {
                navigator.clipboard?.writeText(window.location.href);
                btnShare.style.color = 'var(--positive)';
                setTimeout(() => btnShare.style.color = '', 1500);
            }
        });
    }

    // Fullscreen toggle
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.();
            } else {
                document.exitFullscreen?.();
            }
        });
    }
}


// ---- Stagger Animations ----
function staggerTileAnimations() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile, i) => {
        tile.style.animationDelay = `${0.08 * i}s`;
    });
}
