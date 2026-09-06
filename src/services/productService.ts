import { prisma } from '../config/prisma';
import { ProductPayload } from '../types';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async getAllProducts(category?: string, search?: string) {
    const andConditions: Prisma.ProductWhereInput[] = [];

    if (category) {
      const catId = parseInt(category);
      if (!isNaN(catId)) {
        andConditions.push({
          OR: [
            { categoryId: catId },
            { categoryName: { equals: category, mode: 'insensitive' } },
          ],
        });
      } else {
        andConditions.push({ categoryName: { equals: category, mode: 'insensitive' } });
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
    });
  }

  static async getProductById(id: number) {
    return prisma.product.findUnique({
      where: { id },
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

    return prisma.product.create({
      data: {
        name: payload.name,
        nickname: payload.nickname || '',
        category: payload.category_id ? { connect: { id: payload.category_id } } : undefined,
        categoryName: payload.category_name || 'General',
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
