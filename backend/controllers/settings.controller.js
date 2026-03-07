const prisma = require('../prisma');

exports.getSettings = async (req, res) => {
    try {
        const settings = await prisma.setting.findMany();
        // Convert to object: { "site_title": "My Site", ... }
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsObj);
    } catch (error) {
        console.error('Fetch settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

const { uploadToR2, isR2Enabled } = require('../utils/r2');

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // Expect { "site_title": "New Title", ... }

        // Optimize: Upload base64 images to R2 if found in settings
        const processedUpdates = { ...updates };
        if (isR2Enabled) {
            for (const key of Object.keys(processedUpdates)) {
                const value = processedUpdates[key];
                if (typeof value === 'string' && value.startsWith('data:image')) {
                    console.log(`☁️ Setting '${key}' contains base64 image. Uploading to R2...`);
                    try {
                        const fileName = `setting-${key}-${Date.now()}.jpg`;
                        const r2Url = await uploadToR2(value, fileName);
                        processedUpdates[key] = r2Url;
                        console.log(`✅ Setting '${key}' uploaded to R2: ${r2Url}`);
                    } catch (uploadError) {
                        console.error(`❌ Failed to upload setting '${key}' to R2:`, uploadError);
                        // Fallback: keep original value (base64) if R2 fails
                    }
                }
            }
        }

        const promises = Object.keys(processedUpdates).map(key => {
            return prisma.setting.upsert({
                where: { key: key },
                update: { value: String(processedUpdates[key]) },
                create: { key: key, value: String(processedUpdates[key]) }
            });
        });

        await Promise.all(promises);
        res.json({ message: 'Settings updated successfully', settings: processedUpdates });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
