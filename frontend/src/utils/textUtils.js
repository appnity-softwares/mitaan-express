export const stripHtml = (html) => {
    if (!html) return '';
    // Create a new DOMParser instance to safely parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let text = doc.body.textContent || doc.body.innerText || '';

    // Replace non-breaking spaces and extra spaces with a single space
    return text.replace(/\s+/g, ' ').trim();
};
