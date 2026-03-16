// ============================================
// OWNGORITHM — Main Entry Point
// ============================================

import './style.css';
import { renderAllWidgets, handleResize, updateYoutubeWidget } from './widgets.js';
import { loadSavedTheme, initThemeCarousel } from './themes.js';
import { initYoutubeAuth } from './youtubeService.js';
import Sortable from 'sortablejs';

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

    // Initialize Widget Management Panel
    initWidgetManager();
    // Initialize Drag and Drop (Sortable)
    initSortable();

    // Initialize Tile Controls (Delete, Duplicate, Resize)
    initTileControls();

    // Initialize Onboarding
    initOnboarding();
});


// ---- Toolbar ----
// ---- Toolbar & Panels ----
function initToolbar() {
    const btnDesign = document.getElementById('btn-design');
    const btnWidgets = document.getElementById('btn-widgets');
    const panelDesign = document.getElementById('panel-design');
    const panelWidgets = document.getElementById('panel-widgets');

    function closeAllPanels() {
        panelDesign?.setAttribute('data-open', 'false');
        panelWidgets?.setAttribute('data-open', 'false');
        btnDesign?.classList.remove('active');
        btnWidgets?.classList.remove('active');
    }

    if (btnDesign && panelDesign) {
        btnDesign.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = panelDesign.getAttribute('data-open') === 'true';
            closeAllPanels();
            if (!isOpen) {
                panelDesign.setAttribute('data-open', 'true');
                btnDesign.classList.add('active');
            }
        });
    }

    if (btnWidgets && panelWidgets) {
        btnWidgets.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = panelWidgets.getAttribute('data-open') === 'true';
            closeAllPanels();
            if (!isOpen) {
                panelWidgets.setAttribute('data-open', 'true');
                btnWidgets.classList.add('active');
            }
        });
    }

    // Toolbar trigger (expand/collapse)
    const toolbarContainer = document.getElementById('toolbar-container');
    const toolbarTrigger = document.getElementById('toolbar-trigger');
    if (toolbarTrigger && toolbarContainer) {
        toolbarTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toolbarContainer.classList.toggle('active');
        });
    }

    // Close panels on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#toolbar-container')) {
            closeAllPanels();
            toolbarContainer?.classList.remove('active');
        }
    });

    // Mobile Preview (Web) toggle
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            document.body.classList.toggle('mobile-preview-active');
            
            // Adjust canvas/widgets if needed after expansion/compression
            setTimeout(() => {
                handleResize();
            }, 600);
        });
    }
}


// ---- Widget Manager (Show/Hide) ----
function initWidgetManager() {
    const list = document.getElementById('widget-manager-list');
    if (!list) return;

    const btns = list.querySelectorAll('.widget-manager-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const widgetId = btn.dataset.widgetId;
            const widget = document.getElementById(widgetId);
            if (!widget) return;

            const isActive = btn.classList.toggle('active');
            widget.style.display = isActive ? '' : 'none';
            
            // Re-render because canvas sizes might have changed
            handleResize();
        });
    });
}


// ---- Sortable (Drag & Drop) ----
function initSortable() {
    const grid = document.getElementById('dashboard');
    if (!grid) return;

    Sortable.create(grid, {
        animation: 500, // Longer for smoother reorganization
        easing: "cubic-bezier(0.2, 1, 0.3, 1)", 
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        fallbackTolerance: 3, 
        onStart: () => {
            document.body.classList.add('is-sorting');
        },
        onEnd: () => {
            document.body.classList.remove('is-sorting');
            handleResize();
        }
    });
}


// ---- Tile Controls (Delete, Duplicate, Resize) ----
function initTileControls() {
    const grid = document.getElementById('dashboard');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.control-btn');
        if (!btn) return;

        e.stopPropagation();
        const tile = btn.closest('.tile');
        
        if (btn.classList.contains('btn-delete')) {
            tile.style.opacity = '0';
            tile.style.transform = 'scale(0.8)';
            setTimeout(() => {
                tile.remove();
                handleResize();
            }, 300);
        }

        if (btn.classList.contains('btn-duplicate')) {
            const clone = tile.cloneNode(true);
            clone.classList.remove('active-tile');
            clone.style.animation = 'none';
            clone.style.opacity = '1';
            clone.style.transform = 'none';
            tile.after(clone);
            handleResize();
            // Need to re-init expansion if we want clones to expand
            initTileExpansion(); 
        }

        if (btn.classList.contains('btn-resize')) {
            const currentTag = tile.dataset.size || 'normal';
            const sizes = ['normal', 'wide', 'tall', 'large'];
            const nextIdx = (sizes.indexOf(currentTag) + 1) % sizes.length;
            const nextSize = sizes[nextIdx];

            tile.dataset.size = nextSize;
            
            // Apply CSS spans based on dataset size
            // This requires CSS Mapping
            tile.classList.remove('size-normal', 'size-wide', 'size-tall', 'size-large');
            tile.classList.add(`size-${nextSize}`);
            
            handleResize();
        }
    });
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
// ---- Onboarding & Landing Page ----
function initOnboarding() {
    const landing = document.getElementById('landing-page');
    const overlay = document.getElementById('onboarding-overlay');
    const startBtns = [document.getElementById('btn-start-landing'), document.getElementById('btn-hero-start')];
    
    if (!landing || !overlay) return;

    // Handle Start
    startBtns.forEach(btn => {
        btn?.addEventListener('click', () => {
            overlay.classList.add('active');
        });
    });

    // Step Navigation
    const nextBtns = overlay.querySelectorAll('.btn-next');
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = btn.dataset.next;
            if (nextStep) {
                overlay.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
                overlay.querySelector(`.onboarding-step[data-step="${nextStep}"]`).classList.add('active');
            }
        });
    });

    // Name Preview
    const nameInput = document.getElementById('ob-input-name');
    const namePreview = document.getElementById('ob-preview-name');
    const profileName = document.querySelector('.profile-name');
    
    nameInput?.addEventListener('input', (e) => {
        const val = e.target.value || 'Seu Nome';
        if (namePreview) namePreview.textContent = val;
        if (profileName) profileName.textContent = val;
    });

    // Widget Selection
    const widgetOpts = overlay.querySelectorAll('.widget-opt');
    widgetOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            opt.classList.toggle('selected');
        });
    });

    // Bento Hover Logic (Landing Page)
    const bentoItems = document.querySelectorAll('.bento-item');
    bentoItems.forEach(item => {
        let timer;
        item.addEventListener('mouseenter', () => {
            // Short delay before internal expansion
            timer = setTimeout(() => {
                item.classList.add('expanded');
            }, 600); // 600ms seems intuitive for "intent"
        });

        item.addEventListener('mouseleave', () => {
            clearTimeout(timer);
            item.classList.remove('expanded');
        });
    });

    // Theme Selection (Onboarding)
    import('./themes.js').then(ThemeModule => {
        const obThemeCarousel = document.getElementById('ob-theme-carousel');
        obThemeCarousel?.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                ThemeModule.setTheme(card.dataset.themeId);
                // Sync with main carousel active state
                obThemeCarousel.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    });

    // Finish
    const finishBtn = document.getElementById('btn-finish-onboarding');
    finishBtn?.addEventListener('click', () => {
        // Apply Widget selection
        const selectedWidgets = Array.from(overlay.querySelectorAll('.widget-opt.selected')).map(opt => opt.dataset.widget);
        const allWidgets = overlay.querySelectorAll('.widget-opt');
        
        // If nothing selected, maybe keep default? Let's hide unselected.
        allWidgets.forEach(opt => {
            const widgetId = opt.dataset.widget;
            const widget = document.getElementById(widgetId);
            const managerBtn = document.querySelector(`.widget-manager-btn[data-widget-id="${widgetId}"]`);
            
            if (widget) {
                const isSelected = opt.classList.contains('selected');
                widget.style.display = isSelected ? '' : 'none';
                managerBtn?.classList.toggle('active', isSelected);
            }
        });

        // Hide UI
        overlay.classList.remove('active');
        landing.classList.add('hidden');
        
        // Final resize to fix layout
        setTimeout(() => handleResize(), 1000);
        
        // Save onboarding completed
        localStorage.setItem('owngorithm-onboarding-done', 'true');
        document.body.classList.add('onboarding-done');
    });

    // Check if onboarding was already done
    if (localStorage.getItem('owngorithm-onboarding-done') === 'true') {
        landing.style.display = 'none';
        document.body.classList.add('onboarding-done');
    }
}
