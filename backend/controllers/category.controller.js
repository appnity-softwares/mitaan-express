const prisma = require('../prisma');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                parent: {
                    select: { id: true, name: true, nameHi: true, slug: true }
                }
            },
            orderBy: [
                { parentId: 'asc' },
                { sortOrder: 'asc' }
            ]
        });
        res.json(categories);
    } catch (error) {
        console.error('Category fetch error:', error);
        res.status(500).json({ error: 'Failed', details: error.message });
    }
};

exports.createCategory = async (req, res) => {
    const { name, nameHi, slug, description, image, icon, color, sortOrder, parentId } = req.body;
    try {
        const category = await prisma.category.create({
            data: {
                name,
                nameHi,
                slug,
                description,
                image,
                icon,
                color,
                sortOrder: parseInt(sortOrder) || 0,
                parentId: parentId ? parseInt(parentId) : null
            }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed', details: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, nameHi, slug, description, image, icon, color, sortOrder, parentId } = req.body;
    try {
        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: {
                name,
                nameHi,
                slug,
                description,
                image,
                icon,
                color,
                sortOrder: parseInt(sortOrder) || 0,
                parentId: parentId ? parseInt(parentId) : null
            }
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed', details: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // First check if there are subcategories
        const subcount = await prisma.category.count({ where: { parentId: parseInt(id) } });
        if (subcount > 0) {
            return res.status(400).json({ error: 'Cannot delete category with sub-categories. Delete children first.' });
        }

        // Check if articles use it
        const articlecount = await prisma.article.count({ where: { categoryId: parseInt(id) } });
        if (articlecount > 0) {
            return res.status(400).json({ error: 'Cannot delete category that has articles. Move articles first.' });
        }

        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed', details: error.message });
    }
};
