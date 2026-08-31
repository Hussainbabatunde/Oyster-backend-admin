"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImages = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure uploads directory exists
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Multer Storage Configuration
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `product-${uniqueSuffix}${ext}`);
    },
});
// File Filter for Images
const fileFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|avif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
        return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif, avif) are allowed!'));
};
exports.uploadProductImages = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file limit
}).array('images', 10); // Allow up to 10 image uploads at once
