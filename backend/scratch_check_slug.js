const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSlug() {
  const targetSlug = 'chief-minister-shri-sai-expresses-deep-grief-over-vedanta-power-plant-accident-in-sakti-orders-probe';
  
  console.log('--- DB CHECK ---');
  console.log('Target Slug:', targetSlug);
  
  try {
    const article = await prisma.article.findUnique({
      where: { slug: targetSlug },
      select: { id: true, title: true, slug: true }
    });
    
    if (article) {
      console.log('✅ FOUND:', article);
    } else {
      console.log('❌ NOT FOUND in DB');
      
      // Check for partial match
      const partial = await prisma.article.findMany({
        where: { slug: { contains: 'chief-minister' } },
        select: { slug: true },
        take: 5
      });
      console.log('Partial matches found:', partial.map(p => p.slug));
    }
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSlug();
