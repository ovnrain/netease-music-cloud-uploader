import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Buffer } from 'buffer';
import Root from './Root';
import App from './App';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';

window.Buffer = Buffer;

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/*',
        element: <App />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'upload',
            element: <UploadPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

const queryClient = new QueryClient();

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
