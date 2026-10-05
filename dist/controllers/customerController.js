"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customerService_1 = require("../services/customerService");
class CustomerController {
    static async getAll(req, res, next) {
        try {
            const { page, limit, pageSize, search } = req.query;
            const pageNum = parseInt(page || '1', 10);
            const limitNum = parseInt(limit || pageSize || '10', 10);
            const result = await customerService_1.CustomerService.getCustomers({
                page: isNaN(pageNum) ? 1 : pageNum,
                limit: isNaN(limitNum) ? 10 : limitNum,
                search,
            });
            return res.json({
                success: true,
                ...result,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: 'Invalid customer ID' });
            }
            const customer = await customerService_1.CustomerService.getCustomerById(id);
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }
            return res.json({ success: true, customer });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CustomerController = CustomerController;
