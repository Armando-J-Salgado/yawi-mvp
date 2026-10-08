import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { LandingPage } from '../pages/LandingPage';
import { SellerLandingPage } from '../pages/SellerLandingPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vender" element={<SellerLandingPage />} />
      </Route>
    </Routes>
  );
}
