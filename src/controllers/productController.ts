import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query as { category?: string; search?: string };
      const products = await ProductService.getAllProducts(category, search);
      return res.json({ success: true, products });
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });

      const product = await ProductService.getProductById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      return res.json({ success: true, product });
    } catch (err: any) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price } = req.body;
      if (!name || price === undefined) {
        return res.status(400).json({ success: false, message: 'Product name and price are required' });
      }

      const product = await ProductService.createProduct(req.body);
      return res.status(201).json({ success: true, product });
    } catch (err: any) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });

      const product = await ProductService.updateProduct(id, req.body);
      return res.json({ success: true, product });
    } catch (err: any) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });

      await ProductService.deleteProduct(id);
      return res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
      next(err);
    }
  }

  static async rate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { rating } = req.body;
      const numRating = parseFloat(rating);

      if (isNaN(id) || isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
      }

      const product = await ProductService.rateProduct(id, numRating);
      return res.json({ success: true, product });
    } catch (err: any) {
      next(err);
    }
  }
}
