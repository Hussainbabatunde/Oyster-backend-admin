import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAllCategories();
      return res.json({ success: true, categories });
    } catch (err: any) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }

      const category = await CategoryService.createCategory({ name, description });
      return res.status(201).json({ success: true, category });
    } catch (err: any) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid category ID' });

      const category = await CategoryService.updateCategory(id, req.body);
      return res.json({ success: true, category });
    } catch (err: any) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid category ID' });

      await CategoryService.deleteCategory(id);
      return res.json({ success: true, message: 'Category deleted' });
    } catch (err: any) {
      next(err);
    }
  }
}
