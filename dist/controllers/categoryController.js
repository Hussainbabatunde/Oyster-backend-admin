"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const categoryService_1 = require("../services/categoryService");
class CategoryController {
    static async getAll(req, res, next) {
        try {
            const categories = await categoryService_1.CategoryService.getAllCategories();
            return res.json({ success: true, categories });
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Category name is required' });
            }
            const category = await categoryService_1.CategoryService.createCategory({ name, description });
            return res.status(201).json({ success: true, category });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ success: false, message: 'Invalid category ID' });
            const category = await categoryService_1.CategoryService.updateCategory(id, req.body);
            return res.json({ success: true, category });
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ success: false, message: 'Invalid category ID' });
            await categoryService_1.CategoryService.deleteCategory(id);
            return res.json({ success: true, message: 'Category deleted' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CategoryController = CategoryController;
