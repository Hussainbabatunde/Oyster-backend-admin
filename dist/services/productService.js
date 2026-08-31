"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
class ProductService {
    static async getAllProducts(category, search) {
        const where = {};
        if (category) {
            const catId = parseInt(category);
            if (!isNaN(catId)) {
                where.OR = [
                    { categoryId: catId },
                    { categoryName: { equals: category, mode: 'insensitive' } },
                ];
            }
            else {
                where.categoryName = { equals: category, mode: 'insensitive' };
            }
        }
        if (search) {
            where.OR = [
                ...(where.OR || []),
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        return prisma_1.prisma.product.findMany({
            where,
            orderBy: { id: 'desc' },
        });
    }
    static async getProductById(id) {
        return prisma_1.prisma.product.findUnique({
            where: { id },
        });
    }
    static async createProduct(payload) {
        const parsedPrice = payload.price;
        const parsedOrigPrice = payload.original_price ?? parsedPrice;
        const parsedRating = payload.rating ?? 5.0;
        const parsedInStock = payload.in_stock ?? true;
        const parsedStockCount = payload.stock_count ?? 10;
        const specs = payload.specifications ?? [];
        const imgList = (payload.images && payload.images.length) ? payload.images : [payload.image || '/images/product-item1.jpg'];
        return prisma_1.prisma.product.create({
            data: {
                name: payload.name,
                nickname: payload.nickname || '',
                categoryId: payload.category_id || null,
                categoryName: payload.category_name || 'General',
                price: new client_1.Prisma.Decimal(parsedPrice),
                originalPrice: new client_1.Prisma.Decimal(parsedOrigPrice),
                description: payload.description || '',
                size: payload.size || '',
                color: payload.color || '',
                inStock: parsedInStock,
                stockCount: parsedStockCount,
                rating: new client_1.Prisma.Decimal(parsedRating),
                image: payload.image || imgList[0],
                images: imgList,
                specifications: specs,
            },
        });
    }
    static async updateProduct(id, payload) {
        const data = {};
        if (payload.name !== undefined)
            data.name = payload.name;
        if (payload.nickname !== undefined)
            data.nickname = payload.nickname;
        if (payload.category_id !== undefined)
            data.category = payload.category_id ? { connect: { id: payload.category_id } } : { disconnect: true };
        if (payload.category_name !== undefined)
            data.categoryName = payload.category_name;
        if (payload.price !== undefined)
            data.price = new client_1.Prisma.Decimal(payload.price);
        if (payload.original_price !== undefined)
            data.originalPrice = new client_1.Prisma.Decimal(payload.original_price);
        if (payload.description !== undefined)
            data.description = payload.description;
        if (payload.size !== undefined)
            data.size = payload.size;
        if (payload.color !== undefined)
            data.color = payload.color;
        if (payload.in_stock !== undefined)
            data.inStock = Boolean(payload.in_stock);
        if (payload.stock_count !== undefined)
            data.stockCount = parseInt(payload.stock_count);
        if (payload.image !== undefined)
            data.image = payload.image;
        if (payload.images !== undefined) {
            data.images = payload.images;
            if (!payload.image && payload.images.length > 0) {
                data.image = payload.images[0];
            }
        }
        if (payload.specifications !== undefined)
            data.specifications = payload.specifications;
        return prisma_1.prisma.product.update({
            where: { id },
            data,
        });
    }
    static async deleteProduct(id) {
        return prisma_1.prisma.product.delete({
            where: { id },
        });
    }
    static async rateProduct(id, rating) {
        const existing = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!existing)
            throw new Error('Product not found');
        const newReviewsCount = existing.reviewsCount + 1;
        return prisma_1.prisma.product.update({
            where: { id },
            data: {
                rating: new client_1.Prisma.Decimal(rating),
                reviewsCount: newReviewsCount,
            },
        });
    }
}
exports.ProductService = ProductService;
