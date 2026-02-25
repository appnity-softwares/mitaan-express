const prisma = require('../prisma');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                _count: {
                    select: {
                        articles: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['USER', 'EDITOR', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });

        res.json({ message: 'Role updated successfully', user });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Don't allow deleting yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
