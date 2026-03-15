// ============================================
// OWNGORITHM — Main Entry Point
// ============================================

import './style.css';
import { renderAllWidgets, handleResize, updateYoutubeWidget } from './widgets.js';
import { loadSavedTheme, initThemeCarousel } from './themes.js';
import { initYoutubeAuth } from './youtubeService.js';

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

    // Initialize tile expansion logic
    initTileExpansion();

    // Initialize YouTube Auth
    initYoutubeAuth((newData) => {
        updateYoutubeWidget(newData);
    });
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


// ---- Tile Expansion Logic ----
function initTileExpansion() {
    const grid = document.getElementById('dashboard');
    const container = document.querySelector('.dashboard-grid-container');
    const backBtn = document.getElementById('btn-back');
    const tiles = document.querySelectorAll('.tile');

    if (!grid || !container || !backBtn) return;

    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            // Prevent expanding if already expanded
            if (grid.classList.contains('is-expanded')) return;

            // Mark this tile as active
            tile.classList.add('active-tile');
            grid.classList.add('is-expanded');
            container.classList.add('is-expanded');

            // Scroll to top of grid
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Re-render widgets after expansion transition
            setTimeout(() => {
                handleResize(); // Uses existing resize logic to recalibrate canvases
            }, 550);
        });
    });

    backBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent re-triggering tile click
        
        const activeTile = document.querySelector('.active-tile');
        if (activeTile) activeTile.classList.remove('active-tile');

        grid.classList.remove('is-expanded');
        container.classList.remove('is-expanded');

        // Re-render widgets after collapse transition
        setTimeout(() => {
            handleResize();
        }, 550);
    });
}
