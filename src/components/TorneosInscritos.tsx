
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Trophy, Download, AlertCircle, CheckCircle } from "lucide-react";
import ReportDownloader from './ReportDownloader';
import PlayerStatistics from './PlayerStatistics';
import TorneoEstadisticas from './TorneoEstadisticas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Torneo {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  descripcion: string;
  maxEquipos: number;
  equiposInscritos: number;
  fechaLimiteInscripcion: string;
  organizadorId: string;
  organizadorNombre: string;
  estado: "inscripcion" | "en_curso" | "finalizado";
  categoria: string;
  tipoTorneo: "eliminacion_directa" | "round_robin" | "mixto";
  equiposCalificados?: number;
  fixture?: any[];
}

const TorneosInscritos = () => {
  const { currentUser } = useAuth();

  const [torneosInscritos, setTorneosInscritos] = useState<Torneo[]>([]);
  const [activeTab, setActiveTab] = useState('inscritos');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPlayerStatsModal, setShowPlayerStatsModal] = useState(false);
  const [selectedTorneo, setSelectedTorneo] = useState<Torneo | null>(null);
  const [torneosEnCurso, setTorneosEnCurso] = useState<Torneo[]>([]);
  const [torneosFinalizados, setTorneosFinalizados] = useState<Torneo[]>([]);

  useEffect(() => {
    cargarTorneosInscritos();
    
    const handleUpdate = () => {
      console.log('🔄 Actualizando torneos inscritos...');
      cargarTorneosInscritos();
    };

    window.addEventListener('torneosInscritosUpdate', handleUpdate);
    window.addEventListener('equiposInscritosUpdate', handleUpdate);
    window.addEventListener('inscripcionesUpdate', handleUpdate);
    
    return () => {
      window.removeEventListener('torneosInscritosUpdate', handleUpdate);
      window.removeEventListener('equiposInscritosUpdate', handleUpdate);
      window.removeEventListener('inscripcionesUpdate', handleUpdate);
    };
  }, [currentUser]);

  const cargarTorneosInscritos = () => {
    if (!currentUser) {
      console.log('❌ No hay usuario autenticado');
      return;
    }

    console.log('🔍 Cargando torneos inscritos para usuario:', currentUser.id);
    
    try {
      const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      console.log('📋 Torneos públicos encontrados:', torneosPublicos.length);
      
      const inscripciones: Torneo[] = [];
      const enCurso: Torneo[] = [];
      const finalizados: Torneo[] = [];
      
      torneosPublicos.forEach((torneo: Torneo) => {
        const estaInscrito = verificarInscripcion(torneo.id);
        
        if (estaInscrito) {
          console.log(`✅ Usuario inscrito en torneo: ${torneo.nombre} (ID: ${torneo.id})`);
          
          if (torneo.estado === 'inscripcion') {
            inscripciones.push(torneo);
          } else if (torneo.estado === 'en_curso') {
            enCurso.push(torneo);
          } else if (torneo.estado === 'finalizado') {
            finalizados.push(torneo);
          }
        }
      });
      
      console.log('📊 Resumen de inscripciones:', {
        inscripciones: inscripciones.length,
        enCurso: enCurso.length,
        finalizados: finalizados.length
      });
      
      setTorneosInscritos(inscripciones);
      setTorneosEnCurso(enCurso);
      setTorneosFinalizados(finalizados);
      
    } catch (error) {
      console.error('❌ Error al cargar torneos inscritos:', error);
      toast.error('Error al cargar torneos inscritos');
    }
  };

  const verificarInscripcion = (torneoId: string): boolean => {
    if (!currentUser) return false;
    
    try {
      const equipoIdNumerico = parseInt(currentUser.id);
      
      const keys = [
        `inscripcion_${torneoId}_${equipoIdNumerico}`,
        `inscripcion_${torneoId}_${currentUser.id}`,
        `torneo_${torneoId}_equipo_${equipoIdNumerico}`
      ];
      
      for (const key of keys) {
        const inscripcion = localStorage.getItem(key);
        if (inscripcion) {
          const data = JSON.parse(inscripcion);
          if (data.estado === 'aprobado') {
            console.log(`✅ Inscripción encontrada con clave: ${key}`);
            return true;
          }
        }
      }
      
      const equiposInscritosKey = `equipos_inscritos_${torneoId}`;
      const equiposInscritos = JSON.parse(localStorage.getItem(equiposInscritosKey) || '[]');
      const estaEnLista = equiposInscritos.some((e: any) => 
        e.equipoId === equipoIdNumerico || 
        e.equipoId === currentUser.id || 
        e.userId === currentUser.id
      );
      
      if (estaEnLista) {
        console.log(`✅ Equipo encontrado en lista general de inscritos: ${torneoId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error verificando inscripción:', error);
      return false;
    }
  };

  const handleDescargarReporte = (torneo: Torneo) => {
    setSelectedTorneo(torneo);
    setShowReportModal(true);
  };

  const handleVerEstadisticas = (torneo: Torneo) => {
    setSelectedTorneo(torneo);
    setShowStatsModal(true);
  };

  const handlePlayerStats = (torneo: Torneo) => {
    setSelectedTorneo(torneo);
    setShowPlayerStatsModal(true);
  };

  const renderTorneoCard = (torneo: Torneo, showActions: boolean = false) => (
    <Card key={torneo.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {torneo.nombre}
          </CardTitle>
          <Badge variant={
            torneo.estado === 'inscripcion' ? 'secondary' :
            torneo.estado === 'en_curso' ? 'default' : 
            'outline'
          }>
            {torneo.estado === 'inscripcion' ? 'Inscripción' :
             torneo.estado === 'en_curso' ? 'En Curso' : 'Finalizado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{torneo.fechaInicio} - {torneo.fechaFin}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{torneo.lugar}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{torneo.equiposInscritos}/{torneo.maxEquipos} equipos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">Inscrito</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{torneo.descripcion}</p>
        
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDescargarReporte(torneo)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Reportes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerEstadisticas(torneo)}
              className="flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Estadísticas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePlayerStats(torneo)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Jugadores
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Acceso requerido</h3>
        <p className="text-muted-foreground">Inicia sesión para ver tus torneos inscritos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Mis Torneos</h2>
        <p className="text-muted-foreground">Gestiona tus inscripciones y resultados</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inscritos">
            Inscritos ({torneosInscritos.length})
          </TabsTrigger>
          <TabsTrigger value="en_curso">
            En Curso ({torneosEnCurso.length})
          </TabsTrigger>
          <TabsTrigger value="finalizados">
            Finalizados ({torneosFinalizados.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inscritos">
          {torneosInscritos.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay torneos en inscripción</h3>
              <p className="text-muted-foreground">
                Los torneos en los que te hayas inscrito aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {torneosInscritos.map(torneo => renderTorneoCard(torneo))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="en_curso">
          {torneosEnCurso.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay torneos en curso</h3>
              <p className="text-muted-foreground">
                Los torneos que estén actualmente en desarrollo aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {torneosEnCurso.map(torneo => renderTorneoCard(torneo, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finalizados">
          {torneosFinalizados.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay torneos finalizados</h3>
              <p className="text-muted-foreground">
                Los torneos completados aparecerán aquí con sus resultados finales
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {torneosFinalizados.map(torneo => renderTorneoCard(torneo, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedTorneo && (
        <>
          <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Reportes - {selectedTorneo.nombre}</DialogTitle>
              </DialogHeader>
              <ReportDownloader torneo={selectedTorneo} />
            </DialogContent>
          </Dialog>

          <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
            <DialogContent className="max-w-6xl">
              <DialogHeader>
                <DialogTitle>Estadísticas - {selectedTorneo.nombre}</DialogTitle>
              </DialogHeader>
              <TorneoEstadisticas torneoId={selectedTorneo.id} />
            </DialogContent>
          </Dialog>

          <Dialog open={showPlayerStatsModal} onOpenChange={setShowPlayerStatsModal}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Estadísticas de Jugadores - {selectedTorneo.nombre}</DialogTitle>
              </DialogHeader>
              <PlayerStatistics torneoId={selectedTorneo.id} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default TorneosInscritos;
