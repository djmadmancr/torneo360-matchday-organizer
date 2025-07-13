
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Organizador from "./pages/Organizador";
import Equipo from "./pages/Equipo";
import Fiscal from "./pages/Fiscal";
import AdminUsers from "./pages/Admin/Users";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { checkAndRunMigration } from "@/utils/dataMigration";

function App() {
  useEffect(() => {
    // Run migration check on app start
    checkAndRunMigration();
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/organizador" element={<Organizador />} />
              <Route path="/equipo" element={<Equipo />} />
              <Route path="/fiscal" element={<Fiscal />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
