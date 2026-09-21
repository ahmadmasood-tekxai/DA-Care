import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/layout/admin/ProtectedRoute';
import { ROUTES } from '@/constants';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

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

/** Shown while a lazy page chunk is downloading — looks like a real page shell */
function PageShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Header skeleton */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-navy/10 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-2.5 w-28 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3.5 w-14 animate-pulse rounded-full bg-slate-200" />
            ))}
          </div>
          <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
      {/* Page body */}
      <main className="flex-1 pt-[72px]">
        <div className="h-64 w-full animate-pulse bg-slate-100" />
        <div className="mx-auto max-w-6xl px-6 py-14 space-y-6">
          <div className="h-6 w-1/4 animate-pulse rounded-full bg-slate-200" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-navy/10 bg-white">
                <div className="aspect-square w-full bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-4 w-full rounded-full bg-slate-200" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-6 w-1/3 rounded-full bg-slate-200" />
                    <div className="h-9 w-20 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}


export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Suspense fallback={<PageShellSkeleton />}>
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
