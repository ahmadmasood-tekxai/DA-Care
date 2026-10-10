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
  CUSTOMER = 'CUSTOMER',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
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
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  auth_provider: AuthProvider;
  /** False for Google-only accounts that never set a password. */
  has_password: boolean;
  profile_image?: string | null;
  last_login?: string | null;
  created_at: string;
}

/** A user row on the admin Users screen, with purchase stats. */
export interface AdminUser extends User {
  orders_count: number;
  total_spent: number;
  last_order_at?: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface UpdateMeInput {
  full_name?: string;
  phone?: string;
  current_password?: string;
  new_password?: string;
}

export interface StaffCreateInput {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role: UserRole;
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
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

export interface CategoryWithCount extends CategoryWithSubcategories {
  product_count: number;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
  parent_id?: number | null;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
  parent_id?: number | null;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  public_id: string;
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  subcategory_id?: number | null;
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
  images: ProductImage[];
}

export interface ProductDetail extends Product {
  category: Category;
  subcategory?: Category | null;
}

export interface ProductCreateInput {
  category_id: number;
  subcategory_id?: number | null;
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

export type ProductUpdateInput = Partial<ProductCreateInput>;

export interface ListProductsParams {
  category_slug?: string;
  subcategory_id?: number;
  search?: string;
  is_featured?: boolean;
  /** Only products whose old_price is above the current price. */
  on_sale?: boolean;
  badge?: ProductBadge;
  sort?: ProductSort;
  include_inactive?: boolean;
  page?: number;
  page_size?: number;
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'name' | 'discount';

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
  customer_email?: string;
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
  customer_email?: string | null;
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
  /** The customer account that placed the order (null for guest checkout). */
  created_by_id?: number | null;
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
  total_customers: number;
  payments_to_verify: number;
  top_products: TopProduct[];
}

export interface EmailStatus {
  enabled: boolean;
  host: string;
  port: number;
  from_email: string;
  from_name: string;
  admin_email: string;
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

export interface MessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  detail: string;
  errors?: ApiErrorField[];
}
