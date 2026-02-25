const prisma = require('../prisma');

exports.getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true, role: true }
                    }
                }
            }),
            prisma.activityLog.count()
        ]);

        res.json({
            logs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

// Internal helper to create log
exports.logActivity = async (userId, action, entity, entityId, details) => {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details
            }
        });
    } catch (error) {
        console.error('Log activity error:', error);
    }
};
