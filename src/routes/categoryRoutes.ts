import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

const router = Router();

router.get('/', CategoryController.getAll);
router.post('/', CategoryController.create);
router.post('/:id/subcategories', CategoryController.addSubcategory);
router.delete('/subcategories/:subId', CategoryController.deleteSubcategory);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
