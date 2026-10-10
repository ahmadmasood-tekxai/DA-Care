import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ChatAssistant } from '@/components/common/ChatAssistant';
import { ScrollManager } from '@/components/common/ScrollManager';
import { ProtectedRoute, RequireAccount } from '@/components/layout/admin/ProtectedRoute';
import { ROUTES } from '@/constants';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';

// Lazy-loaded Admin Pages
const AdminCategoriesPage = lazy(() => import('@/pages/Admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminDashboardPage = lazy(() => import('@/pages/Admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminLoginPage = lazy(() => import('@/pages/Admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminOrdersPage = lazy(() => import('@/pages/Admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminProductsPage = lazy(() => import('@/pages/Admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminUsersPage = lazy(() => import('@/pages/Admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));

// Lazy-loaded Public Pages
const AboutPage = lazy(() => import('@/pages/Public/AboutPage').then(m => ({ default: m.AboutPage })));
const AccountPage = lazy(() => import('@/pages/Public/AccountPage').then(m => ({ default: m.AccountPage })));
const LoginPage = lazy(() => import('@/pages/Public/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/Public/SignupPage').then(m => ({ default: m.SignupPage })));
const WishlistPage = lazy(() => import('@/pages/Public/WishlistPage').then(m => ({ default: m.WishlistPage })));
const CartPage = lazy(() => import('@/pages/Public/CartPage').then(m => ({ default: m.CartPage })));
const CategoryPage = lazy(() => import('@/pages/Public/CategoryPage').then(m => ({ default: m.CategoryPage })));
const HomePage = lazy(() => import('@/pages/Public/HomePage').then(m => ({ default: m.HomePage })));
const NotFoundPage = lazy(() => import('@/pages/Public/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ProductDetailPage = lazy(() => import('@/pages/Public/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ProductsPage = lazy(() => import('@/pages/Public/ProductsPage').then(m => ({ default: m.ProductsPage })));
const LoginPage = lazy(() => import('@/pages/Public/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/Public/SignupPage').then(m => ({ default: m.SignupPage })));
const FavoritesPage = lazy(() => import('@/pages/Public/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const ProfilePage = lazy(() => import('@/pages/Public/ProfilePage').then(m => ({ default: m.ProfilePage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

/** Shown while a lazy page chunk downloads — a quiet brand shell, no layout jump. */
function PageFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-cream" aria-busy="true" aria-label="Loading">
      <div className="h-9 bg-navy" />
      <div className="h-16 border-b border-navy/10 bg-white lg:h-[72px]" />
      <div className="relative h-0.5 overflow-hidden bg-cream-2">
        <div className="absolute inset-y-0 w-1/3 animate-shimmer bg-gold" />
      </div>
    </div>
  );
}

const protect = (page: JSX.Element) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <ScrollManager />
                  <Suspense fallback={<PageFallback />}>
                    <Routes>
                      {/* Public storefront */}
                      <Route path={ROUTES.HOME} element={<HomePage />} />
                      <Route path={ROUTES.ABOUT} element={<AboutPage />} />
                      <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
                      <Route path={ROUTES.PRODUCT_DETAIL()} element={<ProductDetailPage />} />
                      <Route path={ROUTES.CATEGORY_PAGE()} element={<CategoryPage />} />
                      <Route path={ROUTES.CART} element={<CartPage />} />
                      <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />

                      {/* Customer accounts */}
                      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
                      <Route path={ROUTES.ACCOUNT} element={<RequireAccount><AccountPage /></RequireAccount>} />

                      {/* Admin */}
                      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
                      <Route path={ROUTES.ADMIN_DASHBOARD} element={protect(<AdminDashboardPage />)} />
                      <Route path={ROUTES.ADMIN_CATEGORIES} element={protect(<AdminCategoriesPage />)} />
                      <Route path={ROUTES.ADMIN_PRODUCTS} element={protect(<AdminProductsPage />)} />
                      <Route path={ROUTES.ADMIN_ORDERS} element={protect(<AdminOrdersPage />)} />
                      <Route path={ROUTES.ADMIN_USERS} element={protect(<AdminUsersPage />)} />

                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                  <ChatAssistant />
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
