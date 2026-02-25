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

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // Expect { "site_title": "New Title", ... }
        const promises = Object.keys(updates).map(key => {
            return prisma.setting.upsert({
                where: { key: key },
                update: { value: String(updates[key]) },
                create: { key: key, value: String(updates[key]) }
            });
        });

        await Promise.all(promises);
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
