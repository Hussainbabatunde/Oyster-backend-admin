import fs from 'fs';
import path from 'path';
import { prisma } from './config/prisma';
import { Prisma } from '@prisma/client';

const DATA_FILE = path.join(__dirname, '../data.json');

const defaultSeed = {
  categories: [
    { id: 1, name: 'Phone', slug: 'phone', description: 'Smartphones & Mobile Devices' },
    { id: 2, name: 'Power Bank', slug: 'power-bank', description: 'Portable Power & Chargers' },
    { id: 3, name: 'Laptops', slug: 'laptops', description: 'High-Performance Laptops & Notebooks' },
    { id: 4, name: 'Smart Watches', slug: 'smart-watches', description: 'Fitness Trackers & Wearables' }
  ],
  products: [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      nickname: 'Titanium Beast',
      category_id: 1,
      category_name: 'Phone',
      price: 1199,
      original_price: 1299,
      description: 'Forged in titanium with the ground-breaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
      size: '256GB, 512GB, 1TB',
      color: 'Natural Titanium, Blue Titanium, White, Black',
      in_stock: true,
      stock_count: 45,
      rating: 4.9,
      reviews_count: 128,
      image: '/images/hero-phone.png',
      images: ['/images/hero-phone.png'],
      specifications: [
        { title: 'Processor', description: 'Apple A17 Pro Bionic chip' },
        { title: 'Display', description: '6.7-inch Super Retina XDR with ProMotion 120Hz' },
        { title: 'Camera', description: '48MP Main | 12MP Ultra Wide | 12MP 5x Telephoto' }
      ]
    },
    {
      id: 2,
      name: 'Anker PowerCore 24K Power Bank',
      nickname: 'Ultra Charger',
      category_id: 2,
      category_name: 'Power Bank',
      price: 149,
      original_price: 179,
      description: 'Ultra-powerful 24,000mAh power bank with 140W fast output and smart digital display screen for real-time telemetry.',
      size: '24,000 mAh',
      color: 'Midnight Black',
      in_stock: true,
      stock_count: 30,
      rating: 4.8,
      reviews_count: 85,
      image: '/images/product-item2.jpg',
      images: ['/images/product-item2.jpg'],
      specifications: [
        { title: 'Capacity', description: '24,000mAh / 86.4Wh' },
        { title: 'Max Output', description: '140W Power Delivery 3.1' }
      ]
    },
    {
      id: 3,
      name: 'MacBook Pro 16 M3 Max',
      nickname: 'Creator Workstation',
      category_id: 3,
      category_name: 'Laptops',
      price: 2499,
      original_price: 2699,
      description: 'Supercharged by the M3 Max chip with 16-core CPU and 40-core GPU, Liquid Retina XDR display, and up to 22 hours battery life.',
      size: '36GB RAM / 1TB SSD',
      color: 'Space Black, Silver',
      in_stock: true,
      stock_count: 12,
      rating: 5.0,
      reviews_count: 64,
      image: '/images/single-image1.png',
      images: ['/images/single-image1.png'],
      specifications: [
        { title: 'Chipset', description: 'Apple M3 Max (16-Core CPU, 40-Core GPU)' },
        { title: 'Memory', description: '36GB Unified Memory' }
      ]
    }
  ],
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
  let data = defaultSeed;
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(raw);
    } catch (e) {}
  }

  // 1. Seed Categories
  for (const cat of data.categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
  }

  // 2. Seed Products
  for (const prod of data.products) {
    const imgList = (prod.images && prod.images.length) ? prod.images : [prod.image || '/images/product-item1.jpg'];
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        nickname: prod.nickname || '',
        categoryId: prod.category_id || null,
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
      create: {
        id: prod.id,
        name: prod.name,
        nickname: prod.nickname || '',
        categoryId: prod.category_id || null,
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

  // 3. Seed Admin Users
  for (const user of data.admin_users) {
    await prisma.adminUser.upsert({
      where: { id: user.id },
      update: {
        email: user.email.toLowerCase(),
        passwordHash: user.password_hash,
      },
      create: {
        id: user.id,
        email: user.email.toLowerCase(),
        passwordHash: user.password_hash,
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
