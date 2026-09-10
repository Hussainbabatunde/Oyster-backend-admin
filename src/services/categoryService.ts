import { prisma } from '../config/prisma';
import { CategoryPayload } from '../types';

function parseSubcategoriesInput(input?: any): Array<{ name: string; slug: string }> {
  if (!input) return [];
  let items: any[] = [];
  if (typeof input === 'string') {
    items = input.split(',').map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(input)) {
    items = input;
  }
  return items.map(item => {
    let name = typeof item === 'string' ? item : (item?.name || '');
    name = name.trim();
    const slug = typeof item === 'object' && item?.slug ? item.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return { name, slug };
  }).filter(sub => sub.name.length > 0);
}

export class CategoryService {
  static async getAllCategories() {
    let categories: any[];
    try {
      categories = await prisma.category.findMany({
        include: {
          subcategories: {
            orderBy: { id: 'asc' },
          },
        },
        orderBy: { id: 'asc' },
      });
    } catch (err: any) {
      console.warn('Prisma subcategories include error, using fallback:', err.message);
      const rawCats = await prisma.category.findMany({ orderBy: { id: 'asc' } });
      let allSubs: any[] = [];
      try {
        allSubs = await prisma.subCategory.findMany({ orderBy: { id: 'asc' } });
      } catch (e) {}

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

  static async createCategory(payload: CategoryPayload) {
    const slug = payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const subcats = parseSubcategoriesInput(payload.subcategories || payload.sub_categories);

    const category = await prisma.category.create({
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

  static async updateCategory(id: number, payload: Partial<CategoryPayload>) {
    const data: any = {};
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

    const category = await prisma.category.update({
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

  static async deleteCategory(id: number) {
    return prisma.category.delete({
      where: { id },
    });
  }

  static async addSubcategory(categoryId: number, name: string) {
    const trimmed = name.trim();
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return prisma.subCategory.create({
      data: {
        categoryId,
        name: trimmed,
        slug,
      },
    });
  }

  static async deleteSubcategory(subcategoryId: number) {
    return prisma.subCategory.delete({
      where: { id: subcategoryId },
    });
  }
}

