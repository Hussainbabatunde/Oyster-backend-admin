"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_1 = require("../config/prisma");
class CategoryService {
    static async getAllCategories() {
        return prisma_1.prisma.category.findMany({
            orderBy: { id: 'asc' },
        });
    }
    static async createCategory(payload) {
        const slug = payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        return prisma_1.prisma.category.create({
            data: {
                name: payload.name,
                slug,
                description: payload.description || '',
            },
        });
    }
    static async updateCategory(id, payload) {
        const data = {};
        if (payload.name !== undefined) {
            data.name = payload.name;
            data.slug = payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        }
        if (payload.description !== undefined) {
            data.description = payload.description;
        }
        return prisma_1.prisma.category.update({
            where: { id },
            data,
        });
    }
    static async deleteCategory(id) {
        return prisma_1.prisma.category.delete({
            where: { id },
        });
    }
}
exports.CategoryService = CategoryService;
