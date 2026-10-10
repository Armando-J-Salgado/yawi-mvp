import { AppRoutes } from './routes';
import { ToastContainer } from './components/ui';
import { CartDrawer } from './features/cart';
import { useSessionBootstrap } from './features/auth';

function App() {
  useSessionBootstrap();

  return (
    <>
      <AppRoutes />
      <CartDrawer />
      <ToastContainer />
    </>
  );
}

export default App;
