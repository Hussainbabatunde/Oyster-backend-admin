import { prisma } from '../config/prisma';
import { ProductPayload } from '../types';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async getAllProducts(categoryId?: string, subcategoryId?: string, search?: string) {
    const andConditions: Prisma.ProductWhereInput[] = [];

    if (categoryId && categoryId.toLowerCase() !== 'all') {
      const parsedCatId = parseInt(categoryId);
      if (!isNaN(parsedCatId)) {
        andConditions.push({
          OR: [
            { categoryId: parsedCatId },
            { category: { id: parsedCatId } }
          ]
        });
      } else {
        andConditions.push({
          OR: [
            { categoryName: { equals: categoryId, mode: 'insensitive' } },
            { category: { slug: { equals: categoryId, mode: 'insensitive' } } },
            { category: { name: { equals: categoryId, mode: 'insensitive' } } }
          ]
        });
      }
    }

    if (subcategoryId && subcategoryId.toLowerCase() !== 'all') {
      const parsedSubId = parseInt(subcategoryId);
      if (!isNaN(parsedSubId)) {
        andConditions.push({
          OR: [
            { subcategoryId: parsedSubId },
            { subcategory: { id: parsedSubId } }
          ]
        });
      } else {
        andConditions.push({
          OR: [
            { subcategoryName: { equals: subcategoryId, mode: 'insensitive' } },
            { subcategory: { slug: { equals: subcategoryId, mode: 'insensitive' } } },
            { subcategory: { name: { equals: subcategoryId, mode: 'insensitive' } } }
          ]
        });
      }
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      andConditions.push({
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { certificateNumber: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    return prisma.product.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        category: true,
        subcategory: true
      }
    });
  }

  static async getProductById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true
      }
    });
  }

  static async createProduct(payload: ProductPayload) {
    const parsedPrice = payload.price;
    const parsedOrigPrice = payload.original_price ?? parsedPrice;
    const parsedRating = payload.rating ?? 5.0;
    const parsedInStock = payload.in_stock ?? true;
    const parsedStockCount = payload.stock_count ?? 10;
    const specs = payload.specifications ?? [];
    const imgList = (payload.images && payload.images.length) ? payload.images : [payload.image || '/images/product-item1.jpg'];

    const catId = payload.category_id || (payload as any).categoryId;
    const subId = payload.subcategory_id || (payload as any).subcategoryId;

    let catName = payload.category_name || (payload as any).categoryName || '';
    let subName = payload.subcategory_name || (payload as any).subcategoryName || '';

    if (catId && !catName) {
      const c = await prisma.category.findUnique({ where: { id: catId } });
      if (c) catName = c.name;
    }
    if (subId && !subName) {
      const s = await prisma.subCategory.findUnique({ where: { id: subId } });
      if (s) subName = s.name;
    }

    return prisma.product.create({
      data: {
        name: payload.name,
        nickname: payload.nickname || '',
        categoryId: catId || undefined,
        categoryName: catName || 'General',
        subcategoryId: subId || undefined,
        subcategoryName: subName || '',
        price: new Prisma.Decimal(parsedPrice),
        originalPrice: new Prisma.Decimal(parsedOrigPrice),
        description: payload.description || '',
        size: payload.size || '',
        color: payload.color || '',
        inStock: parsedInStock,
        stockCount: parsedStockCount,
        rating: new Prisma.Decimal(parsedRating),
        image: payload.image || imgList[0],
        images: imgList as any,
        specifications: specs as any,
        certificateNumber: payload.certificate_number || payload.certificateNumber || '',
      },
    });
  }

  static async updateProduct(id: number, payload: Partial<ProductPayload>) {
    const data: Prisma.ProductUpdateInput = {};

    if (payload.name !== undefined) data.name = payload.name;
    if (payload.nickname !== undefined) data.nickname = payload.nickname;
    if (payload.category_id !== undefined) data.category = payload.category_id ? { connect: { id: payload.category_id } } : { disconnect: true };
    if (payload.category_name !== undefined) data.categoryName = payload.category_name;
    if (payload.subcategory_id !== undefined) data.subcategory = payload.subcategory_id ? { connect: { id: payload.subcategory_id } } : { disconnect: true };
    if (payload.subcategory_name !== undefined) data.subcategoryName = payload.subcategory_name;
    if (payload.price !== undefined) data.price = new Prisma.Decimal(payload.price);
    if (payload.original_price !== undefined) data.originalPrice = new Prisma.Decimal(payload.original_price);
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.size !== undefined) data.size = payload.size;
    if (payload.color !== undefined) data.color = payload.color;
    if (payload.in_stock !== undefined) data.inStock = Boolean(payload.in_stock);
    if (payload.stock_count !== undefined) data.stockCount = parseInt(payload.stock_count as any);
    if (payload.image !== undefined) data.image = payload.image;
    if (payload.images !== undefined) {
      data.images = payload.images as any;
      if (!payload.image && payload.images.length > 0) {
        data.image = payload.images[0];
      }
    }
    if (payload.specifications !== undefined) data.specifications = payload.specifications as any;
    const certNo = payload.certificate_number ?? payload.certificateNumber;
    if (certNo !== undefined) data.certificateNumber = certNo;

    return prisma.product.update({
      where: { id },
      data,
    });
  }

  static async deleteProduct(id: number) {
    return prisma.product.delete({
      where: { id },
    });
  }

  static async rateProduct(id: number, rating: number) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new Error('Product not found');

    const newReviewsCount = existing.reviewsCount + 1;
    return prisma.product.update({
      where: { id },
      data: {
        rating: new Prisma.Decimal(rating),
        reviewsCount: newReviewsCount,
      },
    });
  }
}
