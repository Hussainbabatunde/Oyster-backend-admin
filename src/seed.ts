import fs from 'fs';
import path from 'path';
import { prisma } from './config/prisma';
import { Prisma } from '@prisma/client';

const DATA_FILE = path.join(__dirname, '../data.json');

const defaultSeed = {
  sub_categories: [] as any[],
  categories: [] as any[],
  products: [] as any[],
  admin_users: [
    {
      id: 1,
      email: 'admin@oyster.com',
      password_hash: '$2a$10$wT8f6sFm.W69eD9O.M4NneCqZcQk4B3uL1r9x7g7h8i9j0k1l2m3n'
    }
  ]
};

async function seed() {
  console.log('🌱 Starting Prisma Database Seed...');
  let data: any = defaultSeed;
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(raw);
    } catch (e) {}
  }

  const categories = data.categories || [];
  const subCategories = data.sub_categories || [];
  const products = data.products || [];
  const adminUsers = data.admin_users || defaultSeed.admin_users;

  // 1. Seed Categories if present
  const catIdMap = new Map<number, number>();
  let nextCatId = 5;

  for (const cat of categories) {
    let targetId = cat.id;
    if (targetId > 2147483647) {
      targetId = nextCatId++;
    }
    catIdMap.set(cat.id, targetId);

    const existingCat = await prisma.category.findFirst({
      where: { OR: [{ id: targetId }, { name: cat.name }] },
    });

    if (existingCat) {
      await prisma.category.update({
        where: { id: existingCat.id },
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        },
      });
      catIdMap.set(cat.id, existingCat.id);
    } else {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        },
      });
      catIdMap.set(cat.id, created.id);
    }
  }

  // 2. Seed Subcategories if present
  let nextSubId = 12;
  for (const sub of subCategories) {
    let targetId = sub.id;
    if (targetId > 2147483647) {
      targetId = nextSubId++;
    }
    const rawCatId = sub.category_id || sub.categoryId;
    const parentCatId = catIdMap.get(rawCatId) || (rawCatId <= 2147483647 ? rawCatId : null);

    if (!parentCatId) continue;

    const parentCatExists = await prisma.category.findUnique({ where: { id: parentCatId } });
    if (!parentCatExists) continue;

    const existingSub = await prisma.subCategory.findFirst({
      where: { categoryId: parentCatId, name: sub.name }
    });

    if (existingSub) {
      await prisma.subCategory.update({
        where: { id: existingSub.id },
        data: {
          name: sub.name,
          slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }
      });
    } else {
      await prisma.subCategory.create({
        data: {
          categoryId: parentCatId,
          name: sub.name,
          slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }
      });
    }
  }

  // 3. Seed Products if present
  let nextProdId = 10;
  for (const prod of products) {
    let targetId = prod.id;
    if (targetId > 2147483647) {
      targetId = nextProdId++;
    }
    const imgList = (prod.images && prod.images.length) ? prod.images : [prod.image || '/images/product-item1.jpg'];
    const catId = prod.category_id ? (catIdMap.get(prod.category_id) || (prod.category_id <= 2147483647 ? prod.category_id : null)) : null;

    const existingProd = await prisma.product.findFirst({
      where: { OR: [{ id: targetId }, { name: prod.name }] }
    });

    if (existingProd) {
      await prisma.product.update({
        where: { id: existingProd.id },
        data: {
          name: prod.name,
          nickname: prod.nickname || '',
          categoryId: catId,
          categoryName: prod.category_name || 'General',
          price: new Prisma.Decimal(prod.price),
          originalPrice: new Prisma.Decimal(prod.original_price ?? prod.price),
          description: prod.description || '',
          size: prod.size || '',
          color: prod.color || '',
          inStock: prod.in_stock ?? true,
          stockCount: prod.stock_count ?? 10,
          rating: new Prisma.Decimal(prod.rating ?? 5.0),
          reviewsCount: prod.reviews_count ?? 1,
          image: prod.image || imgList[0],
          images: imgList as any,
          specifications: (prod.specifications || []) as any,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: prod.name,
          nickname: prod.nickname || '',
          categoryId: catId,
          categoryName: prod.category_name || 'General',
          price: new Prisma.Decimal(prod.price),
          originalPrice: new Prisma.Decimal(prod.original_price ?? prod.price),
          description: prod.description || '',
          size: prod.size || '',
          color: prod.color || '',
          inStock: prod.in_stock ?? true,
          stockCount: prod.stock_count ?? 10,
          rating: new Prisma.Decimal(prod.rating ?? 5.0),
          reviewsCount: prod.reviews_count ?? 1,
          image: prod.image || imgList[0],
          images: imgList as any,
          specifications: (prod.specifications || []) as any,
        },
      });
    }
  }

  // 4. Seed Admin Users
  for (const user of adminUsers) {
    await prisma.adminUser.upsert({
      where: { id: user.id },
      update: {
        email: user.email.toLowerCase(),
        passwordHash: user.password_hash || user.passwordHash,
      },
      create: {
        id: user.id,
        email: user.email.toLowerCase(),
        passwordHash: user.password_hash || user.passwordHash,
      },
    });
  }

  console.log('✅ Prisma Database Seed Completed Successfully!');
}

seed()
  .catch(err => {
    console.error('Seed Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
