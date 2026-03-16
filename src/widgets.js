// ============================================
// OWNGORITHM — Widget Renderers
// Canvas 2D charts and dynamic widget content
// ============================================

import {
    spotifyData,
    youtubeData,
    readingData,
    navigationData,
    mindMapData,
    generateHeatmapData,
    focusData,
    intentionData,
} from './data.js';

// ---- Utility ----
function getComputedThemeColor(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Use remaining space in parent
    const style = getComputedStyle(canvas.parentElement);
    const padTop = parseFloat(style.paddingTop);
    const padBot = parseFloat(style.paddingBottom);
    
    canvas.style.width = '100%';
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    return { canvas, ctx, w: canvas.offsetWidth, h: canvas.offsetHeight };
}


// ---- Mind Map (Bubble Cloud) ----
export function renderMindMap() {
    const setup = setupCanvas('canvas-mindmap');
    if (!setup) return;
    const { ctx, w, h } = setup;

    const colors = [
        getComputedThemeColor('--chart-1'),
        getComputedThemeColor('--chart-2'),
        getComputedThemeColor('--chart-3'),
        getComputedThemeColor('--chart-4'),
        getComputedThemeColor('--chart-5'),
    ];

    mindMapData.bubbles.forEach((b, i) => {
        const x = b.x * w;
        const y = b.y * h;
        const r = b.size * Math.min(w, h) * 0.16;
        const color = colors[i % colors.length];

        // Glow/shadow
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = r * 0.4;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(x, y, r * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();

        // Main bubble
        ctx.save();
        ctx.globalAlpha = 0.2 + b.size * 0.35;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();

        // Border
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Label
        ctx.save();
        ctx.globalAlpha = 0.9;
        const fontSize = Math.max(10, r * 0.32);
        ctx.font = `600 ${fontSize}px var(--font-sans)`;
        ctx.fillStyle = getComputedThemeColor('--heading');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Add a subtle white outline to text for readability over connection lines
        ctx.strokeStyle = getComputedThemeColor('--bg-tile');
        ctx.lineWidth = 3;
        ctx.strokeText(b.label, x, y);
        ctx.fillText(b.label, x, y);
        ctx.restore();
    });

    // Connection lines
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = getComputedThemeColor('--heading');
    ctx.lineWidth = 1;
    for (let i = 0; i < mindMapData.bubbles.length; i++) {
        for (let j = i + 1; j < mindMapData.bubbles.length; j++) {
            const a = mindMapData.bubbles[i];
            const bub = mindMapData.bubbles[j];
            const dist = Math.hypot(a.x - bub.x, a.y - bub.y);
            if (dist < 0.35) {
                ctx.beginPath();
                ctx.moveTo(a.x * w, a.y * h);
                ctx.lineTo(bub.x * w, bub.y * h);
                ctx.stroke();
            }
        }
    }
    ctx.restore();
}


// ---- YouTube (Donut Chart) ----
export function renderYoutube() {
    const setup = setupCanvas('canvas-youtube');
    if (!setup) return;
    const { ctx, w, h } = setup;

    const colors = [
        getComputedThemeColor('--chart-1'),
        getComputedThemeColor('--chart-2'),
        getComputedThemeColor('--chart-3'),
        getComputedThemeColor('--chart-4'),
        getComputedThemeColor('--chart-5'),
    ];

    const cx = w * 0.5;
    const cy = h * 0.4;
    const outerR = Math.min(w * 0.35, h * 0.35);
    const innerR = outerR * 0.65;

    const total = youtubeData.categories.reduce((s, c) => s + c.hours, 0);
    let startAngle = -Math.PI / 2;

    youtubeData.categories.forEach((cat, i) => {
        const sliceAngle = (cat.hours / total) * Math.PI * 2;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // Label (only for larger slices)
        const midAngle = startAngle + sliceAngle / 2;
        const labelR = outerR + 12;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;

        if (sliceAngle > 0.15) {
            ctx.save();
            ctx.font = '600 10px var(--font-sans)';
            ctx.fillStyle = getComputedThemeColor('--body-color');
            ctx.textAlign = midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5 ? 'right' : 'left';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.8;
            ctx.fillText(cat.name, lx, ly);
            ctx.restore();
        }

        startAngle = endAngle;
    });

    renderYoutubeDetails();
}

// ---- YouTube Details (Tabbed Management) ----
let currentYtTab = 'channels';

export function renderYoutubeDetails() {
    const container = document.getElementById('yt-channels-list');
    const summaryEl = document.getElementById('yt-summary');
    if (!container) return;
    
    // Setup Tab Listeners once
    const tabs = document.querySelectorAll('.yt-tab');
    tabs.forEach(tab => {
        if (!tab.dataset.listener) {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentYtTab = tab.dataset.tab;
                renderYoutubeDetails();
            });
            tab.dataset.listener = "true";
        }
    });

    container.innerHTML = '';

    if (currentYtTab === 'channels') {
        youtubeData.topChannels.forEach(ch => {
            const item = document.createElement('div');
            item.className = 'yt-channel-item';
            item.innerHTML = `
                <div class="yt-channel-info">
                    <span class="yt-channel-name">${ch.name}</span>
                    <span class="yt-channel-meta">${ch.subscribers}</span>
                </div>
            `;
            container.appendChild(item);
        });
    } else if (currentYtTab === 'recent') {
        youtubeData.recent.forEach(v => {
            const item = document.createElement('div');
            item.className = 'yt-channel-item';
            item.innerHTML = `
                <img src="${v.thumbnail}" style="width: 32px; border-radius: 4px;">
                <div class="yt-channel-info">
                    <span class="yt-channel-name" style="font-size: 0.75rem">${v.title}</span>
                </div>
            `;
            container.appendChild(item);
        });
    } else if (currentYtTab === 'playlists') {
        youtubeData.playlists.forEach(p => {
            const item = document.createElement('div');
            item.className = 'yt-channel-item';
            item.innerHTML = `
                <span class="tile-icon" style="font-size: 0.8rem">📂</span>
                <span class="yt-channel-name">${p}</span>
            `;
            container.appendChild(item);
        });
    }

    const hoursEl = document.getElementById('yt-hours');
    if (hoursEl) hoursEl.textContent = youtubeData.totalHours === '--' ? '--' : youtubeData.totalHours;

    if (summaryEl && youtubeData.totalHours !== '--') {
        summaryEl.textContent = `Mood: Predominantemente focado em ${youtubeData.categories[0].name} e ${youtubeData.categories[1].name}.`;
    }
}


// ---- Navigation (Horizontal Bar Chart) ----
export function renderNavigation() {
    const setup = setupCanvas('canvas-navigation');
    if (!setup) return;
    const { ctx, w, h } = setup;

    const max = Math.max(...navigationData.categories.map(c => c.hours));
    const barHeight = Math.max(1, Math.min(16, (h - 8) / navigationData.categories.length - 6));
    const labelWidth = 80;
    const chartWidth = w - labelWidth - 20;

    const color = getComputedThemeColor('--chart-1');
    const bgColor = getComputedThemeColor('--chart-bg');
    const textColor = getComputedThemeColor('--body-color');

    navigationData.categories.forEach((cat, i) => {
        const y = i * (barHeight + 10) + 10;
        const barW = (cat.hours / max) * chartWidth;

        // Label
        ctx.save();
        ctx.font = '600 11px var(--font-sans)';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.8;
        ctx.fillText(cat.name, labelWidth - 12, y + barHeight / 2);
        ctx.restore();

        // Background bar
        ctx.beginPath();
        ctx.roundRect(labelWidth, y, chartWidth, barHeight, barHeight / 2);
        ctx.fillStyle = bgColor;
        ctx.fill();

        // Value bar
        ctx.beginPath();
        ctx.roundRect(labelWidth, y, barW, barHeight, barHeight / 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 + (cat.hours / max) * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Hours value
        ctx.save();
        ctx.font = '600 9px Inter, sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.5;
        ctx.fillText(`${cat.hours}h`, labelWidth + barW + 6, y + barHeight / 2);
        ctx.restore();
    });
}


// ---- Heatmap (GitHub style) ----
export function renderHeatmap() {
    const setup = setupCanvas('canvas-heatmap');
    if (!setup) return;
    const { ctx, w, h } = setup;

    const data = generateHeatmapData();
    const weeks = 53;
    const days = 7;
    const gap = 2;
    const cellSize = Math.min(
        (w - gap * weeks) / weeks,
        (h - gap * days) / days,
        14
    );

    const totalGridW = weeks * (cellSize + gap);
    const totalGridH = days * (cellSize + gap);
    const offsetX = (w - totalGridW) / 2;
    const offsetY = (h - totalGridH) / 2;

    const baseColor = getComputedThemeColor('--chart-1');
    const bgColor = getComputedThemeColor('--chart-bg');

    data.forEach((d, i) => {
        const week = Math.floor(i / 7);
        const day = i % 7;
        const x = offsetX + week * (cellSize + gap);
        const y = offsetY + day * (cellSize + gap);

        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, cellSize, 2);

        if (d.value < 0.05) {
            ctx.fillStyle = bgColor;
        } else {
            ctx.globalAlpha = 0.15 + d.value * 0.85;
            ctx.fillStyle = baseColor;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}


// ---- Focus (Mini bar chart) ----
export function renderFocus() {
    const setup = setupCanvas('canvas-focus');
    if (!setup) return;
    const { ctx, w, h } = setup;

    const positiveColor = getComputedThemeColor('--positive');
    const negativeColor = getComputedThemeColor('--negative');
    const data = focusData.breakdown;
    const barWidth = Math.max(1, Math.min(12, (w - 8) / data.length - 3));
    const gap = 3;
    const totalW = data.length * (barWidth + gap);
    const offsetX = (w - totalW) / 2;
    const maxH = h - 8;

    data.forEach((d, i) => {
        const x = offsetX + i * (barWidth + gap);
        const prodH = d.productive * maxH;
        const distH = d.distracted * maxH;

        // Productive (bottom-up)
        ctx.beginPath();
        ctx.roundRect(x, h - 4 - prodH, barWidth, prodH, barWidth / 3);
        ctx.fillStyle = positiveColor;
        ctx.globalAlpha = 0.6;
        ctx.fill();

        // Distracted (stacked on top)
        ctx.beginPath();
        ctx.roundRect(x, h - 4 - prodH - distH - 1, barWidth, distH, barWidth / 3);
        ctx.fillStyle = negativeColor;
        ctx.globalAlpha = 0.35;
        ctx.fill();

        ctx.globalAlpha = 1;
    });
}


// ---- Spotify Genres ----
export function renderSpotifyGenres() {
    const container = document.getElementById('genre-tags');
    if (!container) return;
    container.innerHTML = '';

    spotifyData.topGenres.forEach(g => {
        const tag = document.createElement('span');
        tag.className = 'genre-tag';
        tag.textContent = `${g.name} ${g.pct}%`;
        container.appendChild(tag);
    });

    // Update now playing
    const trackName = document.getElementById('track-name');
    const trackArtist = document.getElementById('track-artist');
    if (trackName) trackName.textContent = spotifyData.nowPlaying.track;
    if (trackArtist) trackArtist.textContent = spotifyData.nowPlaying.artist;
}


// ---- Reading List ----
export function renderBooks() {
    const container = document.getElementById('book-list');
    if (!container) return;
    container.innerHTML = '';

    readingData.books.forEach(book => {
        const item = document.createElement('div');
        item.className = 'book-item';
        item.innerHTML = `
            <div class="book-cover" style="background: linear-gradient(135deg, ${book.color}, ${book.color}dd);"></div>
            <div class="book-info">
                <span class="book-title">${book.title}</span>
                <span class="book-author">${book.author}</span>
                <div class="book-progress">
                    <div class="book-progress-fill" style="width: ${book.progress}%"></div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}


// ---- Intention Bar ----
export function renderIntention() {
    const bar = document.getElementById('intention-bar');
    const pct = document.getElementById('intention-pct');
    const goal = document.getElementById('intention-goal');

    if (bar) {
        setTimeout(() => {
            bar.style.width = `${intentionData.alignment}%`;
        }, 400);
    }
    if (pct) pct.textContent = `${intentionData.alignment}%`;
    if (goal) goal.textContent = intentionData.goal;
}


// ---- Render All ----
export function renderAllWidgets() {
    renderMindMap();
    renderSpotifyGenres();
    renderYoutube();
    renderBooks();
    renderNavigation();
    renderIntention();
    renderHeatmap();
    renderFocus();
}

// Handle resize
let resizeTimer;
export function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        renderMindMap();
        renderYoutube();
        renderNavigation();
        renderHeatmap();
        renderFocus();
    }, 200);
}
// ---- Update YouTube Widget with Real Data ----
export function updateYoutubeWidget(newData) {
    // Update the data reference
    youtubeData.totalHours = newData.totalHours;
    youtubeData.categories = newData.categories;
    youtubeData.topChannels = newData.topChannels;
    youtubeData.recent = newData.recent;

    // Trigger re-render
    renderYoutube();

    // Update settings status label
    const settingsStatus = document.getElementById('settings-yt-status');
    const dashboardBtn = document.getElementById('btn-yt-connect');
    if (settingsStatus) {
        settingsStatus.textContent = "Conectado";
        settingsStatus.classList.remove('disconnected');
        settingsStatus.classList.add('connected');
    }
    if (dashboardBtn) {
        dashboardBtn.style.display = 'none';
    }
}
