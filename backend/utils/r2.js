const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Uploads a base64 image or Buffer to Cloudflare R2
 * @param {string|Buffer} fileSource - Base64 string or file Buffer
 * @param {string} fileName - Destination filename
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadToR2 = async (fileSource, fileName, contentType = 'image/jpeg') => {
    try {
        let body;
        let finalContentType = contentType;

        if (typeof fileSource === 'string' && fileSource.startsWith('data:')) {
            // Handle Base64
            const matches = fileSource.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                throw new Error('Invalid base64 string');
            }
            finalContentType = matches[1];
            body = Buffer.from(matches[2], 'base64');
        } else {
            body = fileSource;
        }

        const parallelUploads3 = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: body,
                ContentType: finalContentType,
            },
        });

        await parallelUploads3.done();

        // Construct the public URL
        // If R2_ACCOUNT_URL is provided (e.g. custom domain), use it
        // Otherwise use the default R2 public bucket URL (if enabled)
        const baseUrl = process.env.R2_ACCOUNT_URL || `https://pub-${process.env.R2_BUCKET_NAME}.r2.dev`;
        return `${baseUrl}/${fileName}`;
    } catch (error) {
        console.error('R2 Upload Error:', error);
        throw error;
    }
};

/**
 * Helper to process text and replace base64 images with R2 URLs
 * Useful for rich text content
 */
const processContentImages = async (content) => {
    if (!content) return content;

    const base64Regex = /src="data:image\/([a-zA-Z]*);base64,([^"]*)"/g;
    let match;
    let newContent = content;

    const promises = [];

    while ((match = base64Regex.exec(content)) !== null) {
        const extension = match[1];
        const base64Data = match[0].split(',')[1];
        const fileName = `content-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;

        const promise = uploadToR2(`data:image/${extension};base64,${base64Data}`, fileName, `image/${extension}`)
            .then(url => {
                newContent = newContent.replace(match[0], `src="${url}"`);
            });

        promises.push(promise);
    }

    await Promise.all(promises);
    return newContent;
};

module.exports = {
    uploadToR2,
    processContentImages,
    isR2Enabled: !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME)
};
