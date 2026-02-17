import AuthPage from "./pages/AuthPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { Toaster } from "sonner";
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'

const App = () => {

  

  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [],
    },
    {
      path: "/get-started",
      element: <AuthPage />
      ,
    },
  ]);

  const queryClient = new QueryClient();
  return (
    <>
      <Toaster position="top-right" richColors />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  )
};

export default App;
