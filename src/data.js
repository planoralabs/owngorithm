// ============================================
// OWNGORITHM — Mock Data
// Realistic demo data for all widgets
// ============================================

export const spotifyData = {
    nowPlaying: {
        track: 'Midnight City',
        artist: 'M83',
        album: 'Hurry Up, We\'re Dreaming',
    },
    topGenres: [
        { name: 'Synthwave', pct: 28 },
        { name: 'Lo-fi', pct: 22 },
        { name: 'Indie Rock', pct: 18 },
        { name: 'Eletrônica', pct: 15 },
        { name: 'MPB', pct: 10 },
        { name: 'Jazz', pct: 7 },
    ],
    recentTracks: [
        { track: 'Midnight City', artist: 'M83' },
        { track: 'Resonance', artist: 'HOME' },
        { track: 'Tadow', artist: 'Masego & FKJ' },
        { track: 'Nightcall', artist: 'Kavinsky' },
    ],
};

export const youtubeData = {
    totalHours: 12.4,
    categories: [
        { name: 'Programação', hours: 4.2, color: null },
        { name: 'IA / Tech', hours: 3.1, color: null },
        { name: 'Música', hours: 2.0, color: null },
        { name: 'Design', hours: 1.8, color: null },
        { name: 'Outros', hours: 1.3, color: null },
    ],
};

export const readingData = {
    books: [
        {
            title: 'Sapiens',
            author: 'Yuval Harari',
            progress: 82,
            color: '#8B7355',
        },
        {
            title: 'O Poder do Hábito',
            author: 'Charles Duhigg',
            progress: 45,
            color: '#5B7B5A',
        },
        {
            title: 'Deep Work',
            author: 'Cal Newport',
            progress: 23,
            color: '#6B5B7B',
        },
        {
            title: 'Algoritmos de Destruição',
            author: 'Cathy O\'Neil',
            progress: 10,
            color: '#7B5B5B',
        },
    ],
};

export const navigationData = {
    categories: [
        { name: 'Dev / Code', hours: 8.5 },
        { name: 'Social Media', hours: 5.2 },
        { name: 'Notícias', hours: 3.1 },
        { name: 'Pesquisa', hours: 2.8 },
        { name: 'Compras', hours: 1.5 },
        { name: 'Streaming', hours: 4.3 },
    ],
};

export const intentionData = {
    goal: 'Aprender IA e Machine Learning',
    alignment: 68,
    aligned: [
        'Vídeos de Python/ML no YouTube',
        'Leitura: Intro to Statistical Learning',
        'Pesquisas sobre TensorFlow',
    ],
    misaligned: [
        '2.1h em redes sociais',
        '0.8h em compras online',
    ],
};

// Generate 365 days of activity data
export function generateHeatmapData() {
    const data = [];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        // More activity on weekdays, random spikes
        const dayOfWeek = date.getDay();
        const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
        let intensity = Math.random();
        if (isWeekday) intensity *= 1.4;
        else intensity *= 0.6;
        // Random spikes
        if (Math.random() > 0.92) intensity = 0.8 + Math.random() * 0.2;
        // Some quiet days
        if (Math.random() > 0.85) intensity *= 0.1;
        data.push({
            date,
            value: Math.min(1, Math.max(0, intensity)),
        });
    }
    return data;
}

export const focusData = {
    productive: 5.2,
    distracted: 2.1,
    breakdown: [
        { hour: 8, productive: 0.8, distracted: 0.2 },
        { hour: 9, productive: 0.9, distracted: 0.1 },
        { hour: 10, productive: 1.0, distracted: 0.0 },
        { hour: 11, productive: 0.7, distracted: 0.3 },
        { hour: 12, productive: 0.3, distracted: 0.7 },
        { hour: 13, productive: 0.2, distracted: 0.8 },
        { hour: 14, productive: 0.8, distracted: 0.2 },
        { hour: 15, productive: 0.9, distracted: 0.1 },
        { hour: 16, productive: 0.6, distracted: 0.4 },
        { hour: 17, productive: 0.4, distracted: 0.6 },
        { hour: 18, productive: 0.2, distracted: 0.8 },
    ],
};

export const mindMapData = {
    bubbles: [
        { label: 'Programação', size: 0.9, x: 0.35, y: 0.35 },
        { label: 'IA', size: 0.75, x: 0.6, y: 0.3 },
        { label: 'Design', size: 0.55, x: 0.25, y: 0.6 },
        { label: 'Música', size: 0.5, x: 0.7, y: 0.55 },
        { label: 'Notícias', size: 0.35, x: 0.5, y: 0.7 },
        { label: 'Finanças', size: 0.4, x: 0.15, y: 0.4 },
        { label: 'Filosofia', size: 0.3, x: 0.82, y: 0.4 },
        { label: 'Culinária', size: 0.25, x: 0.45, y: 0.5 },
        { label: 'Fitness', size: 0.28, x: 0.8, y: 0.72 },
    ],
};
