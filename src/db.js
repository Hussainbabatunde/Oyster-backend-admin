require("dotenv").config();
let Pool = null;
try { Pool = require("pg").Pool; } catch(e) {}
const fs = require("fs");
const path = require("path");

const connectionString = process.env.DATABASE_URL;
let pool = null;
let usePg = false;

if (connectionString && Pool) {
  try {
    const isNeon = connectionString.includes("neon.tech") || connectionString.includes("sslmode=require");
    pool = new Pool({
      connectionString,
      ssl: isNeon || process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    });
  } catch (err) {
    console.log("PostgreSQL pool creation warning:", err.message);
  }
}

const DATA_FILE = path.join(__dirname, "../data.json");

const defaultSeed = {
  sub_categories: [
    { id: 1, category_id: 1, name: "iPhones", slug: "iphones" },
    { id: 2, category_id: 1, name: "Android Phones", slug: "android-phones" },
    { id: 3, category_id: 1, name: "Refurbished", slug: "refurbished" },
    { id: 4, category_id: 2, name: "Fast Charging", slug: "fast-charging" },
    { id: 5, category_id: 2, name: "MagSafe & Wireless", slug: "magsafe-wireless" },
    { id: 6, category_id: 2, name: "High Capacity", slug: "high-capacity" },
    { id: 7, category_id: 3, name: "MacBooks", slug: "macbooks" },
    { id: 8, category_id: 3, name: "Gaming Laptops", slug: "gaming-laptops" },
    { id: 9, category_id: 3, name: "Ultrabooks", slug: "ultrabooks" },
    { id: 10, category_id: 4, name: "Apple Watch", slug: "apple-watch" },
    { id: 11, category_id: 4, name: "Fitness Trackers", slug: "fitness-trackers" }
  ],
  categories: [
    { id: 1, name: "Phone", slug: "phone", description: "Smartphones & Mobile Devices" },
    { id: 2, name: "Power Bank", slug: "power-bank", description: "Portable Power & Chargers" },
    { id: 3, name: "Laptops", slug: "laptops", description: "High-Performance Laptops & Notebooks" },
    { id: 4, name: "Smart Watches", slug: "smart-watches", description: "Fitness Trackers & Wearables" }
  ],
  products: [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      nickname: "Titanium Beast",
      category_id: 1,
      category_name: "Phone",
      subcategory_id: 1,
      subcategory_name: "iPhones",
      price: 1199,
      original_price: 1299,
      description: "Forged in titanium with the ground-breaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.",
      size: "256GB, 512GB, 1TB",
      color: "Natural Titanium, Blue Titanium, White, Black",
      in_stock: true,
      stock_count: 45,
      rating: 4.9,
      reviews_count: 128,
      image: "/images/hero-phone.png",
      images: ["/images/hero-phone.png", "/images/product-item1.jpg"],
      specifications: [
        { title: "Processor", description: "Apple A17 Pro Bionic chip" },
        { title: "Display", description: "6.7-inch Super Retina XDR with ProMotion 120Hz" },
        { title: "Camera", description: "48MP Main | 12MP Ultra Wide | 12MP 5x Telephoto" },
        { title: "Battery", description: "Up to 29 hours video playback" }
      ]
    },
    {
      id: 2,
      name: "Anker PowerCore 24K Power Bank",
      nickname: "Ultra Charger",
      category_id: 2,
      category_name: "Power Bank",
      subcategory_id: 4,
      subcategory_name: "Fast Charging",
      price: 149,
      original_price: 179,
      description: "Ultra-powerful 24,000mAh power bank with 140W fast output and smart digital display screen for real-time telemetry.",
      size: "24,000 mAh",
      color: "Midnight Black",
      in_stock: true,
      stock_count: 30,
      rating: 4.8,
      reviews_count: 85,
      image: "/images/product-item2.jpg",
      images: ["/images/product-item2.jpg"],
      specifications: [
        { title: "Capacity", description: "24,000mAh / 86.4Wh" },
        { title: "Max Output", description: "140W Power Delivery 3.1" },
        { title: "Ports", description: "2x USB-C, 1x USB-A" },
        { title: "Display", description: "Smart Color LCD Screen" }
      ]
    },
    {
      id: 3,
      name: "MacBook Pro 16 M3 Max",
      nickname: "Creator Workstation",
      category_id: 3,
      category_name: "Laptops",
      subcategory_id: 7,
      subcategory_name: "MacBooks",
      price: 2499,
      original_price: 2699,
      description: "Supercharged by the M3 Max chip with 16-core CPU and 40-core GPU, Liquid Retina XDR display, and up to 22 hours battery life.",
      size: "36GB RAM / 1TB SSD",
      color: "Space Black, Silver",
      in_stock: true,
      stock_count: 12,
      rating: 5.0,
      reviews_count: 64,
      image: "/images/single-image1.png",
      images: ["/images/single-image1.png"],
      specifications: [
        { title: "Chipset", description: "Apple M3 Max (16-Core CPU, 40-Core GPU)" },
        { title: "Memory", description: "36GB Unified Memory" },
        { title: "Storage", description: "1TB Superfast NVMe SSD" },
        { title: "Screen", description: "16.2-inch Liquid Retina XDR (3456 x 2234)" }
      ]
    }
  ],
  admin_users: [
    {
      id: 1,
      email: "admin@oyster.com",
      password_hash: "$2a$10$wT8f6sFm.W69eD9O.M4NneCqZcQk4B3uL1r9x7g7h8i9j0k1l2m3n",
      reset_token: null,
      reset_token_expires: null
    }
  ]
};

function loadLocalData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultSeed, null, 2));
    return defaultSeed;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    if (!data.sub_categories) data.sub_categories = defaultSeed.sub_categories;
    return data;
  } catch (err) {
    return defaultSeed;
  }
}

function saveLocalData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function initDb() {
  if (pool) {
    try {
      const client = await pool.connect();
      usePg = true;
      console.log("Connected to PostgreSQL Database");
      
      await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id INTEGER;");
      await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_name VARCHAR(100);");

      await client.query("CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, slug VARCHAR(100) NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
      await client.query("CREATE TABLE IF NOT EXISTS sub_categories (id SERIAL PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, slug VARCHAR(100) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
      await client.query("CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, nickname VARCHAR(255), category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, category_name VARCHAR(100), subcategory_id INTEGER REFERENCES sub_categories(id) ON DELETE SET NULL, subcategory_name VARCHAR(100), price NUMERIC(10, 2) NOT NULL, original_price NUMERIC(10, 2), description TEXT, size VARCHAR(255), color VARCHAR(255), in_stock BOOLEAN DEFAULT true, stock_count INTEGER DEFAULT 10, rating NUMERIC(3, 2) DEFAULT 5.0, reviews_count INTEGER DEFAULT 1, image TEXT, images JSONB DEFAULT '[]', specifications JSONB DEFAULT '[]', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
      await client.query("CREATE TABLE IF NOT EXISTS admin_users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL, reset_token VARCHAR(255), reset_token_expires TIMESTAMP);");

      client.release();
    } catch (err) {
      console.log("PostgreSQL connection failed, using JSON persistent store mode:", err.message);
      usePg = false;
      loadLocalData();
    }
  } else {
    loadLocalData();
  }
}

module.exports = {
  pool,
  initDb,
  loadLocalData,
  saveLocalData,
  isPgActive: () => usePg
};
