
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Organizador from "./pages/Organizador";
import Equipo from "./pages/Equipo";
import Fiscal from "./pages/Fiscal";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/LoginForm";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, user, currentProfile } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {user?.tipos.includes('organizador') && (
        <Route path="/organizador" element={<Organizador />} />
      )}
      {user?.tipos.includes('equipo') && (
        <Route path="/equipo" element={<Equipo />} />
      )}
      {user?.tipos.includes('fiscal') && (
        <Route path="/fiscal" element={<Fiscal />} />
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
