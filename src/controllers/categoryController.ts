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
      const { name, description, subcategories, sub_categories } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }

      const category = await CategoryService.createCategory({
        name,
        description,
        subcategories: subcategories || sub_categories,
      });
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

  static async addSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid category ID' });
      if (!name || !String(name).trim()) {
        return res.status(400).json({ success: false, message: 'Subcategory name is required' });
      }

      const subcategory = await CategoryService.addSubcategory(id, String(name).trim());
      return res.status(201).json({ success: true, subcategory });
    } catch (err: any) {
      next(err);
    }
  }

  static async deleteSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      const subId = parseInt(req.params.subId);
      if (isNaN(subId)) return res.status(400).json({ success: false, message: 'Invalid subcategory ID' });

      await CategoryService.deleteSubcategory(subId);
      return res.json({ success: true, message: 'Subcategory deleted' });
    } catch (err: any) {
      next(err);
    }
  }
}

