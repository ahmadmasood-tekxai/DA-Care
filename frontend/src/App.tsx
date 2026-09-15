import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/layout/admin/ProtectedRoute';
import { ROUTES } from '@/constants';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { AdminCategoriesPage } from '@/pages/Admin/AdminCategoriesPage';
import { AdminDashboardPage } from '@/pages/Admin/AdminDashboardPage';
import { AdminLoginPage } from '@/pages/Admin/AdminLoginPage';
import { AdminOrdersPage } from '@/pages/Admin/AdminOrdersPage';
import { AdminProductsPage } from '@/pages/Admin/AdminProductsPage';

import { AboutPage } from '@/pages/Public/AboutPage';
import { CartPage } from '@/pages/Public/CartPage';
import { HomePage } from '@/pages/Public/HomePage';
import { ProductDetailPage } from '@/pages/Public/ProductDetailPage';
import { ProductsPage } from '@/pages/Public/ProductsPage';
import { ChatAssistant } from '@/components/common/ChatAssistant';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
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
            <ChatAssistant />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
