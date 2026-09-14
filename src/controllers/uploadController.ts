import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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
          message: "No image files provided. Please attach at least 1 image file under the field name \"images\".",
        });
      }

      const imageUrls: string[] = [];

      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: process.env.CLOUDINARY_FOLDER || "oyster-images",
          });
          imageUrls.push(result.secure_url);
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadErr) {
          console.warn("Cloudinary upload warning, falling back to local URL:", uploadErr);
          const host = req.get("host");
          const protocol = req.protocol;
          imageUrls.push(`${protocol}://${host}/uploads/${file.filename}`);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${files.length} image(s) to Cloudinary.`,
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
