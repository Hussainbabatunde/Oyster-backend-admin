"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("./config/prisma");
const client_1 = require("@prisma/client");
const DATA_FILE = path_1.default.join(__dirname, '../data.json');
const defaultSeed = {
    sub_categories: [
        { id: 1, category_id: 1, name: 'iPhones', slug: 'iphones' },
        { id: 2, category_id: 1, name: 'Android Phones', slug: 'android-phones' },
        { id: 3, category_id: 1, name: 'Refurbished', slug: 'refurbished' },
        { id: 4, category_id: 2, name: 'Fast Charging', slug: 'fast-charging' },
        { id: 5, category_id: 2, name: 'MagSafe & Wireless', slug: 'magsafe-wireless' },
        { id: 6, category_id: 2, name: 'High Capacity', slug: 'high-capacity' },
        { id: 7, category_id: 3, name: 'MacBooks', slug: 'macbooks' },
        { id: 8, category_id: 3, name: 'Gaming Laptops', slug: 'gaming-laptops' },
        { id: 9, category_id: 3, name: 'Ultrabooks', slug: 'ultrabooks' },
        { id: 10, category_id: 4, name: 'Apple Watch', slug: 'apple-watch' },
        { id: 11, category_id: 4, name: 'Fitness Trackers', slug: 'fitness-trackers' }
    ],
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
    if (fs_1.default.existsSync(DATA_FILE)) {
        try {
            const raw = fs_1.default.readFileSync(DATA_FILE, 'utf8');
            data = JSON.parse(raw);
        }
        catch (e) { }
    }
    // 1. Seed Categories
    const catIdMap = new Map();
    let nextCatId = 5;
    for (const cat of data.categories) {
        let targetId = cat.id;
        if (targetId > 2147483647) {
            targetId = nextCatId++;
        }
        catIdMap.set(cat.id, targetId);
        const existingCat = await prisma_1.prisma.category.findFirst({
            where: { OR: [{ id: targetId }, { name: cat.name }] },
        });
        if (existingCat) {
            await prisma_1.prisma.category.update({
                where: { id: existingCat.id },
                data: {
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description,
                },
            });
            catIdMap.set(cat.id, existingCat.id);
        }
        else {
            const created = await prisma_1.prisma.category.create({
                data: {
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description,
                },
            });
            catIdMap.set(cat.id, created.id);
        }
    }
    // 2. Seed Subcategories
    const subCatsToSeed = data.sub_categories || defaultSeed.sub_categories;
    let nextSubId = 12;
    for (const sub of subCatsToSeed) {
        let targetId = sub.id;
        if (targetId > 2147483647) {
            targetId = nextSubId++;
        }
        const rawCatId = sub.category_id || sub.categoryId;
        const parentCatId = catIdMap.get(rawCatId) || (rawCatId <= 2147483647 ? rawCatId : null);
        if (!parentCatId)
            continue;
        const parentCatExists = await prisma_1.prisma.category.findUnique({ where: { id: parentCatId } });
        if (!parentCatExists)
            continue;
        const existingSub = await prisma_1.prisma.subCategory.findFirst({
            where: { categoryId: parentCatId, name: sub.name }
        });
        if (existingSub) {
            await prisma_1.prisma.subCategory.update({
                where: { id: existingSub.id },
                data: {
                    name: sub.name,
                    slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                }
            });
        }
        else {
            await prisma_1.prisma.subCategory.create({
                data: {
                    categoryId: parentCatId,
                    name: sub.name,
                    slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                }
            });
        }
    }
    // 3. Seed Products
    let nextProdId = 10;
    for (const prod of data.products) {
        let targetId = prod.id;
        if (targetId > 2147483647) {
            targetId = nextProdId++;
        }
        const imgList = (prod.images && prod.images.length) ? prod.images : [prod.image || '/images/product-item1.jpg'];
        const catId = prod.category_id ? (catIdMap.get(prod.category_id) || (prod.category_id <= 2147483647 ? prod.category_id : null)) : null;
        const existingProd = await prisma_1.prisma.product.findFirst({
            where: { OR: [{ id: targetId }, { name: prod.name }] }
        });
        if (existingProd) {
            await prisma_1.prisma.product.update({
                where: { id: existingProd.id },
                data: {
                    name: prod.name,
                    nickname: prod.nickname || '',
                    categoryId: catId,
                    categoryName: prod.category_name || 'General',
                    price: new client_1.Prisma.Decimal(prod.price),
                    originalPrice: new client_1.Prisma.Decimal(prod.original_price ?? prod.price),
                    description: prod.description || '',
                    size: prod.size || '',
                    color: prod.color || '',
                    inStock: prod.in_stock ?? true,
                    stockCount: prod.stock_count ?? 10,
                    rating: new client_1.Prisma.Decimal(prod.rating ?? 5.0),
                    reviewsCount: prod.reviews_count ?? 1,
                    image: prod.image || imgList[0],
                    images: imgList,
                    specifications: (prod.specifications || []),
                },
            });
        }
        else {
            await prisma_1.prisma.product.create({
                data: {
                    name: prod.name,
                    nickname: prod.nickname || '',
                    categoryId: catId,
                    categoryName: prod.category_name || 'General',
                    price: new client_1.Prisma.Decimal(prod.price),
                    originalPrice: new client_1.Prisma.Decimal(prod.original_price ?? prod.price),
                    description: prod.description || '',
                    size: prod.size || '',
                    color: prod.color || '',
                    inStock: prod.in_stock ?? true,
                    stockCount: prod.stock_count ?? 10,
                    rating: new client_1.Prisma.Decimal(prod.rating ?? 5.0),
                    reviewsCount: prod.reviews_count ?? 1,
                    image: prod.image || imgList[0],
                    images: imgList,
                    specifications: (prod.specifications || []),
                },
            });
        }
    }
    // 3. Seed Admin Users
    for (const user of data.admin_users) {
        await prisma_1.prisma.adminUser.upsert({
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
    await prisma_1.prisma.$disconnect();
});
