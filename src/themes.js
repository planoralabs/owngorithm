// ============================================
// OWNGORITHM — Theme Engine
// Based on own.page theme system
// ============================================

const themes = ['creme', 'charon', 'mars', 'earth', 'frosty'];

let currentTheme = 'creme';

export function getCurrentTheme() {
    return currentTheme;
}

export function setTheme(themeId) {
    if (!themes.includes(themeId)) return;
    currentTheme = themeId;
    document.documentElement.setAttribute('data-theme', themeId);
    
    // Update active state on theme cards
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.themeId === themeId);
    });

    // Save preference
    try {
        localStorage.setItem('owngorithm-theme', themeId);
    } catch (e) { /* ignore */ }
}

export function loadSavedTheme() {
    try {
        const saved = localStorage.getItem('owngorithm-theme');
        if (saved && themes.includes(saved)) {
            setTheme(saved);
            return;
        }
    } catch (e) { /* ignore */ }
    setTheme('creme');
}

export function initThemeCarousel(onThemeChange) {
    const carousel = document.getElementById('theme-carousel');
    if (!carousel) return;

    carousel.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.dataset.themeId;
            setTheme(themeId);
            if (onThemeChange) onThemeChange();
        });
    });
}
