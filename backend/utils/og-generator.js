const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const { html } = require('satori-html');
const axios = require('axios');
const path = require('path');
const { stripHtml } = require('./sanitize');

let fontCache = null;

/**
 * Fetches Noto Sans Devanagari font from Google Fonts.
 */
async function getFont() {
    if (fontCache) return fontCache;
    try {
        // We fetch the Google Font directly
        // Note: In a real production app, we would pack the .ttf file in the assets folder
        const fontUrl = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Bold.ttf';
        const response = await axios.get(fontUrl, { responseType: 'arraybuffer' });
        fontCache = response.data;
        return fontCache;
    } catch (e) {
        console.error('[OG Generator] Font Loading Error:', e);
        return null;
    }
}

/**
 * Generates a dynamic OG image as a PNG buffer.
 */
async function generateOgImage(title) {
    const cleanTitle = stripHtml(title || 'Mitaan Express').slice(0, 100);
    const fontData = await getFont();

    if (!fontData) throw new Error('Font loading failed');

    // Create the visual structure using satori-html
    const template = html(`
        <div style="height: 100%; width: 100%; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; background-image: linear-gradient(to bottom right, #0f172a, #111827); color: white; padding: 80px; font-family: 'Noto Sans Devanagari'; position: relative;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="height: 60px; width: 4px; background-color: #dc2626; margin-right: 20px; display: flex;"></div>
                <div style="font-size: 32px; font-weight: 800; tracking-tight: uppercase; color: #f8fafc; opacity: 0.8; display: flex;">MITAAN EXPRESS</div>
            </div>
            
            <div style="font-size: 72px; font-weight: 900; line-height: 1.1; margin-bottom: 40px; color: #ffffff; display: flex;">
                ${cleanTitle}
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; width: 100%;">
                <div style="font-size: 24px; color: #94a3b8; display: flex;">mitaanexpress.com</div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 12px; height: 12px; background-color: #22c55e; border-radius: 50%; margin-right: 10px; display: flex;"></div>
                    <div style="font-size: 20px; color: #f8fafc; opacity: 0.5; display: flex;">Verified News Source</div>
                </div>
            </div>
            
            <div style="position: absolute; right: -50px; bottom: -50px; width: 300px; height: 300px; background-color: #dc2626; opacity: 0.05; border-radius: 50%; display: flex;"></div>
        </div>
    `);

    // Render to SVG
    const svg = await satori(template, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'Noto Sans Devanagari',
                data: fontData,
                weight: 700,
                style: 'normal',
            },
        ],
    });

    // Convert SVG to PNG
    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 1200,
        },
    });

    const pngData = resvg.render();
    return pngData.asPng();
}

module.exports = { generateOgImage };
