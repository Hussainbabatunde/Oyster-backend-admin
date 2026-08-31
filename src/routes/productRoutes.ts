import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { uploadProductImages } from '../middlewares/upload';
import { UploadController } from '../controllers/uploadController';

const router = Router();

router.get('/', ProductController.getAll);
router.post('/upload', uploadProductImages, UploadController.uploadImages);
router.get('/:id', ProductController.getById);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);
router.post('/:id/rate', ProductController.rate);

export default router;

