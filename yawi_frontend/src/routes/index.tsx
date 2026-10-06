import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { LandingPage } from '../pages/LandingPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
    </Routes>
  );
}
