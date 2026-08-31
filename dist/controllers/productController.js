"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const productService_1 = require("../services/productService");
class ProductController {
    static async getAll(req, res, next) {
        try {
            const { category, search } = req.query;
            const products = await productService_1.ProductService.getAllProducts(category, search);
            return res.json({ success: true, products });
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ success: false, message: 'Invalid product ID' });
            const product = await productService_1.ProductService.getProductById(id);
            if (!product)
                return res.status(404).json({ success: false, message: 'Product not found' });
            return res.json({ success: true, product });
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const { name, price } = req.body;
            if (!name || price === undefined) {
                return res.status(400).json({ success: false, message: 'Product name and price are required' });
            }
            const product = await productService_1.ProductService.createProduct(req.body);
            return res.status(201).json({ success: true, product });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ success: false, message: 'Invalid product ID' });
            const product = await productService_1.ProductService.updateProduct(id, req.body);
            return res.json({ success: true, product });
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ success: false, message: 'Invalid product ID' });
            await productService_1.ProductService.deleteProduct(id);
            return res.json({ success: true, message: 'Product deleted' });
        }
        catch (err) {
            next(err);
        }
    }
    static async rate(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const { rating } = req.body;
            const numRating = parseFloat(rating);
            if (isNaN(id) || isNaN(numRating) || numRating < 1 || numRating > 5) {
                return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
            }
            const product = await productService_1.ProductService.rateProduct(id, numRating);
            return res.json({ success: true, product });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ProductController = ProductController;
