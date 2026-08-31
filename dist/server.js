"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
// Set Server Timezone
const timezone = 'Africa/Lagos';
process.env.TZ = timezone;
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Rate Limiter Configuration
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200,
    message: 'Too many requests from this IP, please try again after 5 minutes',
});
// CORS Configuration
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,x-api-key',
    credentials: false,
};
app.use((0, cors_1.default)(corsOptions));
app.use(limiter);
app.use(express_1.default.json());
// API Routes
app.use('/api/health', healthRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
// Root Route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Oyster E-Commerce & Admin Platform Express TypeScript Prisma API',
        timezone: process.env.TZ,
        health: '/api/health',
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Oyster Backend API server running on http://localhost:${PORT}`);
    console.log(`🌍 Timezone set to: ${process.env.TZ}`);
    console.log(`⚡ Powered by Express + TypeScript + Prisma ORM + Neon PostgreSQL`);
});
exports.default = app;
