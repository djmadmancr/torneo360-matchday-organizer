import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Trophy, Search, Filter, CheckCircle, Clock } from "lucide-react";
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
}

const TorneosPublicos = () => {
  const { currentUser } = useAuth();

  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [filteredTorneos, setFilteredTorneos] = useState<Torneo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showInscripcionModal, setShowInscripcionModal] = useState(false);
  const [selectedTorneo, setSelectedTorneo] = useState<Torneo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    cargarTorneos();
  }, []);

  useEffect(() => {
    filtrarTorneos();
  }, [torneos, searchTerm, statusFilter, categoryFilter]);

  const cargarTorneos = () => {
    try {
      const torneosGuardados = localStorage.getItem('torneosPublicos');
      if (torneosGuardados) {
        const torneosData = JSON.parse(torneosGuardados);
        console.log('📋 Torneos cargados:', torneosData.length);
        setTorneos(torneosData);
      }
    } catch (error) {
      console.error('❌ Error al cargar torneos:', error);
      toast.error('Error al cargar torneos');
    }
  };

  const filtrarTorneos = () => {
    let filtered = [...torneos];

    if (searchTerm) {
      filtered = filtered.filter(torneo =>
        torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        torneo.lugar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        torneo.organizadorNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(torneo => torneo.estado === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(torneo => torneo.categoria === categoryFilter);
    }

    setFilteredTorneos(filtered);
  };

  const estaInscrito = (torneoId: string): boolean => {
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
            return true;
          }
        }
      }
      
      const equiposInscritosKey = `equipos_inscritos_${torneoId}`;
      const equiposInscritos = JSON.parse(localStorage.getItem(equiposInscritosKey) || '[]');
      return equiposInscritos.some((e: any) => 
        e.equipoId === equipoIdNumerico || 
        e.equipoId === currentUser.id || 
        e.userId === currentUser.id
      );
    } catch (error) {
      console.error('❌ Error verificando inscripción:', error);
      return false;
    }
  };

  const handleInscribirse = (torneo: Torneo) => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para inscribirte');
      return;
    }

    if (estaInscrito(torneo.id)) {
      toast.info('Ya estás inscrito en este torneo');
      return;
    }

    setSelectedTorneo(torneo);
    setShowInscripcionModal(true);
  };

  const confirmarInscripcion = async () => {
    if (!selectedTorneo || !currentUser || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const equipoIdNumerico = parseInt(currentUser.id);
      const timestamp = new Date().toISOString();
      
      const inscripcionData = {
        equipoId: equipoIdNumerico,
        torneoId: selectedTorneo.id,
        fechaInscripcion: timestamp,
        estado: 'pendiente',
        equipoNombre: `Equipo ${currentUser.full_name || currentUser.email}`,
        contacto: currentUser.email
      };

      const inscripcionKey = `inscripcion_${selectedTorneo.id}_${equipoIdNumerico}`;
      localStorage.setItem(inscripcionKey, JSON.stringify(inscripcionData));

      const solicitudesKey = `solicitudes_inscripcion_${selectedTorneo.organizadorId}`;
      const solicitudesExistentes = JSON.parse(localStorage.getItem(solicitudesKey) || '[]');
      
      const nuevaSolicitud = {
        id: `SOL-${Date.now()}`,
        equipoId: equipoIdNumerico,
        equipoNombre: inscripcionData.equipoNombre,
        torneoId: selectedTorneo.id,
        torneoNombre: selectedTorneo.nombre,
        fechaSolicitud: timestamp,
        estado: 'pendiente',
        contacto: currentUser.email,
        mensaje: `Solicitud de inscripción para el torneo "${selectedTorneo.nombre}"`
      };

      solicitudesExistentes.push(nuevaSolicitud);
      localStorage.setItem(solicitudesKey, JSON.stringify(solicitudesExistentes));

      console.log('✅ Inscripción registrada:', {
        key: inscripcionKey,
        data: inscripcionData,
        solicitud: nuevaSolicitud
      });

      toast.success('Solicitud de inscripción enviada. Esperando aprobación del organizador.');
      setShowInscripcionModal(false);
      setSelectedTorneo(null);

    } catch (error) {
      console.error('❌ Error al inscribirse:', error);
      toast.error('Error al procesar la inscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInscripcionStatus = (torneo: Torneo) => {
    if (!currentUser) return null;

    if (estaInscrito(torneo.id)) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Inscrito</span>
        </div>
      );
    }

    try {
      const equipoIdNumerico = parseInt(currentUser.id);
      const inscripcionKey = `inscripcion_${torneo.id}_${equipoIdNumerico}`;
      const inscripcion = localStorage.getItem(inscripcionKey);
      
      if (inscripcion) {
        const data = JSON.parse(inscripcion);
        if (data.estado === 'pendiente') {
          return (
            <div className="flex items-center gap-2 text-yellow-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Pendiente</span>
            </div>
          );
        }
      }
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
    }

    return null;
  };

  const renderTorneoCard = (torneo: Torneo) => {
    const inscripcionStatus = getInscripcionStatus(torneo);
    const puedeInscribirse = currentUser && 
                           torneo.estado === 'inscripcion' && 
                           !estaInscrito(torneo.id) && 
                           !inscripcionStatus;

    return (
      <Card key={torneo.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {torneo.nombre}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={
                torneo.estado === 'inscripcion' ? 'secondary' :
                torneo.estado === 'en_curso' ? 'default' : 
                'outline'
              }>
                {torneo.estado === 'inscripcion' ? 'Inscripción Abierta' :
                 torneo.estado === 'en_curso' ? 'En Curso' : 'Finalizado'}
              </Badge>
            </div>
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
              <span className="text-sm text-muted-foreground">Org: {torneo.organizadorNombre}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">{torneo.descripcion}</p>
          
          <div className="flex items-center justify-between pt-2">
            {inscripcionStatus || <div />}
            
            {puedeInscribirse && (
              <Button 
                onClick={() => handleInscribirse(torneo)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Inscribirse
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const categorias = [...new Set(torneos.map(t => t.categoria))];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Torneos Disponibles</h2>
        <p className="text-muted-foreground">Encuentra y únete a torneos de fútbol</p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar torneos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="inscripcion">Inscripción abierta</SelectItem>
            <SelectItem value="en_curso">En curso</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map(categoria => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{filteredTorneos.length} torneos</span>
        </div>
      </div>

      {/* Lista de torneos */}
      {filteredTorneos.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No se encontraron torneos</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay torneos disponibles en este momento'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTorneos.map(renderTorneoCard)}
        </div>
      )}

      {/* Modal de confirmación de inscripción */}
      <Dialog open={showInscripcionModal} onOpenChange={setShowInscripcionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Inscripción</DialogTitle>
          </DialogHeader>
          {selectedTorneo && (
            <div className="space-y-4">
              <p>¿Estás seguro de que quieres inscribirte en el torneo <strong>{selectedTorneo.nombre}</strong>?</p>
              
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Fecha:</strong> {selectedTorneo.fechaInicio} - {selectedTorneo.fechaFin}</p>
                <p><strong>Lugar:</strong> {selectedTorneo.lugar}</p>
                <p><strong>Límite de inscripción:</strong> {selectedTorneo.fechaLimiteInscripcion}</p>
                <p><strong>Equipos:</strong> {selectedTorneo.equiposInscritos}/{selectedTorneo.maxEquipos}</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={confirmarInscripcion}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Inscripción'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInscripcionModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TorneosPublicos;
