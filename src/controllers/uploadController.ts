import { Request, Response, NextFunction } from 'express';

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

      const host = req.get('host');
      const protocol = req.protocol;

      const imageUrls = files.map(file => `/uploads/${file.filename}`);
      const fullImageUrls = files.map(file => `${protocol}://${host}/uploads/${file.filename}`);

      return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${files.length} image(s).`,
        count: files.length,
        primaryImage: imageUrls[0],
        images: imageUrls,
        fullImages: fullImageUrls,
      });
    } catch (err: any) {
      next(err);
    }
  }
}
