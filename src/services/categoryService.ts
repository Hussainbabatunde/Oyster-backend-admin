import { prisma } from '../config/prisma';
import { CategoryPayload } from '../types';
import fs from 'fs';
import path from 'path';

function loadFallbackData() {
  try {
    const dataPath = path.join(process.cwd(), 'data.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) { }
  return { categories: [], sub_categories: [], products: [] };
}

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
      console.warn('Prisma categories fetch error, using data.json fallback:', err.message);
      const fallback = loadFallbackData();
      const cats = fallback.categories || [];
      const subcats = fallback.sub_categories || [];

      categories = cats.map((cat: any) => {
        const matchingSubs = subcats.filter((sub: any) => sub.category_id === cat.id || sub.categoryId === cat.id);
        return {
          ...cat,
          subcategories: matchingSubs
        };
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

    try {
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
    } catch (err: any) {
      const fallback = loadFallbackData();
      const newCat = {
        id: Date.now(),
        name: payload.name,
        slug,
        description: payload.description || '',
        subcategories: subcats
      };
      fallback.categories.push(newCat);
      fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(fallback, null, 2));
      return {
        ...newCat,
        sub_categories: newCat.subcategories
      };
    }
  }

  static async updateCategory(id: number, payload: Partial<CategoryPayload>) {
    try {
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
    } catch (err: any) {
      const fallback = loadFallbackData();
      const cat = fallback.categories.find((c: any) => c.id === id);
      if (cat) {
        if (payload.name !== undefined) cat.name = payload.name;
        if (payload.description !== undefined) cat.description = payload.description;
        fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(fallback, null, 2));
        return { ...cat, sub_categories: cat.subcategories || [] };
      }
      throw err;
    }
  }

  static async deleteCategory(id: number) {
    try {
      return await prisma.category.delete({
        where: { id },
      });
    } catch (err) {
      const fallback = loadFallbackData();
      fallback.categories = fallback.categories.filter((c: any) => c.id !== id);
      fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(fallback, null, 2));
      return { id };
    }
  }

  static async addSubcategory(categoryId: number, name: string) {
    const trimmed = name.trim();
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      return await prisma.subCategory.create({
        data: {
          categoryId,
          name: trimmed,
          slug,
        },
      });
    } catch (err) {
      const fallback = loadFallbackData();
      const newSub = { id: Date.now(), category_id: categoryId, name: trimmed, slug };
      fallback.sub_categories.push(newSub);
      fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(fallback, null, 2));
      return newSub;
    }
  }

  static async deleteSubcategory(subcategoryId: number) {
    try {
      return await prisma.subCategory.delete({
        where: { id: subcategoryId },
      });
    } catch (err) {
      const fallback = loadFallbackData();
      fallback.sub_categories = fallback.sub_categories.filter((s: any) => s.id !== subcategoryId);
      fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(fallback, null, 2));
      return { id: subcategoryId };
    }
  }
}
