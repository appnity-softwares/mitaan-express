const prisma = require('../prisma');

exports.createContact = async (req, res) => {
    try {
        const { name, email, subject, phone, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

        const contact = await prisma.contact.create({
            data: { name, email, subject, phone, message }
        });

        res.status(201).json(contact);
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
};

exports.listContacts = async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(contacts);
    } catch (error) {
        console.error('List contacts error:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await prisma.contact.update({ where: { id: Number(id) }, data: { isRead: true } });
        res.json(contact);
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.contact.delete({ where: { id: Number(id) } });
        res.status(204).json({ message: 'Contact deleted' });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
};
