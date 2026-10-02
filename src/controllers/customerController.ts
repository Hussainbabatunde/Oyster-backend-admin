import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService';

export class CustomerController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, pageSize, search } = req.query as {
        page?: string;
        limit?: string;
        pageSize?: string;
        search?: string;
      };

      const pageNum = parseInt(page || '1', 10);
      const limitNum = parseInt(limit || pageSize || '10', 10);

      const result = await CustomerService.getCustomers({
        page: isNaN(pageNum) ? 1 : pageNum,
        limit: isNaN(limitNum) ? 10 : limitNum,
        search,
      });

      return res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid customer ID' });
      }

      const customer = await CustomerService.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      return res.json({ success: true, customer });
    } catch (err: any) {
      next(err);
    }
  }
}
