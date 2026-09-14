import { prisma } from '../config/prisma';
import { ProductPayload } from '../types';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function loadFallbackData() {
  try {
    const dataPath = path.join(process.cwd(), 'data.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {}
  return { products: [], categories: [], sub_categories: [] };
}

function saveFallbackData(data: any) {
  try {
    const dataPath = path.join(process.cwd(), 'data.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (e) {}
}

export class ProductService {
  static async getAllProducts(categoryId?: string, subcategoryId?: string, search?: string) {
    try {
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

      return await prisma.product.findMany({
        where,
        orderBy: { id: 'desc' },
        include: {
          category: true,
          subcategory: true
        }
      });
    } catch (err: any) {
      console.warn('⚠️ Prisma products fetch error, falling back to data.json:', err.message);
      const fallback = loadFallbackData();
      let prods = fallback.products || [];

      if (categoryId && categoryId.toLowerCase() !== 'all') {
        const parsedCatId = parseInt(categoryId);
        prods = prods.filter((p: any) => {
          if (!isNaN(parsedCatId)) {
            return p.category_id === parsedCatId || p.categoryId === parsedCatId;
          }
          const catName = p.category_name || p.categoryName || '';
          return catName.toLowerCase() === categoryId.toLowerCase();
        });
      }

      if (subcategoryId && subcategoryId.toLowerCase() !== 'all') {
        const parsedSubId = parseInt(subcategoryId);
        prods = prods.filter((p: any) => {
          if (!isNaN(parsedSubId)) {
            return p.subcategory_id === parsedSubId || p.subcategoryId === parsedSubId;
          }
          const subName = p.subcategory_name || p.subcategoryName || '';
          return subName.toLowerCase() === subcategoryId.toLowerCase();
        });
      }

      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        prods = prods.filter((p: any) =>
          (p.name && p.name.toLowerCase().includes(s)) ||
          (p.description && p.description.toLowerCase().includes(s))
        );
      }

      return prods.map((p: any) => ({
        ...p,
        categoryId: p.category_id || p.categoryId,
        categoryName: p.category_name || p.categoryName,
        subcategoryId: p.subcategory_id || p.subcategoryId,
        subcategoryName: p.subcategory_name || p.subcategoryName,
        originalPrice: p.original_price ?? p.originalPrice ?? p.price,
        inStock: p.in_stock ?? p.inStock ?? true,
        stockCount: p.stock_count ?? p.stockCount ?? 10,
        reviewsCount: p.reviews_count ?? p.reviewsCount ?? 1,
        category: { id: p.category_id || p.categoryId, name: p.category_name || p.categoryName },
        subcategory: { id: p.subcategory_id || p.subcategoryId, name: p.subcategory_name || p.subcategoryName }
      }));
    }
  }

  static async getProductById(id: number) {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true
        }
      });
    } catch (err) {
      const fallback = loadFallbackData();
      const p = (fallback.products || []).find((prod: any) => prod.id === id);
      if (!p) return null;
      return {
        ...p,
        categoryId: p.category_id || p.categoryId,
        categoryName: p.category_name || p.categoryName,
        subcategoryId: p.subcategory_id || p.subcategoryId,
        subcategoryName: p.subcategory_name || p.subcategoryName,
        originalPrice: p.original_price ?? p.originalPrice ?? p.price,
        inStock: p.in_stock ?? p.inStock ?? true,
        stockCount: p.stock_count ?? p.stockCount ?? 10,
        reviewsCount: p.reviews_count ?? p.reviewsCount ?? 1,
        category: { id: p.category_id || p.categoryId, name: p.category_name || p.categoryName },
        subcategory: { id: p.subcategory_id || p.subcategoryId, name: p.subcategory_name || p.subcategoryName }
      };
    }
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

    try {
      if (catId && !catName) {
        const c = await prisma.category.findUnique({ where: { id: catId } });
        if (c) catName = c.name;
      }
      if (subId && !subName) {
        const s = await prisma.subCategory.findUnique({ where: { id: subId } });
        if (s) subName = s.name;
      }

      return await prisma.product.create({
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
    } catch (err: any) {
      console.warn('Prisma create product fallback to data.json');
      const fallback = loadFallbackData();
      const newProd = {
        id: Date.now(),
        name: payload.name,
        nickname: payload.nickname || '',
        category_id: catId,
        category_name: catName || 'General',
        subcategory_id: subId,
        subcategory_name: subName || '',
        price: Number(parsedPrice),
        original_price: Number(parsedOrigPrice),
        description: payload.description || '',
        size: payload.size || '',
        color: payload.color || '',
        in_stock: parsedInStock,
        stock_count: parsedStockCount,
        rating: Number(parsedRating),
        reviews_count: 1,
        image: payload.image || imgList[0],
        images: imgList,
        specifications: specs
      };
      fallback.products.unshift(newProd);
      saveFallbackData(fallback);
      return newProd;
    }
  }

  static async updateProduct(id: number, payload: Partial<ProductPayload>) {
    try {
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

      return await prisma.product.update({
        where: { id },
        data,
      });
    } catch (err: any) {
      const fallback = loadFallbackData();
      const idx = fallback.products.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        if (payload.name !== undefined) fallback.products[idx].name = payload.name;
        if (payload.price !== undefined) fallback.products[idx].price = Number(payload.price);
        if (payload.image !== undefined) fallback.products[idx].image = payload.image;
        if (payload.images !== undefined) fallback.products[idx].images = payload.images;
        saveFallbackData(fallback);
        return fallback.products[idx];
      }
      throw err;
    }
  }

  static async deleteProduct(id: number) {
    try {
      return await prisma.product.delete({
        where: { id },
      });
    } catch (err) {
      const fallback = loadFallbackData();
      fallback.products = fallback.products.filter((p: any) => p.id !== id);
      saveFallbackData(fallback);
      return { id };
    }
  }

  static async rateProduct(id: number, rating: number) {
    try {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) throw new Error('Product not found');

      const newReviewsCount = existing.reviewsCount + 1;
      return await prisma.product.update({
        where: { id },
        data: {
          rating: new Prisma.Decimal(rating),
          reviewsCount: newReviewsCount,
        },
      });
    } catch (err) {
      const fallback = loadFallbackData();
      const p = fallback.products.find((prod: any) => prod.id === id);
      if (p) {
        p.rating = rating;
        p.reviews_count = (p.reviews_count || 1) + 1;
        saveFallbackData(fallback);
        return p;
      }
      throw new Error('Product not found');
    }
  }
}
