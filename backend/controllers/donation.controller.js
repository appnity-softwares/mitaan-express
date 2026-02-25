const prisma = require('../prisma');

const createDonation = async (req, res) => {
    try {
        const { name, email, amount, message, method, details } = req.body;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const donation = await prisma.donation.create({
            data: {
                name: name || "Anonymous", // Use "Anonymous" if no name provided
                email,
                amount: parseFloat(amount),
                message,
                method,
                details,
                status: 'SUCCESS'
            }
        });

        res.status(201).json(donation);
    } catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({ message: 'Error creating donation', error: error.message });
    }
};

const getAllDonations = async (req, res) => {
    try {
        const donations = await prisma.donation.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(donations);
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({ message: 'Error fetching donations', error: error.message });
    }
};

module.exports = {
    createDonation,
    getAllDonations
};
