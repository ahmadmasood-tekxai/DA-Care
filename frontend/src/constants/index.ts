/**
 * App-wide constants. Mirrors backend/app/constants.py where applicable.
 */
import {
  Baby,
  Camera,
  Crown,
  Gem,
  Gift,
  PartyPopper,
  Shirt,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react';

import { OrderStatus, PaymentStatus, PaymentMethod, ProductBadge, UserRole } from '@/types';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api/v1';

export const UPLOADS_BASE_URL: string =
  (import.meta.env.VITE_UPLOADS_BASE_URL as string) || 'http://localhost:8000';

export const WHATSAPP_NUMBER_1: string = (import.meta.env.VITE_WHATSAPP_NUMBER_1 as string) || '923194392573';
export const WHATSAPP_NUMBER_2: string = (import.meta.env.VITE_WHATSAPP_NUMBER_2 as string) || '923021735137';

export const AUTH_TOKEN_KEY = 'oqira_access_token';
export const AUTH_USER_KEY = 'oqira_user';
export const CART_STORAGE_KEY = 'oqira_cart';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Resolves a lucide icon name (stored as a string in the DB) to its component.
 * Falls back to Shirt if the name isn't recognized — keeps the UI from crashing
 * if an admin types a typo'd icon name. */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  PartyPopper,
  Gem,
  Camera,
  Sparkles,
  Crown,
  Gift,
  Baby,
  Star,
  Shirt,
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_REGISTRY);

export function resolveIcon(name: string): LucideIcon {
  return ICON_REGISTRY[name] || Shirt;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.STAFF]: 'Staff',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
  [OrderStatus.CONFIRMED]: 'bg-blue-50 text-blue-700 border-blue-200',
  [OrderStatus.SHIPPED]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [OrderStatus.DELIVERED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [OrderStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'Unpaid',
  [PaymentStatus.PENDING_VERIFICATION]: 'Pending Verification',
  [PaymentStatus.PAID]: 'Paid',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'bg-slate-100 text-slate-700 border-slate-200',
  [PaymentStatus.PENDING_VERIFICATION]: 'bg-amber-50 text-amber-700 border-amber-200',
  [PaymentStatus.PAID]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'Cash on Delivery',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
};

export const PRODUCT_BADGE_LABELS: Record<ProductBadge, string> = {
  [ProductBadge.NONE]: '',
  [ProductBadge.BESTSELLER]: 'Bestseller',
  [ProductBadge.NEW]: 'New',
  [ProductBadge.FAVOURITE]: 'Favourite',
  [ProductBadge.STUDIO_PICK]: 'Studio Pick',
};

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string = ':slug') => `/products/${slug}`,
  CART: '/cart',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
} as const;

export const CURRENCY_SYMBOL = 'Rs.';

export const STORE_NAME = 'OQIRA';
export const STORE_TAGLINE = 'Skin Care · Jewellery · Apparel';
