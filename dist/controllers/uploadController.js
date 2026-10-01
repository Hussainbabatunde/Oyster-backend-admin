"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const storageService_1 = require("../services/storageService");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class UploadController {
    static async uploadImages(req, res, next) {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No image files provided. Please attach at least 1 image file under the field name "images".',
                });
            }
            const imageUrls = [];
            let uploadProvider = "AWS S3";
            for (const file of files) {
                // 1. Try uploading to AWS S3 first
                const s3Url = await storageService_1.StorageService.uploadToS3(file);
                if (s3Url) {
                    imageUrls.push(s3Url);
                    uploadProvider = "AWS S3";
                }
                else {
                    // 2. Fallback to Cloudinary if AWS S3 credentials are not set
                    try {
                        const result = await cloudinary_1.v2.uploader.upload(file.path, {
                            folder: process.env.CLOUDINARY_FOLDER || "oyster-images",
                        });
                        imageUrls.push(result.secure_url);
                        uploadProvider = "Cloudinary";
                    }
                    catch (uploadErr) {
                        // 3. Fallback to Local Server URL
                        console.warn("Cloudinary upload warning, falling back to local URL:", uploadErr);
                        const host = req.get("host");
                        const protocol = req.protocol;
                        imageUrls.push(`${protocol}://${host}/uploads/${file.filename}`);
                        uploadProvider = "Local Server";
                    }
                }
                // Clean up temporary file from local disk if created
                if (file.path && fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            }
            return res.status(200).json({
                success: true,
                message: `Successfully uploaded ${files.length} image(s) using ${uploadProvider}.`,
                provider: uploadProvider,
                count: files.length,
                primaryImage: imageUrls[0],
                images: imageUrls,
                fullImages: imageUrls,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UploadController = UploadController;
