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

import { OrderStatus, PaymentStatus, PaymentMethod, ProductBadge, UserRole, type ProductSort } from '@/types';

const env = import.meta.env;

/** Strips a trailing slash so callers can always join with a leading `/`. */
const trimSlash = (url: string) => url.replace(/\/+$/, '');

export const API_BASE_URL: string = trimSlash(env.VITE_API_BASE_URL || 'https://okira-backend.vercel.app/api/v1');

export const UPLOADS_BASE_URL: string = trimSlash(env.VITE_UPLOADS_BASE_URL || 'https://okira-backend.vercel.app');

/** Public storefront origin — used for canonical URLs, Open Graph and JSON-LD. */
export const SITE_URL: string = trimSlash(env.VITE_SITE_URL || 'https://okira.vercel.app');

export const WHATSAPP_NUMBER_1: string = env.VITE_WHATSAPP_NUMBER_1 || '923247508462';
export const WHATSAPP_NUMBER_2: string = env.VITE_WHATSAPP_NUMBER_2 || '923021735137';

export const SUPPORT_EMAIL: string = env.VITE_SUPPORT_EMAIL || 'oqiraofficial@gmail.com';

/** Bank accounts shown on the bank-transfer step of checkout. */
export const BANK_ACCOUNTS = {
  meezan: {
    bank: 'Meezan Bank',
    title: env.VITE_MEEZAN_TITLE || 'Muhammad Daud',
    account: env.VITE_MEEZAN_ACCOUNT || '11560114539564',
  },
  mashreq: {
    bank: 'Mashreq Bank',
    title: env.VITE_MASHREQ_TITLE || 'Muhammad Ahmad',
    account: env.VITE_MASHREQ_ACCOUNT || '089010046367',
    iban: env.VITE_MASHREQ_IBAN || 'PK45MSHQ0000089010046367',
  },
} as const;

export const AUTH_TOKEN_KEY = 'oqira_access_token';
export const AUTH_USER_KEY = 'oqira_user';
export const CART_STORAGE_KEY = 'oqira_cart';
export const WISHLIST_STORAGE_KEY = 'oqira_wishlist';

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
  [UserRole.CUSTOMER]: 'Customer',
};

/** Admin-panel access. Mirrors STAFF_ROLES in backend/app/constants.py. */
export function isStaffRole(role?: UserRole | null): boolean {
  return role === UserRole.ADMIN || role === UserRole.STAFF;
}

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

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'name', label: 'Name: A–Z' },
];

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string = ':slug') => `/products/${slug}`,
  CATEGORY_PAGE: (slug: string = ':slug') => `/categories/${slug}`,
  CART: '/cart',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ACCOUNT: '/account',
  WISHLIST: '/wishlist',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
} as const;

export const CURRENCY_SYMBOL = 'Rs.';

export const STORE_NAME = 'OQIRA';
export const STORE_TAGLINE = 'Skin Care · Jewellery · Apparel';
export const STORE_DESCRIPTION =
  "Pakistan's premium online store for cosmetics, skin care, jewellery, apparel and baby essentials — cash on delivery nationwide.";

/** Store promises shown across the storefront. Keep these true to how orders are actually fulfilled. */
export const STORE_PROMISES = {
  delivery: 'Delivery in 3–5 working days',
  cod: 'Cash on delivery nationwide',
  exchange: '7-day easy exchange',
  secure: 'Secure bank transfer',
} as const;
