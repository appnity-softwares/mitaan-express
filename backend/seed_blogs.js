const prisma = require('./prisma');

async function main() {
    console.log("Seeding blogs...");

    // Check if an author exists
    let author = await prisma.user.findFirst();
    if (!author) {
        author = await prisma.user.create({
            data: {
                name: 'System Admin',
                email: 'admin@mitaan.com',
                password: 'password123',
                role: 'ADMIN'
            }
        });
    }

    // Check if category exists
    let category = await prisma.category.findFirst({ where: { slug: 'general' } });
    if (!category) {
        category = await prisma.category.create({
            data: {
                name: 'General',
                slug: 'general'
            }
        });
    }

    const blogsToCreate = [
        {
            title: 'The Future of Web Development in 2025',
            slug: 'future-web-development-2025',
            content: '<p>Exploring the upcoming trends in web development, including AI integration, edge computing, and WebAssembly taking over complex web applications.</p>',
            shortDescription: 'Discover what the future holds for web developers in 2025 and beyond.',
            status: 'PUBLISHED',
            language: 'en',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
            authorId: author.id,
            categoryId: category.id
        },
        {
            title: 'Mastering Prisma with Express.js',
            slug: 'mastering-prisma-express-js',
            content: '<p>A comprehensive guide on how to integrate Prisma ORM efficiently within an Express.js backend architecture to ensure type-safe and performant database access.</p>',
            shortDescription: 'Learn how to boost your backend with Prisma and Express.js.',
            status: 'PUBLISHED',
            language: 'en',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
            authorId: author.id,
            categoryId: category.id
        },
        {
            title: 'Why React is Still the King in 2025',
            slug: 'why-react-king-2025',
            content: '<p>Despite the rise of new frameworks, React continues to dominate the frontend landscape. We analyze the new features of React 19 and why community support matters.</p>',
            shortDescription: 'An analysis of React\'s enduring dominance in frontend framework wars.',
            status: 'PUBLISHED',
            language: 'en',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
            authorId: author.id,
            categoryId: category.id
        },
        {
            title: 'Top 5 Machine Learning Trends',
            slug: 'top-10-machine-learning-trends',
            content: '<p>From LLMs running on the edge to advanced generative video models, we dive deep into the top 5 machine learning trends that are reshaping the tech industry right now.</p>',
            shortDescription: 'A deep dive into the most exciting machine learning trends of the year.',
            status: 'PUBLISHED',
            language: 'en',
            image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800',
            authorId: author.id,
            categoryId: category.id
        },
        {
            title: 'Building Scalable APIs',
            slug: 'building-scalable-apis',
            content: '<p>What makes an API scalable? We discuss rate limiting, caching strategies, horizontal scaling, and the role of serverless architectures in modern API design.</p>',
            shortDescription: 'Best practices and strategies for building highly scalable APIs.',
            status: 'PUBLISHED',
            language: 'en',
            image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800',
            authorId: author.id,
            categoryId: category.id
        }
    ];

    for (const data of blogsToCreate) {
        // Checking if blog exists to prevent duplication
        const existing = await prisma.blog.findUnique({ where: { slug: data.slug } });
        if (!existing) {
            await prisma.blog.create({ data });
            console.log(`Created: ${data.title}`);
        } else {
            console.log(`Skipped (already exists): ${data.title}`);
        }
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
