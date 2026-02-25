const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🚀 Starting Master Seeding...');

    // 1. Seed Admin User
    console.log('--- Seeding Admin User ---');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@mitaan.com' },
        update: {},
        create: {
            email: 'admin@mitaan.com',
            password: hashedPassword,
            name: 'Admin',
            role: 'ADMIN'
        }
    });
    console.log(`Admin user ready: ${admin.email}`);

    // 2. Seed Categories
    console.log('--- Seeding Categories ---');
    const categoriesData = [
        { name: 'National', nameHi: 'राष्ट्रीय', slug: 'national' },
        { name: 'State News', nameHi: 'राज्य समाचार', slug: 'state-news' },
        { name: 'Politics', nameHi: 'राजनीति', slug: 'politics' },
        { name: 'Entertainment', nameHi: 'मनोरंजन', slug: 'entertainment' },
        { name: 'Sports', nameHi: 'खेल', slug: 'sports' }
    ];

    const seededCategories = [];
    for (const cat of categoriesData) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat
        });
        seededCategories.push(category);
        console.log(`Category ready: ${cat.name}`);
    }

    // 3. Seed Tags
    console.log('--- Seeding Tags ---');
    const tagsData = ['Breaking', 'Trending', 'MitaanExclusive', 'India', 'Chhattisgarh'];
    for (const tagName of tagsData) {
        await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName, slug: tagName.toLowerCase() }
        });
    }

    // 4. Seed Settings
    console.log('--- Seeding Settings ---');
    const settingsData = [
        { key: 'ad_homepage_top_enabled', value: 'true' },
        { key: 'donation_upi_id', value: 'mitaanexpress@okaxis' },
        { key: 'donation_account_holder', value: 'Mitaan Express Media Trust' }
    ];
    for (const setting of settingsData) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting
        });
    }

    // 5. Seed Media
    console.log('--- Seeding Media ---');
    await prisma.media.createMany({
        data: [
            {
                type: 'IMAGE',
                title: 'Community Gathering',
                url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?autofit=crop&q=80&w=1000',
                isPublished: true
            },
            {
                type: 'VIDEO',
                title: 'Festival Highlights',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                isPublished: true
            }
        ],
        skipDuplicates: true
    });

    // 6. Seed Demo Articles
    console.log('--- Seeding Demo Articles ---');
    const articlesData = [
        {
            title: 'Welcome to Mitaan Express',
            slug: 'welcome-to-mitaan-express',
            content: 'This is the first article on your new local database. Mitaan Express is dedicated to providing quality news.',
            shortDescription: 'Latest updates from Mitaan Express.',
            status: 'PUBLISHED',
            categoryId: seededCategories[0].id,
            authorId: admin.id,
            published: true,
            language: 'en'
        }
    ];

    for (const art of articlesData) {
        await prisma.article.upsert({
            where: { slug: art.slug },
            update: {},
            create: art
        });
        console.log(`Article ready: ${art.title}`);
    }

    console.log('✅ Seeding Completed Successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit();
    });
