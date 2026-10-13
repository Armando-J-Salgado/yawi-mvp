import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-background text-primary-text">
      <Navbar />
      <main className="flex-1 w-full max-w-full min-w-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
