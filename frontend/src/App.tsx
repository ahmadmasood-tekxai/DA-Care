import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/layout/admin/ProtectedRoute';
import { ROUTES } from '@/constants';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Loader } from '@/components/common/Loader';
import { ChatAssistant } from '@/components/common/ChatAssistant';

// Lazy-loaded Admin Pages
const AdminCategoriesPage = lazy(() => import('@/pages/Admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminDashboardPage = lazy(() => import('@/pages/Admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminLoginPage = lazy(() => import('@/pages/Admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminOrdersPage = lazy(() => import('@/pages/Admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminProductsPage = lazy(() => import('@/pages/Admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));

// Lazy-loaded Public Pages
const AboutPage = lazy(() => import('@/pages/Public/AboutPage').then(m => ({ default: m.AboutPage })));
const CartPage = lazy(() => import('@/pages/Public/CartPage').then(m => ({ default: m.CartPage })));
const HomePage = lazy(() => import('@/pages/Public/HomePage').then(m => ({ default: m.HomePage })));
const ProductDetailPage = lazy(() => import('@/pages/Public/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ProductsPage = lazy(() => import('@/pages/Public/ProductsPage').then(m => ({ default: m.ProductsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader /></div>}>
                <Routes>
                  {/* Public storefront */}
                  <Route path={ROUTES.HOME} element={<HomePage />} />
                  <Route path={ROUTES.ABOUT} element={<AboutPage />} />
                  <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
                  <Route path={ROUTES.PRODUCT_DETAIL()} element={<ProductDetailPage />} />
                  <Route path={ROUTES.CART} element={<CartPage />} />

                  {/* Admin */}
                  <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
                  <Route
                    path={ROUTES.ADMIN_DASHBOARD}
                    element={
                      <ProtectedRoute>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.ADMIN_CATEGORIES}
                    element={
                      <ProtectedRoute>
                        <AdminCategoriesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.ADMIN_PRODUCTS}
                    element={
                      <ProtectedRoute>
                        <AdminProductsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.ADMIN_ORDERS}
                    element={
                      <ProtectedRoute>
                        <AdminOrdersPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
                </Routes>
              </Suspense>
              <ChatAssistant />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
