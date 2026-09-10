"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_1 = require("../config/prisma");
function parseSubcategoriesInput(input) {
    if (!input)
        return [];
    let items = [];
    if (typeof input === 'string') {
        items = input.split(',').map(s => s.trim()).filter(Boolean);
    }
    else if (Array.isArray(input)) {
        items = input;
    }
    return items.map(item => {
        let name = typeof item === 'string' ? item : (item?.name || '');
        name = name.trim();
        const slug = typeof item === 'object' && item?.slug ? item.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return { name, slug };
    }).filter(sub => sub.name.length > 0);
}
class CategoryService {
    static async getAllCategories() {
        let categories;
        try {
            categories = await prisma_1.prisma.category.findMany({
                include: {
                    subcategories: {
                        orderBy: { id: 'asc' },
                    },
                },
                orderBy: { id: 'asc' },
            });
        }
        catch (err) {
            console.warn('Prisma subcategories include error, using fallback:', err.message);
            const rawCats = await prisma_1.prisma.category.findMany({ orderBy: { id: 'asc' } });
            let allSubs = [];
            try {
                allSubs = await prisma_1.prisma.subCategory.findMany({ orderBy: { id: 'asc' } });
            }
            catch (e) { }
            categories = rawCats.map(cat => {
                const subcategories = allSubs.filter(sub => sub.categoryId === cat.id);
                return { ...cat, subcategories };
            });
        }
        return categories.map(cat => ({
            ...cat,
            sub_categories: cat.subcategories || [],
        }));
    }
    static async createCategory(payload) {
        const slug = payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        const subcats = parseSubcategoriesInput(payload.subcategories || payload.sub_categories);
        const category = await prisma_1.prisma.category.create({
            data: {
                name: payload.name,
                slug,
                description: payload.description || '',
                subcategories: subcats.length > 0 ? {
                    create: subcats,
                } : undefined,
            },
            include: {
                subcategories: {
                    orderBy: { id: 'asc' },
                },
            },
        });
        return {
            ...category,
            sub_categories: category.subcategories,
        };
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
        const subcatsInput = payload.subcategories || payload.sub_categories;
        if (subcatsInput !== undefined) {
            const subcats = parseSubcategoriesInput(subcatsInput);
            if (subcats.length > 0) {
                data.subcategories = {
                    create: subcats,
                };
            }
        }
        const category = await prisma_1.prisma.category.update({
            where: { id },
            data,
            include: {
                subcategories: {
                    orderBy: { id: 'asc' },
                },
            },
        });
        return {
            ...category,
            sub_categories: category.subcategories,
        };
    }
    static async deleteCategory(id) {
        return prisma_1.prisma.category.delete({
            where: { id },
        });
    }
    static async addSubcategory(categoryId, name) {
        const trimmed = name.trim();
        const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return prisma_1.prisma.subCategory.create({
            data: {
                categoryId,
                name: trimmed,
                slug,
            },
        });
    }
    static async deleteSubcategory(subcategoryId) {
        return prisma_1.prisma.subCategory.delete({
            where: { id: subcategoryId },
        });
    }
}
exports.CategoryService = CategoryService;
