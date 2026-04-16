const prisma = require('../prisma');
const { uploadToR2, isR2Enabled } = require('../utils/r2');

exports.getAllPublishers = async (req, res) => {
    try {
        const publishers = await prisma.publisher.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { articles: true, blogs: true }
                }
            }
        });
        res.json(publishers);
    } catch (error) {
        console.error('Publisher fetch error:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

exports.getPublisherById = async (req, res) => {
    const { id } = req.params;
    try {
        const publisher = await prisma.publisher.findUnique({
            where: { id: parseInt(id) },
            include: {
                articles: {
                    where: { status: 'PUBLISHED' },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                blogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });
        if (!publisher) return res.status(404).json({ error: 'Author not found' });
        res.json(publisher);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

exports.createPublisher = async (req, res) => {
    let { name, nameHi, image, description, designation } = req.body;
    try {
        if (isR2Enabled && image && image.startsWith('data:image')) {
            const fileName = `publisher-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            image = await uploadToR2(image, fileName);
        }

        const publisher = await prisma.publisher.create({
            data: {
                name,
                nameHi,
                image,
                description,
                designation
            }
        });
        res.status(201).json(publisher);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Publisher name already exists' });
        }
        res.status(500).json({ error: 'Failed', details: error.message });
    }
};

exports.updatePublisher = async (req, res) => {
    const { id } = req.params;
    let { name, nameHi, image, description, designation } = req.body;
    try {
        if (isR2Enabled && image && image.startsWith('data:image')) {
            const fileName = `publisher-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
            image = await uploadToR2(image, fileName);
        }

        const publisher = await prisma.publisher.update({
            where: { id: parseInt(id) },
            data: {
                name,
                nameHi,
                image,
                description,
                designation
            }
        });
        res.json(publisher);
    } catch (error) {
        res.status(500).json({ error: 'Failed', details: error.message });
    }
};

exports.deletePublisher = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if articles/blogs use it
        const articlesCount = await prisma.article.count({ where: { publisherId: parseInt(id) } });
        const blogsCount = await prisma.blog.count({ where: { publisherId: parseInt(id) } });
        
        if (articlesCount > 0 || blogsCount > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete publisher that has posts. Reassign posts first.' 
            });
        }

        await prisma.publisher.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Publisher deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed', details: error.message });
    }
};
