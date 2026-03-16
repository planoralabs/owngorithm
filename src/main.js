// ============================================
// OWNGORITHM — Main Entry Point
// ============================================

import './style.css';
import './firebase.js';
import { renderAllWidgets, handleResize, updateYoutubeWidget } from './widgets.js';
import { loadSavedTheme, initThemeCarousel, setTheme } from './themes.js';
import { initYoutubeAuth } from './youtubeService.js';
import { 
    watchAuthState, 
    signInWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    logout 
} from './authService.js';
import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Sortable from 'sortablejs';

let isSimulation = true; // Iniciamos em modo simulação por padrão para liberar testes

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

    // Setup Auth UI
    initAuthUI();

    // Setup toolbar toggle
    initToolbar();

    // Watch Auth State
    watchAuthState((user, profile) => {
        updateUIForAuth(user, profile);
    });

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

    // Reset Button Logic
    initResetButton();

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

            // Controle de Edição: Liberado para todos inicialmente
            const canEdit = true; 

            if (!canEdit) {
                alert("O modo de edição está disponível apenas para o dono do algoritmo ou em modo de simulação.");
                return;
            }

            const isActive = toolbarContainer.classList.toggle('active');
            document.body.classList.toggle('edit-mode', isActive);
            toggleSortable(isActive);
        });
    }


// ... inside initToolbar before the save listener ...

    // Save button logic
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
        btnSave.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // Visual feedback
            btnSave.classList.add('saving');

            // Actual Save to Firestore
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const tiles = Array.from(document.querySelectorAll('.tile')).map(t => ({
                        id: t.id,
                        size: t.dataset.size || 'normal',
                        display: t.style.display
                    }));

                    await setDoc(doc(db, 'users', currentUser.uid, 'config', 'dashboard'), {
                        tiles: tiles,
                        updatedAt: serverTimestamp()
                    });
                    console.log('Algoritmo salvo na nuvem!');
                } catch (err) {
                    console.error("Erro ao salvar no Firestore:", err);
                }
            } else {
                console.log('Salvando localmente (usuário não logado)');
            }

            setTimeout(() => {
                btnSave.classList.remove('saving');
                // Close toolbar after saving
                toolbarContainer?.classList.remove('active');
                document.body.classList.remove('edit-mode');
                toggleSortable(false);
            }, 800);
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
let sortableInstance = null;
function initSortable() {
    const grid = document.getElementById('dashboard');
    if (!grid) return;

    sortableInstance = Sortable.create(grid, {
        animation: 500,
        easing: "cubic-bezier(0.2, 1, 0.3, 1)",
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        disabled: !document.body.classList.contains('edit-mode'), // Initial state
        onStart: () => {
            document.body.classList.add('is-sorting');
        },
        onEnd: () => {
            document.body.classList.remove('is-sorting');
            handleResize();
        }
    });
}

function toggleSortable(active) {
    if (sortableInstance) {
        sortableInstance.option('disabled', !active);
    }
}


// ---- Tile Controls (Delete, Duplicate, Resize) ----
function initTileControls() {
    const grid = document.getElementById('dashboard');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
        // Only allow edits in edit-mode
        if (!document.body.classList.contains('edit-mode')) return;

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
            initTileExpansion();
        }

        if (btn.classList.contains('btn-resize')) {
            const currentTag = tile.dataset.size || 'normal';
            const sizes = ['normal', 'wide', 'tall', 'large'];
            const nextIdx = (sizes.indexOf(currentTag) + 1) % sizes.length;
            const nextSize = sizes[nextIdx];

            tile.dataset.size = nextSize;
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
            // DISALLOW expansion in edit-mode
            if (document.body.classList.contains('edit-mode')) return;

            // Prevent expanding if already expanded
            if (grid.classList.contains('is-expanded')) return;

            tile.classList.add('active-tile');
            grid.classList.add('is-expanded');
            container.classList.add('is-expanded');

            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });

            setTimeout(() => {
                handleResize();
            }, 550);
        });
    });

    backBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        const activeTile = document.querySelector('.active-tile');
        if (activeTile) activeTile.classList.remove('active-tile');

        grid.classList.remove('is-expanded');
        container.classList.remove('is-expanded');

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

    // Handle Start Simulation
    startBtns.forEach(btn => {
        btn?.addEventListener('click', (e) => {
            if (btn.id === 'btn-hero-start') {
                isSimulation = true;
                // Auto-skip onboarding for simulation if desired, or just show overlay
                overlay.classList.add('active');
            } else {
                isSimulation = false;
                overlay.classList.add('active');
            }
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


// ---- Authentication UI & Logic ----
function initAuthUI() {
    const authOverlay = document.getElementById('auth-modal-overlay');
    const ethicsOverlay = document.getElementById('ethics-modal-overlay');
    
    // Open Login
    document.getElementById('btn-open-login')?.addEventListener('click', () => {
        showAuthContent('login');
        authOverlay.classList.add('active');
    });

    // Close Modals
    document.getElementById('btn-close-auth')?.addEventListener('click', () => authOverlay.classList.remove('active'));
    document.getElementById('btn-close-ethics')?.addEventListener('click', () => ethicsOverlay.classList.remove('active'));
    document.getElementById('btn-close-ethics-bottom')?.addEventListener('click', () => ethicsOverlay.classList.remove('active'));

    // Switch between Login/Register
    document.getElementById('link-to-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthContent('register');
    });
    document.getElementById('link-to-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthContent('login');
    });

    // Ethics Link
    document.getElementById('link-ethics')?.addEventListener('click', (e) => {
        e.preventDefault();
        ethicsOverlay.classList.add('active');
    });

    // Google Sign In
    document.getElementById('btn-google-login')?.addEventListener('click', async () => {
        try {
            await signInWithGoogle();
            authOverlay.classList.remove('active');
            finishOnboardingAction();
        } catch (e) { alert(e.message); }
    });
    document.getElementById('btn-google-register')?.addEventListener('click', async () => {
        try {
            await signInWithGoogle();
            authOverlay.classList.remove('active');
            finishOnboardingAction();
        } catch (e) { alert(e.message); }
    });

    // Email Login
    document.getElementById('form-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        try {
            await loginWithEmail(email, pass);
            authOverlay.classList.remove('active');
            finishOnboardingAction();
        } catch (e) { alert(e.message); }
    });

    // Email Register
    document.getElementById('form-register')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const pass = document.getElementById('register-password').value;
        try {
            await registerWithEmail(email, pass, name);
            authOverlay.classList.remove('active');
            finishOnboardingAction();
        } catch (e) { alert(e.message); }
    });
}

function showAuthContent(type) {
    const loginContent = document.getElementById('auth-login-content');
    const registerContent = document.getElementById('auth-register-content');
    if (type === 'login') {
        loginContent.classList.remove('hidden');
        registerContent.classList.add('hidden');
    } else {
        loginContent.classList.add('hidden');
        registerContent.classList.remove('hidden');
    }
}

function updateUIForAuth(user, profile) {
    const landing = document.getElementById('landing-page');
    const profileName = document.querySelector('.profile-name');
    const profileImg = document.getElementById('profile-img');
    const sidebar = document.getElementById('profile-sidebar');

    if (user) {
        // Logged in
        if (profileName) profileName.textContent = profile?.displayName || user.displayName || 'Usuário';
        if (profileImg && (profile?.photoURL || user.photoURL)) {
            profileImg.src = profile?.photoURL || user.photoURL;
        }
        
        // Handle theme if saved
        if (profile?.theme) {
            setTheme(profile.theme);
        }

        // Add Logout button if it doesn't exist
        if (!document.getElementById('btn-logout')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'btn-logout';
            logoutBtn.className = 'btn-logout';
            logoutBtn.textContent = 'Sair da Conta';
            logoutBtn.addEventListener('click', () => {
                logout();
                window.location.reload(); // Simple way to reset state
            });
            sidebar?.appendChild(logoutBtn);
        }

        // Auto-skip landing if logged in
        landing?.classList.add('hidden');
        document.body.classList.add('onboarding-done');
    }
}

function initResetButton() {
    const resetBtn = document.getElementById('btn-reset-app');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("Deseja resetar toda a experiência? Isso limpará seus dados locais e voltará para a tela inicial.")) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }
}

function finishOnboardingAction() {
    isSimulation = false;
    const landing = document.getElementById('landing-page');
    landing?.classList.add('hidden');
    document.body.classList.add('onboarding-done');
    localStorage.setItem('owngorithm-onboarding-done', 'true');
    setTimeout(() => handleResize(), 1000);
}
