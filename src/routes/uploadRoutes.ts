import { Router } from 'express';
import { uploadProductImages } from '../middlewares/upload';
import { UploadController } from '../controllers/uploadController';

const router = Router();

// POST /api/upload (or POST /api/upload/images)
router.post('/', uploadProductImages, UploadController.uploadImages);

export default router;
