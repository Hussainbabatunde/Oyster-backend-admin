import { prisma } from './config/prisma';

const categoriesData = [
  {
    name: 'Phones',
    slug: 'phones',
    description: 'Smartphones, New Releases & Certified Pre-Owned Mobile Devices',
    subcategories: [
      { name: 'Phones (New)', slug: 'phones-new' },
      { name: 'Phones (Preowned)', slug: 'phones-preowned' }
    ]
  },
  {
    name: 'Cars & Work',
    slug: 'cars-and-work',
    description: 'Smart Car Accessories, Dash Screens, Battery Maintainers & Office Gear',
    subcategories: [
      { name: 'Car Accessories', slug: 'car-accessories' },
      { name: 'Work & Office Gear', slug: 'work-and-office-gear' }
    ]
  },
  {
    name: 'Computers',
    slug: 'computers',
    description: 'High-Performance Laptops, MacBooks, Workstations & Gaming Displays',
    subcategories: [
      { name: 'Laptops & MacBooks', slug: 'laptops-and-macbooks' },
      { name: 'Desktops & Workstations', slug: 'desktops-and-workstations' },
      { name: 'Computer Accessories & Displays', slug: 'computer-accessories-and-displays' }
    ]
  },
  {
    name: 'Health',
    slug: 'health',
    description: 'Smart Wearables, Health Trackers, Diagnostics & Therapy Devices',
    subcategories: [
      { name: 'Smart Fitness & Health Monitors', slug: 'smart-fitness-and-health-monitors' },
      { name: 'Wellness & Diagnostics', slug: 'wellness-and-diagnostics' },
      { name: 'Therapy & Personal Care', slug: 'therapy-and-personal-care' }
    ]
  }
];

const productsData = [
  // --- PHONES (NEW) ---
  {
    name: 'iPhone 16 Pro Max 512GB',
    nickname: 'Titanium Flagship',
    categoryName: 'Phones',
    subcategoryName: 'Phones (New)',
    price: 1399.00,
    originalPrice: 1499.00,
    description: 'Forged in Grade 5 Titanium with the groundbreaking A18 Pro chip, 48MP Fusion camera system, and customizable Action Button.',
    size: '512GB / 6.9-inch OLED',
    color: 'Desert Titanium',
    certificateNumber: 'OYS-PH-NEW-2026-001',
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Processor', description: 'Apple A18 Pro Bionic Chip' },
      { title: 'Camera', description: '48MP Fusion | 48MP Ultra Wide | 5x Telephoto' },
      { title: 'Display', description: '6.9-inch Super Retina XDR 120Hz' }
    ]
  },
  {
    name: 'Samsung Galaxy S25 Ultra 512GB',
    nickname: 'Galaxy AI Titan',
    categoryName: 'Phones',
    subcategoryName: 'Phones (New)',
    price: 1299.00,
    originalPrice: 1399.00,
    description: 'Powered by Snapdragon 8 Gen 4 with integrated S-Pen, 200MP Quad Telephoto Camera, and real-time Galaxy AI camera features.',
    size: '512GB / 12GB RAM',
    color: 'Titanium Gray',
    certificateNumber: 'OYS-PH-NEW-2026-002',
    rating: 4.8,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Processor', description: 'Snapdragon 8 Gen 4 for Galaxy' },
      { title: 'Camera', description: '200MP Main + 50MP 5x Zoom' },
      { title: 'Stylus', description: 'Built-in S-Pen included' }
    ]
  },

  // --- PHONES (PREOWNED) ---
  {
    name: 'iPhone 14 Pro 256GB (Certified Preowned)',
    nickname: 'Grade A Refurbished',
    categoryName: 'Phones',
    subcategoryName: 'Phones (Preowned)',
    price: 699.00,
    originalPrice: 999.00,
    description: 'Fully inspected and certified 100% functional. Comes with Dynamic Island, A16 Bionic Chip, and 12-Month Oyster Warranty.',
    size: '256GB / 6.1-inch OLED',
    color: 'Deep Purple',
    certificateNumber: 'OYS-PH-PRE-2026-003',
    rating: 4.7,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Battery Health', description: 'Guaranteed 92%+ Capacity' },
      { title: 'Condition', description: 'Grade A Mint Condition' },
      { title: 'Warranty', description: '12-Month Oyster Replacement Warranty' }
    ]
  },
  {
    name: 'Google Pixel 8 Pro 128GB (Preowned)',
    nickname: 'Pure Android AI Phone',
    categoryName: 'Phones',
    subcategoryName: 'Phones (Preowned)',
    price: 499.00,
    originalPrice: 799.00,
    description: 'Preowned Pixel 8 Pro with Google Tensor G3 chip, Magic Eraser AI, and 50MP Triple Camera setup.',
    size: '128GB / 12GB RAM',
    color: 'Bay Blue',
    certificateNumber: 'OYS-PH-PRE-2026-004',
    rating: 4.6,
    reviewsCount: 54,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Chipset', description: 'Google Tensor G3' },
      { title: 'Condition', description: 'Certified Refurbished Excellent' }
    ]
  },

  // --- CARS & WORK (CAR ACCESSORIES) ---
  {
    name: '10.25-Inch Android Auto & Apple CarPlay Screen',
    nickname: 'Wireless Dashboard Upgrade',
    categoryName: 'Cars & Work',
    subcategoryName: 'Car Accessories',
    price: 289.00,
    originalPrice: 349.00,
    description: 'Universal dash-mounted 10.25-inch HD IPS touchscreen featuring wireless Apple CarPlay, Android Auto, Bluetooth 5.0, and Built-in Dashcam.',
    size: '10.25-inch 1920x720 IPS Screen',
    color: 'Matte Black Enclosure',
    certificateNumber: 'OYS-CAR-ACC-2026-001',
    rating: 4.9,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Screen Type', description: '10.25 IPS High Definition Touchscreen' },
      { title: 'Connectivity', description: 'Wireless CarPlay & Wireless Android Auto' },
      { title: 'Audio Output', description: 'FM Transmitter, AUX Cable, Built-in Speaker' }
    ]
  },
  {
    name: 'NOCO Genius 10A Automatic Smart Battery Maintainer',
    nickname: 'Intelligent Car Battery Charger',
    categoryName: 'Cars & Work',
    subcategoryName: 'Car Accessories',
    price: 119.00,
    originalPrice: 149.00,
    description: 'Multi-voltage 6V and 12V automatic smart battery maintainer, charger, and desulfator for AGM, Lithium, and Lead-Acid vehicle batteries.',
    size: '6V & 12V Universal',
    color: 'Red & Black',
    certificateNumber: 'OYS-CAR-ACC-2026-002',
    rating: 4.8,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Charging Current', description: '10 Amps Smart Output' },
      { title: 'Protection', description: 'Overcharge, Reverse Polarity & Thermal Sensor' }
    ]
  },
  {
    name: 'Oyster 2000A Heavy Duty Portable Car Jump Starter',
    nickname: 'Emergency Power Bank',
    categoryName: 'Cars & Work',
    subcategoryName: 'Car Accessories',
    price: 89.00,
    originalPrice: 129.00,
    description: 'Compact 2000 Peak Amp jump starter capable of starting up to 8.0L Gas and 6.5L Diesel engines. Features 20,000mAh Power Bank & LED Light.',
    size: '20,000 mAh Capacity',
    color: 'Slate Black',
    certificateNumber: 'OYS-CAR-ACC-2026-003',
    rating: 4.9,
    reviewsCount: 165,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Peak Current', description: '2000 Amps' },
      { title: 'Engine Rating', description: 'Up to 8.0L Gas / 6.5L Diesel' }
    ]
  },

  // --- CARS & WORK (WORK & OFFICE GEAR) ---
  {
    name: 'Anker Solix F2000 Portable Office Power Station',
    nickname: '2048Wh Backup Battery',
    categoryName: 'Cars & Work',
    subcategoryName: 'Work & Office Gear',
    price: 1699.00,
    originalPrice: 1999.00,
    description: 'Ultra-durable 2048Wh LiFePO4 power station delivering 2400W AC output to power computers, monitors, standing desks, and office appliances.',
    size: '2048Wh Capacity / 2400W AC Output',
    color: 'Charcoal Grey',
    certificateNumber: 'OYS-WRK-OFF-2026-004',
    rating: 5.0,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Battery Type', description: 'LiFePO4 (3,000+ Cycles)' },
      { title: 'AC Outlets', description: '4x 2400W Pure Sine Wave Ports' }
    ]
  },
  {
    name: 'Ergonomic Dual Motor Electric Standing Desk 55x28',
    nickname: 'Active Smart Workstation',
    categoryName: 'Cars & Work',
    subcategoryName: 'Work & Office Gear',
    price: 399.00,
    originalPrice: 499.00,
    description: 'Heavy-duty dual motor motorized standing desk with 4 memory height presets, cable management tray, and anti-collision technology.',
    size: '55 in x 28 in Top',
    color: 'Walnut Wood / Black Frame',
    certificateNumber: 'OYS-WRK-OFF-2026-005',
    rating: 4.8,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Height Range', description: '27.5 to 46.5 inches' },
      { title: 'Lift Capacity', description: '220 lbs Dual Motors' }
    ]
  },

  // --- COMPUTERS ---
  {
    name: 'MacBook Pro 16 M3 Max 36GB RAM 1TB SSD',
    nickname: 'Creator Laptop Workstation',
    categoryName: 'Computers',
    subcategoryName: 'Laptops & MacBooks',
    price: 3299.00,
    originalPrice: 3499.00,
    description: 'Supercharged by Apple M3 Max chip with 16-core CPU and 40-core GPU, 16.2-inch Liquid Retina XDR display, and up to 22 hours battery life.',
    size: '36GB RAM / 1TB SSD',
    color: 'Space Black',
    certificateNumber: 'OYS-CMP-LAP-2026-001',
    rating: 5.0,
    reviewsCount: 130,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Processor', description: 'Apple M3 Max (16-core CPU, 40-core GPU)' },
      { title: 'Memory', description: '36GB Unified Memory' }
    ]
  },
  {
    name: 'Dell XPS 15 9530 3.5K OLED Touch Laptop',
    nickname: 'Ultra Premium Windows PC',
    categoryName: 'Computers',
    subcategoryName: 'Laptops & MacBooks',
    price: 2199.00,
    originalPrice: 2499.00,
    description: 'Intel Core i9-13900H processor with NVIDIA GeForce RTX 4070 8GB Graphics and 3.5K OLED InfinityEdge touch display.',
    size: '32GB RAM / 1TB NVMe SSD',
    color: 'Platinum Silver',
    certificateNumber: 'OYS-CMP-LAP-2026-002',
    rating: 4.7,
    reviewsCount: 65,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Graphics Card', description: 'NVIDIA GeForce RTX 4070 8GB' },
      { title: 'Screen', description: '15.6-inch 3.5K OLED Touch (3456 x 2160)' }
    ]
  },
  {
    name: 'LG UltraGear 34-Inch Curved OLED 240Hz Monitor',
    nickname: 'Immersive Ultrawide Display',
    categoryName: 'Computers',
    subcategoryName: 'Computer Accessories & Displays',
    price: 899.00,
    originalPrice: 1199.00,
    description: 'Curved 34-inch WQHD (3440 x 1440) OLED gaming monitor featuring 240Hz refresh rate, 0.03ms response time, and NVIDIA G-Sync compatibility.',
    size: '34-inch WQHD Curved OLED',
    color: 'Matte Black',
    certificateNumber: 'OYS-CMP-ACC-2026-004',
    rating: 4.9,
    reviewsCount: 94,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Refresh Rate', description: '240Hz' },
      { title: 'Response Time', description: '0.03ms (GtG)' }
    ]
  },

  // --- HEALTH ---
  {
    name: 'Apple Watch Ultra 2 GPS + Cellular 49mm',
    nickname: 'Ultimate Health & Adventure Watch',
    categoryName: 'Health',
    subcategoryName: 'Smart Fitness & Health Monitors',
    price: 799.00,
    originalPrice: 849.00,
    description: 'Rugged 49mm titanium case watch with S9 SiP, ECG, Blood Oxygen sensor, Depth Gauge, and 3000 nits Always-On Retina Display.',
    size: '49mm Titanium Case',
    color: 'Natural Titanium / Ocean Band',
    certificateNumber: 'OYS-HLT-SMT-2026-001',
    rating: 4.9,
    reviewsCount: 180,
    image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Sensors', description: 'ECG, Blood Oxygen, Temperature, Depth Gauge' },
      { title: 'Water Resistance', description: '100m Water Resistant' }
    ]
  },
  {
    name: 'Oura Ring Gen 3 Horizon Smart Health Tracker',
    nickname: 'Sleep & Biomarker Smart Ring',
    categoryName: 'Health',
    subcategoryName: 'Smart Fitness & Health Monitors',
    price: 349.00,
    originalPrice: 399.00,
    description: 'Sleek titanium smart ring tracking sleep stages, heart rate variability, body temperature trends, and daytime activity metrics.',
    size: 'Available Sizes 6 to 13',
    color: 'Stealth Black',
    certificateNumber: 'OYS-HLT-SMT-2026-002',
    rating: 4.8,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Battery Life', description: 'Up to 7 Days per charge' },
      { title: 'Water Rating', description: 'Water resistant to 100m' }
    ]
  },
  {
    name: 'Withings Body Scan Cellular Smart Health Station',
    nickname: '6-Lead ECG Body Composition Scale',
    categoryName: 'Health',
    subcategoryName: 'Wellness & Diagnostics',
    price: 399.00,
    originalPrice: 449.00,
    description: 'Medical-grade home health station analyzing segmental body composition (fat, muscle, bone), 6-lead ECG for atrial fibrillation, and vascular age.',
    size: 'High-Strength Glass Base with Handle',
    color: 'Black Tempered Glass',
    certificateNumber: 'OYS-HLT-WEL-2026-003',
    rating: 4.8,
    reviewsCount: 52,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'ECG', description: '6-Lead Electrocardiogram' },
      { title: 'Metrics', description: 'Segmental Body Fat & Muscle Mass' }
    ]
  },
  {
    name: 'Theragun PRO G5 Deep Tissue Percussive Massage Gun',
    nickname: 'Professional Recovery Device',
    categoryName: 'Health',
    subcategoryName: 'Therapy & Personal Care',
    price: 499.00,
    originalPrice: 599.00,
    description: 'QuietForce motor delivering 16mm deep tissue percussive therapy with OLED screen, 6 attachments, and customizable speed ranges.',
    size: 'Ergonomic Multi-Grip Handle',
    color: 'Black / Metallic',
    certificateNumber: 'OYS-HLT-THR-2026-004',
    rating: 4.9,
    reviewsCount: 95,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop'],
    specifications: [
      { title: 'Amplitude', description: '16mm Percussive Depth' },
      { title: 'Attachments', description: '6 Interchangeable Foam Heads' }
    ]
  }
];

async function seed() {
  console.log('🌱 Starting Prisma Database Seed...');

  const categoryMap = new Map();
  const subCategoryMap = new Map();

  for (const cData of categoriesData) {
    const existing = await prisma.category.findUnique({ where: { name: cData.name } });
    const category = existing || await prisma.category.create({
      data: {
        name: cData.name,
        slug: cData.slug,
        description: cData.description,
      }
    });
    categoryMap.set(cData.name, category);

    for (const sData of cData.subcategories) {
      const existingSub = await prisma.subCategory.findFirst({
        where: { categoryId: category.id, name: sData.name }
      });
      const subCat = existingSub || await prisma.subCategory.create({
        data: {
          categoryId: category.id,
          name: sData.name,
          slug: sData.slug,
        }
      });
      subCategoryMap.set(sData.name, subCat);
    }
  }

  for (const p of productsData) {
    const cat = categoryMap.get(p.categoryName);
    const sub = subCategoryMap.get(p.subcategoryName);

    const existingProd = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existingProd) {
      await prisma.product.create({
        data: {
          name: p.name,
          nickname: p.nickname,
          categoryId: cat ? cat.id : null,
          categoryName: p.categoryName,
          subcategoryId: sub ? sub.id : null,
          subcategoryName: p.subcategoryName,
          price: p.price,
          originalPrice: p.originalPrice,
          description: p.description,
          size: p.size,
          color: p.color,
          inStock: true,
          stockCount: 25,
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          certificateNumber: p.certificateNumber,
          image: p.image,
          images: p.images,
          specifications: p.specifications
        }
      });
    }
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
