
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Shield, UserCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">⚽ Torneo360</h1>
            <p className="text-muted-foreground">Gestión completa de torneos de fútbol</p>
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
            Elige el tipo de usuario que mejor describe tu rol en el torneo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Organizador */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-blue-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Organizador</h3>
              <p className="text-muted-foreground mb-6">
                Crea y gestiona torneos, configura reglas y supervisa competiciones
              </p>
              <Button 
                onClick={() => navigate('/organizador')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                size="lg"
              >
                🔵 Ingresar como Organizador
              </Button>
            </CardContent>
          </Card>

          {/* Equipo */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-green-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Equipo</h3>
              <p className="text-muted-foreground mb-6">
                Registra tu equipo, gestiona jugadores y participa en torneos
              </p>
              <Button 
                onClick={() => navigate('/equipo')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                size="lg"
              >
                🟢 Ingresar como Equipo
              </Button>
            </CardContent>
          </Card>

          {/* Fiscal */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-orange-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Fiscal</h3>
              <p className="text-muted-foreground mb-6">
                Supervisa partidos, registra resultados y mantén la integridad del juego
              </p>
              <Button 
                onClick={() => navigate('/fiscal')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg"
                size="lg"
              >
                🟠 Ingresar como Fiscal
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
