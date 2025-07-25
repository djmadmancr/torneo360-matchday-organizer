
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Shield, UserCheck, LogOut, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCard } from "@/components/DashboardCard";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/auth');
    }
  }, [currentUser, isLoading, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!currentUser) {
    return null;
  }

  // Define available modules per role
  const moduleAccess = {
    admin: ['organizador', 'equipo', 'fiscal'],
    organizer: ['organizador'],
    referee: ['fiscal'],
    team_admin: ['equipo']
  };

  const availableModules = moduleAccess[currentUser.role] || [];

  const handleModuleNavigation = (module: string) => {
    navigate(`/${module}`);
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Module configurations
  const modules = {
    organizador: {
      title: "Organizador",
      description: "Crea y gestiona torneos, configura reglas y supervisa competiciones",
      icon: Shield
    },
    equipo: {
      title: "Equipo",
      description: "Registra tu equipo, gestiona jugadores y participa en torneos",
      icon: Users
    },
    fiscal: {
      title: "Fiscal",
      description: "Supervisa partidos, registra resultados y mantén la integridad del juego",
      icon: UserCheck
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-primary mb-2">⚽ Global Link Soccer</h1>
              <p className="text-muted-foreground">Gestión completa de torneos de fútbol</p>
              <div className="text-sm text-primary mt-2">
                <p>Bienvenido, {currentUser.full_name || currentUser.email}</p>
                <p>Rol: <span className="font-medium">{currentUser.role}</span></p>
              </div>
            </div>
            <div className="flex gap-2">
              {currentUser.role === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/users')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
          {availableModules.map((moduleKey) => {
            const module = modules[moduleKey as keyof typeof modules];
            
            return (
              <DashboardCard
                key={moduleKey}
                title={module.title}
                description={module.description}
                icon={module.icon}
                onClick={() => handleModuleNavigation(moduleKey)}
              />
            );
          })}
        </section>

        {availableModules.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">No tienes módulos disponibles para tu rol actual.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
