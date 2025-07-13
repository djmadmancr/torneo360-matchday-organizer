
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NoAccess from "./pages/NoAccess";
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
              <Route path="/auth" element={<Auth />} />
              <Route path="/no-access" element={<NoAccess />} />
              <Route path="/" element={
                <PrivateRoute>
                  <Index />
                </PrivateRoute>
              } />
              <Route path="/organizador" element={
                <PrivateRoute roles={['organizer']}>
                  <Organizador />
                </PrivateRoute>
              } />
              <Route path="/equipo" element={
                <PrivateRoute roles={['team_admin']}>
                  <Equipo />
                </PrivateRoute>
              } />
              <Route path="/fiscal" element={
                <PrivateRoute roles={['referee']}>
                  <Fiscal />
                </PrivateRoute>
              } />
              <Route path="/admin/users" element={
                <PrivateRoute roles={['admin']}>
                  <AdminUsers />
                </PrivateRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
