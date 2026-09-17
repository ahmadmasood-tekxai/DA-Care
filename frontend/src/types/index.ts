/**
 * Global, app-wide types — mirror backend/app/schemas/*.py 1:1 so the API
 * contract stays in sync on both sides of the stack.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PAID = 'PAID',
}

export enum ProductBadge {
  NONE = 'NONE',
  BESTSELLER = 'BESTSELLER',
  NEW = 'NEW',
  FAVOURITE = 'FAVOURITE',
  STUDIO_PICK = 'STUDIO_PICK',
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon: string; // lucide icon name
  image_url?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithCount extends Category {
  product_count: number;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  short_description: string;
  description?: string | null;
  price: number;
  old_price?: number | null;
  stock: number;
  image_url?: string | null;
  image_color: string;
  badge: ProductBadge;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail extends Product {
  category: Category;
}

export interface ProductCreateInput {
  category_id: number;
  name: string;
  short_description?: string;
  description?: string;
  price: number;
  old_price?: number | null;
  stock?: number;
  image_color?: string;
  badge?: ProductBadge;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {}

export interface ListProductsParams {
  category_slug?: string;
  search?: string;
  is_featured?: boolean;
  include_inactive?: boolean;
  page?: number;
  page_size?: number;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface OrderCreateInput {
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  note?: string;
  items: OrderItemInput[];
  payment_method: PaymentMethod;
}

export interface OrderItem {
  id: number;
  product_id?: number | null;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  status: OrderStatus;
  note?: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_ref?: string | null;
  receipt_image_url?: string | null;
  rejection_reason?: string | null;
  transferred_at?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  total_amount: number;
}

export interface BankDetailsOut {
  account_title: string;
  bank_name: string;
  account_number: string;
  iban: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export interface TopProduct {
  product_name: string;
  units_sold: number;
  revenue: number;
}

export interface DashboardSummary {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  total_products: number;
  total_categories: number;
  low_stock_products: number;
  top_products: TopProduct[];
}

// ---------------------------------------------------------------------------
// Cart (frontend-only concept, not persisted server-side until checkout)
// ---------------------------------------------------------------------------
export interface CartItem {
  product: Product;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Generic API shapes
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiErrorField {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  detail: string;
  errors?: ApiErrorField[];
}
