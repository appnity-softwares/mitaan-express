export const getYouTubeID = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
    return match ? match[1] : null;
};

export const getVideoEmbedUrl = (url) => {
    if (!url) return null;

    const youtubeID = getYouTubeID(url);
    if (youtubeID) {
        return `https://www.youtube.com/embed/${youtubeID}`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
};

export const getVideoThumbnail = (url, providedThumbnail) => {
    if (providedThumbnail && providedThumbnail.trim() !== '') return providedThumbnail;

    const youtubeID = getYouTubeID(url);
    if (youtubeID) {
        return `https://img.youtube.com/vi/${youtubeID}/maxresdefault.jpg`;
    }

    return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800';
};
