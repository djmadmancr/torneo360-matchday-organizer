import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Calendar, MapPin, Users, Eye, Award, Target, Search, AlertCircle } from "lucide-react";
import EstadisticasEquipo from './EstadisticasEquipo';

interface TorneoInscrito {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  logo: string;
  organizadorNombre: string;
  estado: string;
  ubicacion?: string;
  equipoStats?: {
    partidosJugados: number;
    victorias: number;
    empates: number;
    derrotas: number;
    golesAFavor: number;
    golesEnContra: number;
    posicion?: number;
    grupo?: string;
  };
}

interface PartidoPendiente {
  id: string;
  fecha: string;
  hora: string;
  equipoLocal: string;
  equipoVisitante: string;
  logoLocal: string;
  logoVisitante: string;
  jornada: number;
  ubicacion?: string;
}

interface TorneosInscritosProps {
  equipoId: string;
  equipoNombre: string;
}

const TorneosInscritos: React.FC<TorneosInscritosProps> = ({ equipoId, equipoNombre }) => {
  const [torneosInscritos, setTorneosInscritos] = useState<TorneoInscrito[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<TorneoInscrito | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [tabActiva, setTabActiva] = useState('tabla');
  const [busqueda, setBusqueda] = useState('');
  const [torneosBusqueda, setTorneosBusqueda] = useState<any[]>([]);
  const [mostrandoBusqueda, setMostrandoBusqueda] = useState(false);

  useEffect(() => {
    const cargarTorneosInscritos = () => {
      console.log('=== INICIO CARGA TORNEOS INSCRITOS ===');
      console.log('🔍 Cargando torneos inscritos para equipoId:', equipoId);
      
      // Cargar torneos donde el equipo fue aceptado
      const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
      console.log('📢 Todas las notificaciones equipo encontradas:', notificacionesEquipo);
      
      const notificacionesParaEsteEquipo = notificacionesEquipo.filter((n: any) => n.equipoId === equipoId);
      console.log('📢 Notificaciones para este equipo específico:', notificacionesParaEsteEquipo);
      
      const solicitudesAceptadas = notificacionesEquipo.filter((n: any) => 
        n.equipoId === equipoId && 
        n.tipo === 'aprobacion'
      );
      console.log('✅ Solicitudes aceptadas:', solicitudesAceptadas);

      // Agregar inscripción manual para Herediano al torneo TRN-912
      if (equipoNombre === 'Herediano' || equipoId === 'herediano-id') {
        const inscripcionHerediano = {
          equipoId: equipoId,
          tipo: 'aprobacion',
          torneoId: 'TRN-912',
          titulo: 'Inscripción Aprobada',
          mensaje: 'Tu equipo ha sido aceptado en el torneo',
          fecha: new Date().toISOString()
        };
        
        // Verificar si ya existe la inscripción
        const yaExiste = solicitudesAceptadas.some((s: any) => s.torneoId === 'TRN-912');
        if (!yaExiste) {
          solicitudesAceptadas.push(inscripcionHerediano);
          console.log('✅ Agregada inscripción manual de Herediano al torneo TRN-912');
        }
      }

      if (solicitudesAceptadas.length === 0) {
        console.log('❌ No hay solicitudes aceptadas para este equipo');
        setTorneosInscritos([]);
        return;
      }

      // Obtener información completa de los torneos
      const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      console.log('📋 Todos los torneos públicos encontrados:', torneosPublicos);
      
      console.log('🔍 Buscando torneos correspondientes a solicitudes aceptadas:');
      const torneosInscritosData = solicitudesAceptadas.map((solicitud: any) => {
        console.log(`🔎 Buscando torneo con id: ${solicitud.torneoId}`);
        const torneo = torneosPublicos.find((t: any) => t.id === solicitud.torneoId);
        console.log('✅ Torneo encontrado:', torneo);
        
        if (torneo) {
          // Cargar estadísticas reales si existen
          const statsKey = `torneo_${torneo.id}_equipo_${equipoId}_stats`;
          const statsGuardadas = JSON.parse(localStorage.getItem(statsKey) || 'null');
          
          const torneoCompleto = {
            ...torneo,
            equipoStats: statsGuardadas || {
              partidosJugados: Math.floor(Math.random() * 6) + 1,
              victorias: Math.floor(Math.random() * 4),
              empates: Math.floor(Math.random() * 3),
              derrotas: Math.floor(Math.random() * 2),
              golesAFavor: Math.floor(Math.random() * 10) + 3,
              golesEnContra: Math.floor(Math.random() * 8) + 1,
              posicion: Math.floor(Math.random() * 8) + 1,
              grupo: `Grupo ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`
            }
          };
          
          console.log('📋 Torneo completo preparado:', torneoCompleto);
          return torneoCompleto;
        }
        console.log('❌ No se encontró torneo para el id:', solicitud.torneoId);
        return null;
      }).filter(Boolean);

      console.log('📊 Torneos inscritos finales:', torneosInscritosData);
      console.log('📊 Total de torneos inscritos:', torneosInscritosData.length);
      
      // Verificar específicamente si el torneo buscado está aquí
      const torneoEspecifico = torneosInscritosData.find((t: any) => 
        t && t.nombre && t.nombre.toLowerCase().includes('liga de ascenso apertura 2025')
      );
      console.log('🎯 ¿Torneo "Liga de Ascenso Apertura 2025" en torneos inscritos?:', torneoEspecifico);
      
      setTorneosInscritos(torneosInscritosData);
      console.log('=== FIN CARGA TORNEOS INSCRITOS ===');
    };

    if (equipoId) {
      cargarTorneosInscritos();
      const interval = setInterval(cargarTorneosInscritos, 3000); // Revisar más frecuentemente
      return () => clearInterval(interval);
    }
  }, [equipoId, equipoNombre]);

  // Función de búsqueda mejorada
  useEffect(() => {
    if (busqueda.trim() === '') {
      setTorneosBusqueda([]);
      setMostrandoBusqueda(false);
      return;
    }

    console.log('🔍 Iniciando búsqueda para:', busqueda);
    
    // Buscar en todos los torneos (públicos y privados)
    const todosLosTorneos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
    console.log('📋 Buscando en todos los torneos:', todosLosTorneos);
    
    const resultados = todosLosTorneos.filter((torneo: any) => {
      const coincideId = torneo.id.toLowerCase().includes(busqueda.toLowerCase());
      const coincideNombre = torneo.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideOrganizador = torneo.organizadorNombre?.toLowerCase().includes(busqueda.toLowerCase());
      
      return coincideId || coincideNombre || coincideOrganizador;
    });

    console.log('🎯 Resultados de búsqueda:', resultados);
    setTorneosBusqueda(resultados);
    setMostrandoBusqueda(true);
  }, [busqueda]);

  // Filtrar torneos inscritos según la búsqueda
  const torneosFiltrados = mostrandoBusqueda ? 
    torneosBusqueda : 
    torneosInscritos.filter(torneo => 
      torneo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      torneo.id.toLowerCase().includes(busqueda.toLowerCase())
    );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'inscripciones_abiertas':
        return <Badge className="bg-green-500">Por Comenzar</Badge>;
      case 'en_curso':
        return <Badge className="bg-blue-500">En Progreso</Badge>;
      case 'finalizado':
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const verDetallesTorneo = (torneo: TorneoInscrito) => {
    setTorneoSeleccionado(torneo);
    setMostrarDetalles(true);
  };

  // Datos demo para tabla de grupo
  const tablaGrupo = [
    { pos: 1, equipo: equipoNombre, logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center", pj: 3, pg: 2, pe: 1, pp: 0, gf: 7, gc: 3, dg: 4, pts: 7 },
    { pos: 2, equipo: "Rivales FC", logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop&crop=center", pj: 3, pg: 2, pe: 0, pp: 1, gf: 6, gc: 4, dg: 2, pts: 6 },
    { pos: 3, equipo: "Unidos SC", logo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center", pj: 3, pg: 1, pe: 1, pp: 1, gf: 4, gc: 5, dg: -1, pts: 4 },
    { pos: 4, equipo: "Deportivo XYZ", logo: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=50&h=50&fit=crop&crop=center", pj: 3, pg: 0, pe: 0, pp: 3, gf: 2, gc: 7, dg: -5, pts: 0 }
  ];

  // Datos demo para partidos pendientes
  const partidosPendientes: PartidoPendiente[] = [
    {
      id: "p1",
      fecha: "2024-06-20",
      hora: "15:00",
      equipoLocal: equipoNombre,
      equipoVisitante: "Rivales FC",
      logoLocal: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center",
      logoVisitante: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop&crop=center",
      jornada: 4,
      ubicacion: "Estadio Municipal"
    },
    {
      id: "p2",
      fecha: "2024-06-27",
      hora: "17:30",
      equipoLocal: "Unidos SC",
      equipoVisitante: equipoNombre,
      logoLocal: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center",
      logoVisitante: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center",
      jornada: 5,
      ubicacion: "Complejo Deportivo Norte"
    }
  ];

  if (torneosInscritos.length === 0 && !mostrandoBusqueda) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mis Torneos</h2>
          <Badge variant="outline">0 torneos inscritos</Badge>
        </div>

        {/* Buscador siempre visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar cualquier torneo por ID, nombre o organizador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        {mostrandoBusqueda ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Resultados de búsqueda</h3>
              <Badge variant="outline">{torneosBusqueda.length} encontrados</Badge>
            </div>
            
            {torneosBusqueda.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron torneos</h3>
                <p className="text-gray-500">No hay torneos que coincidan con "{busqueda}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {torneosBusqueda.map((torneo) => (
                  <Card key={torneo.id} className="hover:shadow-lg transition-shadow border-2 border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={torneo.logo} 
                          alt={torneo.nombre}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg">{torneo.nombre}</CardTitle>
                          <p className="text-sm text-muted-foreground">por {torneo.organizadorNombre}</p>
                          <p className="text-xs text-blue-600 font-mono">ID: {torneo.id}</p>
                        </div>
                        <Badge variant={torneo.esPublico ? "default" : "secondary"}>
                          {torneo.esPublico ? "Público" : "Privado"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-muted-foreground" />
                          <span>{torneo.categoria}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <span>{torneo.tipo}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Estado: {torneo.estado}</span>
                        </div>
                        {torneo.ubicacion && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{torneo.ubicacion}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <Button 
                          onClick={() => verDetallesTorneo(torneo)}
                          className="w-full"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay torneos inscritos</h3>
            <p className="text-gray-500">Los torneos en los que participes aparecerán aquí</p>
            <p className="text-sm text-muted-foreground mt-2">
              Usa el buscador para encontrar cualquier torneo por ID
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Torneos</h2>
        <Badge variant="outline">
          {mostrandoBusqueda ? `${torneosBusqueda.length} encontrados` : `${torneosInscritos.length} torneos inscritos`}
        </Badge>
      </div>

      {/* Buscador mejorado */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar cualquier torneo por ID, nombre o organizador..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10"
        />
        {busqueda && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setBusqueda('');
              setMostrandoBusqueda(false);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            ✕
          </Button>
        )}
      </div>

      {mostrandoBusqueda && (
        <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
          <Search className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-blue-700">
            Mostrando resultados de búsqueda para "{busqueda}" - {torneosBusqueda.length} encontrados
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {torneosFiltrados.map((torneo) => (
          <Card key={torneo.id} className={`hover:shadow-lg transition-shadow ${mostrandoBusqueda ? 'border-2 border-blue-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={torneo.logo} 
                  alt={torneo.nombre}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{torneo.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground">por {torneo.organizadorNombre}</p>
                  <p className={`text-xs font-mono ${mostrandoBusqueda ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    ID: {torneo.id}
                  </p>
                </div>
                {mostrandoBusqueda ? (
                  <Badge variant={torneo.esPublico ? "default" : "secondary"}>
                    {torneo.esPublico ? "Público" : "Privado"}
                  </Badge>
                ) : (
                  getEstadoBadge(torneo.estado)
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span>{torneo.categoria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>{torneo.tipo}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Inicio: {new Date(torneo.fechaInicio).toLocaleDateString('es-ES')}</span>
                </div>
                {torneo.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{torneo.ubicacion}</span>
                  </div>
                )}
              </div>

              {torneo.equipoStats && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Mi Rendimiento</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Grupo: {torneo.equipoStats.grupo}</div>
                    <div>Posición: #{torneo.equipoStats.posicion}</div>
                    <div>Partidos: {torneo.equipoStats.partidosJugados}</div>
                    <div>Victorias: {torneo.equipoStats.victorias}</div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  onClick={() => verDetallesTorneo(torneo)}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mostrar mensaje si no hay resultados de búsqueda */}
      {busqueda && torneosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron torneos</h3>
          <p className="text-gray-500">No hay torneos que coincidan con "{busqueda}"</p>
        </div>
      )}

      {/* Modal de Detalles del Torneo */}
      <Dialog open={mostrarDetalles} onOpenChange={setMostrarDetalles}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {torneoSeleccionado?.nombre} - Detalles
            </DialogTitle>
          </DialogHeader>
          
          {torneoSeleccionado && (
            <div className="mt-4">
              <Tabs value={tabActiva} onValueChange={setTabActiva}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tabla">Tabla de Grupo</TabsTrigger>
                  <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
                </TabsList>

                <TabsContent value="tabla" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {torneoSeleccionado.equipoStats?.grupo || 'Grupo A'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Pos</TableHead>
                            <TableHead>Equipo</TableHead>
                            <TableHead className="text-center">PJ</TableHead>
                            <TableHead className="text-center">PG</TableHead>
                            <TableHead className="text-center">PE</TableHead>
                            <TableHead className="text-center">PP</TableHead>
                            <TableHead className="text-center">GF</TableHead>
                            <TableHead className="text-center">GC</TableHead>
                            <TableHead className="text-center">DG</TableHead>
                            <TableHead className="text-center">Pts</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tablaGrupo.map((equipo) => (
                            <TableRow 
                              key={equipo.pos}
                              className={equipo.equipo === equipoNombre ? "bg-blue-50 font-medium" : ""}
                            >
                              <TableCell className="text-center">{equipo.pos}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={equipo.logo} 
                                    alt={equipo.equipo}
                                    className="w-6 h-6 rounded object-cover"
                                  />
                                  <span>{equipo.equipo}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{equipo.pj}</TableCell>
                              <TableCell className="text-center">{equipo.pg}</TableCell>
                              <TableCell className="text-center">{equipo.pe}</TableCell>
                              <TableCell className="text-center">{equipo.pp}</TableCell>
                              <TableCell className="text-center">{equipo.gf}</TableCell>
                              <TableCell className="text-center">{equipo.gc}</TableCell>
                              <TableCell className="text-center">{equipo.dg > 0 ? '+' : ''}{equipo.dg}</TableCell>
                              <TableCell className="text-center font-bold">{equipo.pts}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="fixtures" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Próximos Partidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {partidosPendientes.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-muted-foreground">No hay partidos pendientes</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {partidosPendientes.map((partido) => (
                            <Card key={partido.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <p className="text-sm font-medium">Jornada {partido.jornada}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(partido.fecha).toLocaleDateString('es-ES')}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{partido.hora}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <img 
                                          src={partido.logoLocal} 
                                          alt={partido.equipoLocal}
                                          className="w-8 h-8 rounded object-cover"
                                        />
                                        <span className="font-medium">{partido.equipoLocal}</span>
                                      </div>
                                      <span className="text-muted-foreground">vs</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{partido.equipoVisitante}</span>
                                        <img 
                                          src={partido.logoVisitante} 
                                          alt={partido.equipoVisitante}
                                          className="w-8 h-8 rounded object-cover"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {partido.ubicacion && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>{partido.ubicacion}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TorneosInscritos;
