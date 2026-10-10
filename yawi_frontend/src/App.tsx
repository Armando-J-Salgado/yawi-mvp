import { AppRoutes } from './routes';
import { ToastContainer } from './components/ui';
import { useSessionBootstrap } from './features/auth';

function App() {
  useSessionBootstrap();

  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
