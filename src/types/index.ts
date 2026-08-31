import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface CategoryPayload {
  name: string;
  description?: string;
}

export interface ProductPayload {
  name: string;
  nickname?: string;
  category_id?: number;
  category_name?: string;
  price: number;
  original_price?: number;
  description?: string;
  size?: string;
  color?: string;
  in_stock?: boolean;
  stock_count?: number;
  rating?: number;
  image?: string;
  images?: string[];
  specifications?: Array<{ title: string; description: string }>;
}
