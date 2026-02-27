const prisma = require('../prisma');

// Get all published media for frontend
exports.getPublicMedia = async (req, res) => {
    try {
        const { type, category } = req.query; // 'IMAGE' or 'VIDEO', 'GALLERY' or 'SYSTEM'

        const where = { isPublished: true };
        if (type) where.type = type;

        if (category) {
            where.category = category;
        } else {
            // Default to showing everything EXCEPT system/article images
            where.category = { not: 'SYSTEM' };
        }

        const media = await prisma.media.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(media);
    } catch (error) {
        console.error('Fetch public media error:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
};

// Get all media for admin
exports.getAdminMedia = async (req, res) => {
    try {
        const { type, category } = req.query;

        const where = {};
        if (type) where.type = type;

        if (category) {
            where.category = category;
        } else {
            // Default to showing everything EXCEPT system/article images for admin too
            where.category = { not: 'SYSTEM' };
        }

        const media = await prisma.media.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(media);
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
        console.log('📦 Create Media Request:', { type, title, category });

        if (!type || !title || !url) {
            return res.status(400).json({ error: 'Type, title, and URL are required' });
        }

        // Auto-upload to R2 if it's a data-URL (base64)
        if (isR2Enabled && typeof url === 'string' && url.startsWith('data:')) {
            const isVideo = url.startsWith('data:video');
            const ext = isVideo ? '.mp4' : '.jpg';
            const fileName = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

            console.log(`☁️ Uploading ${isVideo ? 'video' : 'image'} to R2...`);
            url = await uploadToR2(url, fileName);
            console.log('✅ R2 URL:', url);
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
                url,
                thumbnail,
                category,
                size,
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
