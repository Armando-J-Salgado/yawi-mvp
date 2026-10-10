import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout, AuthLayout } from '../components/layout';
import { LandingPage } from '../pages/LandingPage';
import { SellerLandingPage } from '../pages/SellerLandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { Skeleton } from '../components/ui';

const ArtisansPage = lazy(() => import('../pages/ArtisansPage/ArtisansPage'));
const BusinessDetailPage = lazy(() => import('../pages/BusinessDetailPage/BusinessDetailPage'));
const CatalogPage = lazy(() => import('../pages/CatalogPage/CatalogPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage/CartPage'));

function PageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
      <Skeleton height="350px" className="w-full rounded-card" />
      <Skeleton height="40px" className="w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton height="300px" className="w-full rounded-card" />
        <Skeleton height="300px" className="w-full rounded-card" />
        <Skeleton height="300px" className="w-full rounded-card" />
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Rutas con layout principal (Navbar + Footer) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vender" element={<SellerLandingPage />} />
          <Route path="/artisans" element={<ArtisansPage />} />
          <Route path="/artisans/:id" element={<BusinessDetailPage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* Rutas con layout de autenticación (solo logo, sin Navbar/Footer) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
