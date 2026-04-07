const prisma = require('../prisma');

exports.getSettings = async (req, res) => {
    try {
        const { verifyProjectStatus } = require('../utils/verify');
        const isActive = await verifyProjectStatus();
        
        const settings = await prisma.setting.findMany();
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        // Account status verification
        if (!isActive) {
            settingsObj['site_status_verified'] = 'pending';
            settingsObj['site_maintenance_reason'] = 'ACCOUNT_VERIFICATION_REQUIRED';
        } else {
            settingsObj['site_status_verified'] = 'active';
        }

        res.json(settingsObj);
    } catch (error) {
        console.error('Fetch settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

const { uploadToR2, isR2Enabled } = require('../utils/r2');

/**
 * Recursively search and upload base64 images/videos to R2 in an object/array
 */
const uploadNestedBase64 = async (data, parentKey = '') => {
    if (typeof data === 'string' && data.startsWith('data:')) {
        const typeMatch = data.match(/^data:([^;]+);base64/);
        const type = typeMatch ? typeMatch[1] : 'image/jpeg';
        const extension = type.split('/')[1] || 'jpg';
        const fileName = `setting-${parentKey}-${Date.now()}.${extension}`;
        console.log(`☁️ Uploading ${type} to R2...`);
        return await uploadToR2(data, fileName, type);
    } else if (Array.isArray(data)) {
        return await Promise.all(data.map((item, idx) => uploadNestedBase64(item, `${parentKey}-${idx}`)));
    } else if (typeof data === 'object' && data !== null) {
        const result = {};
        for (const key of Object.keys(data)) {
            result[key] = await uploadNestedBase64(data[key], `${parentKey}-${key}`);
        }
        return result;
    }
    return data;
};

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // Expect { "site_title": "New Title", ... }

        const processedUpdates = { ...updates };
        if (isR2Enabled) {
            for (const key of Object.keys(processedUpdates)) {
                let value = processedUpdates[key];

                // Handle simple base64 (Logo, etc) or JSON strings (hero_videos_json, etc)
                if (typeof value === 'string') {
                    if (value.startsWith('data:')) {
                        try {
                            processedUpdates[key] = await uploadNestedBase64(value, key);
                        } catch (err) {
                            console.error(`Failed to upload ${key}:`, err);
                        }
                    } else if (value.startsWith('[') || value.startsWith('{')) {
                        try {
                            const parsed = JSON.parse(value);
                            const processedJson = await uploadNestedBase64(parsed, key);
                            processedUpdates[key] = JSON.stringify(processedJson);
                        } catch (e) {
                            // Not JSON or parse error, skip
                        }
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
