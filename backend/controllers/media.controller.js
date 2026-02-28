const prisma = require('../prisma');

// Get all published media for frontend
exports.getPublicMedia = async (req, res) => {
    try {
        const { type, category, page = 1, limit = 20 } = req.query; // 'IMAGE' or 'VIDEO', 'GALLERY' or 'SYSTEM'
        const skip = (page - 1) * limit;

        const where = { isPublished: true };
        if (type) where.type = type;

        if (category) {
            where.category = category;
        } else {
            // Default to showing everything EXCEPT system/article images
            where.category = { not: 'SYSTEM' };
        }

        const [media, total] = await Promise.all([
            prisma.media.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: parseInt(skip),
                take: parseInt(limit)
            }),
            prisma.media.count({ where })
        ]);

        res.json({
            media,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Fetch public media error:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
};

// Get all media for admin
exports.getAdminMedia = async (req, res) => {
    try {
        const { type, category, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (type) where.type = type;

        if (category) {
            where.category = category;
        } else {
            // Default to showing everything EXCEPT system/article images for admin too
            where.category = { not: 'SYSTEM' };
        }

        const [media, total] = await Promise.all([
            prisma.media.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: parseInt(skip),
                take: parseInt(limit)
            }),
            prisma.media.count({ where })
        ]);

        res.json({
            media,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Fetch admin media error:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
};

const { uploadToR2, isR2Enabled } = require('../utils/r2');

// Create new media
exports.createMedia = async (req, res) => {
    try {
        let { type, title, description, url, thumbnail, category, size, duration } = req.body;
        console.log('📦 Create Media Request:', { type, title, category, hasFile: !!req.file, providedUrl: url ? 'Yes' : 'No' });

        // Fetch dynamic upload limits from database
        let maxImageMB = 10;
        let maxVideoMB = 500;
        try {
            const settings = await prisma.setting.findMany({
                where: { key: { in: ['max_image_upload_size', 'max_video_upload_size'] } }
            });
            const imgSetting = settings.find(s => s.key === 'max_image_upload_size');
            const vidSetting = settings.find(s => s.key === 'max_video_upload_size');
            if (imgSetting && !isNaN(parseFloat(imgSetting.value))) maxImageMB = parseFloat(imgSetting.value);
            if (vidSetting && !isNaN(parseFloat(vidSetting.value))) maxVideoMB = parseFloat(vidSetting.value);
        } catch (e) {
            console.error('Failed to fetch upload limits, using defaults', e);
        }

        let finalUrl = url;
        let finalSize = size;
        const fs = require('fs');

        // File validation checks
        if (req.file) {
            const fileMB = req.file.size / (1024 * 1024);
            const isVideo = req.file.mimetype.startsWith('video/');
            const limit = isVideo ? maxVideoMB : maxImageMB;

            if (fileMB > limit) {
                console.warn(`Blocked large file: ${fileMB.toFixed(2)}MB exceeds ${limit}MB limit.`);
                try { fs.unlinkSync(req.file.path); } catch (e) { console.error('Error deleting temp file', e); }
                return res.status(400).json({ error: `Upload size limit exceeded. Maximum allowed size for ${isVideo ? 'videos' : 'images'} is ${limit}MB.` });
            }

            const filePath = req.file.path;
            const fileSizeKB = (req.file.size / 1024).toFixed(0) + ' KB';
            finalSize = fileSizeKB;

            try {
                if (isR2Enabled) {
                    console.log(`☁️ Uploading ${type} to R2...`);
                    const fileContent = fs.readFileSync(filePath);
                    const path = require('path');
                    const ext = path.extname(req.file.originalname);
                    const fileName = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

                    finalUrl = await uploadToR2(fileContent, fileName, req.file.mimetype);
                    console.log('✅ R2 URL:', finalUrl);

                    // Cleanup local file after successful R2 upload
                    fs.unlinkSync(filePath);
                } else {
                    throw new Error('R2 is not enabled or properly configured');
                }
            } catch (r2Error) {
                console.warn('⚠️ R2 Upload failed or disabled. Falling back to local disk:', r2Error.message);
                finalUrl = `${process.env.API_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
            }
        } else if (isR2Enabled && typeof finalUrl === 'string' && finalUrl.startsWith('data:')) {
            // estimate size of base64
            const base64Str = finalUrl.split(',')[1] || finalUrl;
            const sizeInBytes = (base64Str.length * 3) / 4;
            const fileMB = sizeInBytes / (1024 * 1024);
            const isVideo = finalUrl.startsWith('data:video');
            const limit = isVideo ? maxVideoMB : maxImageMB;

            if (fileMB > limit) {
                console.warn(`Blocked large base64 data URL: ${fileMB.toFixed(2)}MB exceeds ${limit}MB limit.`);
                return res.status(400).json({ error: `Upload size limit exceeded. Maximum allowed size for ${isVideo ? 'videos' : 'images'} is ${limit}MB.` });
            }

            // Legacy base64 support
            const ext = isVideo ? '.mp4' : '.jpg';
            const fileName = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
            console.log(`☁️ Uploading legacy base64 ${isVideo ? 'video' : 'image'} to R2...`);
            finalUrl = await uploadToR2(finalUrl, fileName);
            console.log('✅ R2 URL:', finalUrl);
        }

        if (!type || !title || !finalUrl) {
            return res.status(400).json({ error: 'Type, title, and URL/File are required' });
        }

        if (isR2Enabled && typeof thumbnail === 'string' && thumbnail.startsWith('data:image')) {
            const thumbName = `thumb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            thumbnail = await uploadToR2(thumbnail, thumbName);
        }

        const media = await prisma.media.create({
            data: {
                type,
                title,
                description,
                url: finalUrl,
                thumbnail,
                category,
                size: finalSize,
                duration
            }
        });

        console.log('✅ Media Created:', media.id);
        res.status(201).json(media);
    } catch (error) {
        console.error('🔥 Create media error:', error);
        res.status(500).json({ error: 'Failed to create media: ' + error.message });
    }
};

// Update media
exports.updateMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, isPublished } = req.body;

        const media = await prisma.media.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                category,
                isPublished
            }
        });

        res.json(media);
    } catch (error) {
        console.error('Update media error:', error);
        res.status(500).json({ error: 'Failed to update media' });
    }
};

// Delete media
exports.deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.media.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({ error: 'Failed to delete media' });
    }
};

// Increment views
exports.incrementViews = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await prisma.media.update({
            where: { id: parseInt(id) },
            data: {
                views: { increment: 1 }
            }
        });

        res.json(media);
    } catch (error) {
        console.error('Increment views error:', error);
        res.status(500).json({ error: 'Failed to increment views' });
    }
};
