
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Shield, UserCheck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, currentProfile, setCurrentProfile, logout } = useAuth();

  const handleUserTypeNavigation = (tipo: 'organizador' | 'equipo' | 'fiscal') => {
    if (user?.tipos.includes(tipo)) {
      setCurrentProfile(tipo);
      navigate(`/${tipo}`);
    } else {
      alert(`No tienes permisos para acceder como ${tipo}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-primary mb-2">⚽ Torneo360</h1>
              <p className="text-muted-foreground">Gestión completa de torneos de fútbol</p>
              {user && (
                <div className="text-sm text-primary mt-2">
                  <p>Bienvenido, {user.nombre}</p>
                  <p>Perfiles disponibles: {user.tipos.join(', ')}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Selecciona tu perfil
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accede a tu panel según tu tipo de usuario
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Organizador */}
          <Card className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-blue-300 ${user?.tipos.includes('organizador') ? 'ring-2 ring-blue-500' : 'opacity-75'}`}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Organizador</h3>
              <p className="text-muted-foreground mb-6">
                Crea y gestiona torneos, configura reglas y supervisa competiciones
              </p>
              <Button 
                onClick={() => handleUserTypeNavigation('organizador')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                size="lg"
                disabled={!user?.tipos.includes('organizador')}
              >
                🔵 {user?.tipos.includes('organizador') ? 'Acceder' : 'Sin Acceso'}
              </Button>
            </CardContent>
          </Card>

          {/* Equipo */}
          <Card className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-green-300 ${user?.tipos.includes('equipo') ? 'ring-2 ring-green-500' : 'opacity-75'}`}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Equipo</h3>
              <p className="text-muted-foreground mb-6">
                Registra tu equipo, gestiona jugadores y participa en torneos
              </p>
              <Button 
                onClick={() => handleUserTypeNavigation('equipo')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                size="lg"
                disabled={!user?.tipos.includes('equipo')}
              >
                🟢 {user?.tipos.includes('equipo') ? 'Acceder' : 'Sin Acceso'}
              </Button>
            </CardContent>
          </Card>

          {/* Fiscal */}
          <Card className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-orange-300 ${user?.tipos.includes('fiscal') ? 'ring-2 ring-orange-500' : 'opacity-75'}`}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Fiscal</h3>
              <p className="text-muted-foreground mb-6">
                Supervisa partidos, registra resultados y mantén la integridad del juego
              </p>
              <Button 
                onClick={() => handleUserTypeNavigation('fiscal')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg"
                size="lg"
                disabled={!user?.tipos.includes('fiscal')}
              >
                🟠 {user?.tipos.includes('fiscal') ? 'Acceder' : 'Sin Acceso'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="text-3xl mb-3">⚽</div>
              <h4 className="font-semibold text-gray-800">Múltiples Modalidades</h4>
              <p className="text-sm text-muted-foreground">Fútbol 5, 7, 9, 11, sala y playa</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-3">🏆</div>
              <h4 className="font-semibold text-gray-800">Gestión Completa</h4>
              <p className="text-sm text-muted-foreground">Desde equipos hasta resultados finales</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-800">Seguimiento en Tiempo Real</h4>
              <p className="text-sm text-muted-foreground">Estadísticas y resultados actualizados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
