import { Routes, Route } from 'react-router-dom';
import { AppLayout, AuthLayout } from '../components/layout';
import { LandingPage } from '../pages/LandingPage';
import { SellerLandingPage } from '../pages/SellerLandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas con layout principal (Navbar + Footer) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vender" element={<SellerLandingPage />} />
      </Route>

      {/* Rutas con layout de autenticación (solo logo, sin Navbar/Footer) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
