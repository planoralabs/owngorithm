const LASTFM_API_KEY = 'a3a1f7e1f8fb845dccc3ddbb54af59ad'; 

export async function fetchLastfmData(user) {
    if (!LASTFM_API_KEY || !user || LASTFM_API_KEY === 'SUA_CHAVE_AQUI') return null;

    try {
        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${LASTFM_API_KEY}&format=json&limit=5`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.message);
        }

        return data.recenttracks.track;
    } catch (err) {
        console.error("Erro Last.fm:", err);
        return null;
    }
}

export function saveLastfmUser(user) {
    localStorage.setItem('owngorithm-lastfm-user', user);
}

export function loadLastfmUser() {
    return localStorage.getItem('owngorithm-lastfm-user');
}
