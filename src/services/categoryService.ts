import { prisma } from '../config/prisma';
import { CategoryPayload } from '../types';

export class CategoryService {
  static async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
  }

  static async createCategory(payload: CategoryPayload) {
    const slug = payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    return prisma.category.create({
      data: {
        name: payload.name,
        slug,
        description: payload.description || '',
      },
    });
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

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: number) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
