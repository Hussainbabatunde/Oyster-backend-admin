import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { StorageService } from "../services/storageService";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class UploadController {
  static async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided. Please attach at least 1 image file under the field name "images".',
        });
      }


      const imageUrls: string[] = [];
      let uploadProvider = "AWS S3";

      for (const file of files) {
        // 1. Try uploading to AWS S3 first
        const s3Url = await StorageService.uploadToS3(file);

        if (s3Url) {
          imageUrls.push(s3Url);
          uploadProvider = "AWS S3";
        } else {
          // 2. Fallback to Cloudinary if AWS S3 credentials are not set
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: process.env.CLOUDINARY_FOLDER || "oyster-images",
            });
            imageUrls.push(result.secure_url);
            uploadProvider = "Cloudinary";
          } catch (uploadErr) {
            // 3. Fallback to Local Server URL
            console.warn("Cloudinary upload warning, falling back to local URL:", uploadErr);
            const host = req.get("host");
            const protocol = req.protocol;
            imageUrls.push(`${protocol}://${host}/uploads/${file.filename}`);
            uploadProvider = "Local Server";
          }
        }

        // Clean up temporary file from local disk if created
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
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
    } catch (err: any) {
      next(err);
    }
  }
}

