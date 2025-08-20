import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Calendar, Clock, MapPin, Upload, User, CreditCard, Edit, Save, Settings, Globe, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Fixture {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: string;
  kickoff: string | null;
  venue: string | null;
  match_day: number;
  home_teams: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  away_teams: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  tournaments: {
    id: string;
    name: string;
  } | null;
}

const Arbitro = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [fixtureSeleccionado, setFixtureSeleccionado] = useState<Fixture | null>(null);
  const [mostrarFormularioResultado, setMostrarFormularioResultado] = useState(false);
  const [informeArbitral, setInformeArbitral] = useState<File | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    referee_credential: '',
    city: '',
    country: '',
    phone: '',
    experience: '',
    certifications: '',
    availability: [] as string[],
    bio: ''
  });
  
  const [resultado, setResultado] = useState({
    golesLocal: "",
    golesVisitante: "",
    observaciones: "",
    tarjetasAmarillas: "",
    tarjetasRojas: "",
    jugadorDestacado: ""
  });

  // Fetch referee profile
  const { data: refereeProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['referee-profile', currentUser?.id],
    queryFn: async () => {
      console.log('🔍 Fetching referee profile for user:', currentUser?.id);
      
      if (!currentUser?.id) {
        console.log('❌ No current user ID found');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, referee_credential, profile_data, city, country')
        .eq('auth_user_id', currentUser.id)
        .eq('role', 'referee')
        .single();

      if (error) {
        console.error('❌ Error fetching referee profile:', error);
        throw error;
      }

      console.log('✅ Referee profile loaded:', data);
      
      // Update local profile data when fetched
      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || '',
          referee_credential: data.referee_credential || '',
          city: data.city || '',
          country: data.country || '',
          phone: data.profile_data?.phone || '',
          experience: data.profile_data?.experience || '',
          certifications: data.profile_data?.certifications || '',
          availability: data.profile_data?.availability || [],
          bio: data.profile_data?.bio || ''
        });
      }
      
      return data;
    },
    enabled: !!currentUser?.id
  });

  // Fetch fixtures assigned to this referee
  const { data: fixtures = [] } = useQuery({
    queryKey: ['referee-fixtures', currentUser?.id],
    queryFn: async () => {
      console.log('🔍 Fetching fixtures for referee:', currentUser?.id);
      
      if (!currentUser?.id) {
        console.log('❌ No current user ID found');
        return [];
      }

      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          id,
          tournament_id,
          home_team_id,
          away_team_id,
          home_score,
          away_score,
          status,
          kickoff,
          venue,
          match_day,
          home_teams:teams!fixtures_home_team_id_fkey(
            id,
            name,
            logo_url
          ),
          away_teams:teams!fixtures_away_team_id_fkey(
            id,
            name,
            logo_url
          ),
          tournaments(
            id,
            name
          )
        `)
        .eq('referee_id', currentUser.id)
        .order('kickoff', { ascending: true });

      if (error) {
        console.error('❌ Error fetching referee fixtures:', error);
        throw error;
      }

      console.log('✅ Referee fixtures loaded:', data?.length || 0, 'fixtures');
      return data || [];
    },
    enabled: !!currentUser?.id
  });

  const seleccionarFixture = (fixture: Fixture) => {
    console.log('🎯 Referee selected fixture for result entry:', fixture.id);
    setFixtureSeleccionado(fixture);
    setMostrarFormularioResultado(true);
    setResultado({
      golesLocal: fixture.home_score?.toString() || "",
      golesVisitante: fixture.away_score?.toString() || "",
      observaciones: "",
      tarjetasAmarillas: "",
      tarjetasRojas: "",
      jugadorDestacado: ""
    });
    setInformeArbitral(null);
  };

  const handleInformeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInformeArbitral(file);
      toast.success("Informe arbitral cargado correctamente");
    }
  };

  const enviarResultado = async () => {
    if (!fixtureSeleccionado) return;
    
    if (!resultado.golesLocal || !resultado.golesVisitante) {
      toast.error("Por favor ingresa el resultado del partido");
      return;
    }

    if (!informeArbitral) {
      toast.error("Por favor adjunta el informe arbitral");
      return;
    }

    try {
      console.log('📤 Referee submitting match result:', {
        fixtureId: fixtureSeleccionado.id,
        homeScore: resultado.golesLocal,
        awayScore: resultado.golesVisitante
      });

      const { error } = await supabase
        .from('fixtures')
        .update({
          home_score: parseInt(resultado.golesLocal),
          away_score: parseInt(resultado.golesVisitante),
          status: 'finished',
          match_data: {
            observations: resultado.observaciones,
            yellow_cards: resultado.tarjetasAmarillas,
            red_cards: resultado.tarjetasRojas,
            mvp: resultado.jugadorDestacado,
            referee_report: informeArbitral.name,
            completed_by_referee: currentUser?.id,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', fixtureSeleccionado.id);

      if (error) {
        console.error('❌ Error updating match result:', error);
        throw error;
      }

      console.log('✅ Match result updated successfully');
      toast.success(`Resultado enviado: ${fixtureSeleccionado.home_teams?.name} ${resultado.golesLocal} - ${resultado.golesVisitante} ${fixtureSeleccionado.away_teams?.name}`);
      
      setMostrarFormularioResultado(false);
      setFixtureSeleccionado(null);
    } catch (error) {
      console.error('❌ Error submitting result:', error);
      toast.error('Error al enviar el resultado');
    }
  };

  // Update referee profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: typeof profileData) => {
      console.log('💾 Updating referee profile:', updatedData);
      
      const { error } = await supabase
        .from('users')
        .update({
          full_name: updatedData.full_name,
          referee_credential: updatedData.referee_credential,
          city: updatedData.city,
          country: updatedData.country,
          profile_data: {
            phone: updatedData.phone,
            experience: updatedData.experience,
            certifications: updatedData.certifications,
            availability: updatedData.availability,
            bio: updatedData.bio,
            updated_at: new Date().toISOString()
          }
        })
        .eq('auth_user_id', currentUser?.id)
        .eq('role', 'referee');

      if (error) throw error;
    },
    onSuccess: () => {
      console.log('✅ Referee profile updated successfully');
      toast.success('Perfil actualizado correctamente');
      setEditingProfile(false);
      refetchProfile();
      queryClient.invalidateQueries({ queryKey: ['referees'] });
      queryClient.invalidateQueries({ queryKey: ['available-referees'] });
    },
    onError: (error) => {
      console.error('❌ Error updating referee profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  });

  const cerrarModal = () => {
    setMostrarFormularioResultado(false);
    setFixtureSeleccionado(null);
    setResultado({
      golesLocal: "",
      golesVisitante: "",
      observaciones: "",
      tarjetasAmarillas: "",
      tarjetasRojas: "",
      jugadorDestacado: ""
    });
    setInformeArbitral(null);
  };

  const handleSaveProfile = () => {
    if (!profileData.full_name.trim()) {
      toast.error('El nombre completo es requerido');
      return;
    }
    
    updateProfileMutation.mutate(profileData);
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    if (checked) {
      setProfileData(prev => ({
        ...prev,
        availability: [...prev.availability, day]
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        availability: prev.availability.filter(d => d !== day)
      }));
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "programado":
        return <Badge className="bg-blue-500">Programado</Badge>;
      case "en_curso":
        return <Badge className="bg-green-500">En Curso</Badge>;
      case "finalizado":
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const puedeEnviarResultado = resultado.golesLocal && resultado.golesVisitante && informeArbitral;

  return (
    <div className="min-h-screen relative" style={{ 
      backgroundImage: `var(--admin-overlay), var(--admin-gradient)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-primary">🟠 Panel de Árbitro</h1>
              <p className="text-sm text-muted-foreground">Registra los resultados de los partidos</p>
            </div>
            {refereeProfile && (
              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium">{refereeProfile.full_name}</span>
                </div>
                {refereeProfile.referee_credential && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <CreditCard className="w-3 h-3" />
                    <span>ID: {refereeProfile.referee_credential}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mis Partidos
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Mi Perfil
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold">Mis Partidos Asignados</h2>
                <Badge variant="outline" className="text-sm">
                  {fixtures.filter(f => f.status !== "finished").length} partidos pendientes
                </Badge>
              </div>

              {fixtures.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay partidos asignados</h3>
                    <p className="text-muted-foreground">
                      Aún no tienes partidos asignados como árbitro
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {fixtures.map((fixture) => (
                    <Card key={fixture.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <CardTitle className="text-lg">{fixture.tournaments?.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">Jornada: {fixture.match_day}</p>
                          </div>
                          {getEstadoBadge(fixture.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Equipos */}
                          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center flex-1">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {fixture.home_teams?.logo_url ? (
                                  <img 
                                    src={fixture.home_teams.logo_url} 
                                    alt={`Logo ${fixture.home_teams.name}`}
                                    className="w-8 h-8 object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-2xl">🏠</span>
                                )}
                                <span className="font-semibold text-lg">{fixture.home_teams?.name || 'TBD'}</span>
                              </div>
                            </div>
                            
                            <div className="text-center px-4">
                              {fixture.status === 'finished' ? (
                                <div className="text-xl font-bold">
                                  {fixture.home_score} - {fixture.away_score}
                                </div>
                              ) : (
                                <span className="text-2xl font-bold text-gray-500">VS</span>
                              )}
                            </div>
                            
                            <div className="text-center flex-1">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="font-semibold text-lg">{fixture.away_teams?.name || 'TBD'}</span>
                                {fixture.away_teams?.logo_url ? (
                                  <img 
                                    src={fixture.away_teams.logo_url} 
                                    alt={`Logo ${fixture.away_teams.name}`}
                                    className="w-8 h-8 object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-2xl">✈️</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Información del partido */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {fixture.kickoff && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{format(new Date(fixture.kickoff), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                            )}
                            {fixture.kickoff && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{format(new Date(fixture.kickoff), 'HH:mm', { locale: es })}</span>
                              </div>
                            )}
                            {fixture.venue && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{fixture.venue}</span>
                              </div>
                            )}
                          </div>

                          {/* ID del partido */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">ID del Partido:</span> {fixture.id}
                            </p>
                          </div>

                          {/* Botón de acción */}
                          <div className="flex justify-end">
                            <Button 
                              onClick={() => seleccionarFixture(fixture)}
                              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                              disabled={fixture.status === "finished"}
                            >
                              <FileText className="w-4 h-4" />
                              {fixture.status === "finished" ? "Finalizado" : "Registrar Resultado"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Mi Perfil de Árbitro
                    </CardTitle>
                    <Button
                      variant={editingProfile ? "outline" : "default"}
                      onClick={() => {
                        if (editingProfile) {
                          handleSaveProfile();
                        } else {
                          setEditingProfile(true);
                        }
                      }}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {editingProfile ? (
                        <>
                          <Save className="w-4 h-4" />
                          {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar'}
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Editar
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Nombre Completo *</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!editingProfile}
                        className={editingProfile ? 'border-primary' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Credencial e información de ubicación */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="referee_credential">ID de Árbitro</Label>
                      <Input
                        id="referee_credential"
                        value={profileData.referee_credential}
                        onChange={(e) => setProfileData(prev => ({ ...prev, referee_credential: e.target.value }))}
                        disabled={!editingProfile}
                        placeholder="Ej: ARB001"
                        className={editingProfile ? 'border-primary' : ''}
                      />
                      {refereeProfile?.referee_credential && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Tu ID único: {refereeProfile.referee_credential}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                        disabled={!editingProfile}
                        className={editingProfile ? 'border-primary' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                        disabled={!editingProfile}
                        className={editingProfile ? 'border-primary' : ''}
                      />
                    </div>
                  </div>

                  {/* Contacto y experiencia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!editingProfile}
                        className={editingProfile ? 'border-primary' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Años de Experiencia</Label>
                      <Input
                        id="experience"
                        value={profileData.experience}
                        onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                        disabled={!editingProfile}
                        placeholder="Ej: 5 años"
                        className={editingProfile ? 'border-primary' : ''}
                      />
                    </div>
                  </div>

                  {/* Certificaciones */}
                  <div>
                    <Label htmlFor="certifications">Certificaciones</Label>
                    <Textarea
                      id="certifications"
                      value={profileData.certifications}
                      onChange={(e) => setProfileData(prev => ({ ...prev, certifications: e.target.value }))}
                      disabled={!editingProfile}
                      placeholder="Lista tus certificaciones y cursos relevantes..."
                      className={editingProfile ? 'border-primary' : ''}
                    />
                  </div>

                  {/* Disponibilidad */}
                  <div>
                    <Label>Disponibilidad Semanal</Label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mt-2">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                        <label key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profileData.availability.includes(day)}
                            onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                            disabled={!editingProfile}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Biografía */}
                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!editingProfile}
                      placeholder="Cuéntanos sobre tu experiencia como árbitro..."
                      className={editingProfile ? 'border-primary' : ''}
                    />
                  </div>

                  {editingProfile && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingProfile(false);
                          // Reset form data
                          if (refereeProfile) {
                            setProfileData({
                              full_name: refereeProfile.full_name || '',
                              email: refereeProfile.email || '',
                              referee_credential: refereeProfile.referee_credential || '',
                              city: refereeProfile.city || '',
                              country: refereeProfile.country || '',
                              phone: refereeProfile.profile_data?.phone || '',
                              experience: refereeProfile.profile_data?.experience || '',
                              certifications: refereeProfile.profile_data?.certifications || '',
                              availability: refereeProfile.profile_data?.availability || [],
                              bio: refereeProfile.profile_data?.bio || ''
                            });
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de registro de resultado */}
      <Dialog open={mostrarFormularioResultado} onOpenChange={cerrarModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Registrar Resultado del Partido
            </DialogTitle>
          </DialogHeader>
          
          {fixtureSeleccionado && (
            <div className="space-y-6">
              {/* Información del partido */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      {fixtureSeleccionado.home_teams?.logo_url ? (
                        <img 
                          src={fixtureSeleccionado.home_teams.logo_url} 
                          alt={`Logo ${fixtureSeleccionado.home_teams.name}`}
                          className="w-6 h-6 object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xl">🏠</span>
                      )}
                      <span className="font-semibold">{fixtureSeleccionado.home_teams?.name}</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold">VS</span>
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{fixtureSeleccionado.away_teams?.name}</span>
                      {fixtureSeleccionado.away_teams?.logo_url ? (
                        <img 
                          src={fixtureSeleccionado.away_teams.logo_url} 
                          alt={`Logo ${fixtureSeleccionado.away_teams.name}`}
                          className="w-6 h-6 object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xl">✈️</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <p><strong>ID:</strong> {fixtureSeleccionado.id}</p>
                  {fixtureSeleccionado.kickoff && (
                    <p>{format(new Date(fixtureSeleccionado.kickoff), 'dd/MM/yyyy HH:mm', { locale: es })} - {fixtureSeleccionado.venue}</p>
                  )}
                  <p>{fixtureSeleccionado.tournaments?.name} (Jornada {fixtureSeleccionado.match_day})</p>
                </div>
              </div>

              {/* Formulario de resultado */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Goles {fixtureSeleccionado.home_teams?.name} *</Label>
                    <Input
                      type="number"
                      value={resultado.golesLocal}
                      onChange={(e) => setResultado({...resultado, golesLocal: e.target.value})}
                      placeholder="0"
                      min="0"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goles {fixtureSeleccionado.away_teams?.name} *</Label>
                    <Input
                      type="number"
                      value={resultado.golesVisitante}
                      onChange={(e) => setResultado({...resultado, golesVisitante: e.target.value})}
                      placeholder="0"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tarjetas Amarillas</Label>
                    <Input
                      value={resultado.tarjetasAmarillas}
                      onChange={(e) => setResultado({...resultado, tarjetasAmarillas: e.target.value})}
                      placeholder="Ej: Juan Pérez (15'), María López (45')"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tarjetas Rojas</Label>
                    <Input
                      value={resultado.tarjetasRojas}
                      onChange={(e) => setResultado({...resultado, tarjetasRojas: e.target.value})}
                      placeholder="Ej: Carlos Ruiz (67')"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Jugador Destacado</Label>
                  <Input
                    value={resultado.jugadorDestacado}
                    onChange={(e) => setResultado({...resultado, jugadorDestacado: e.target.value})}
                    placeholder="Nombre del jugador más destacado del partido"
                  />
                </div>

                {/* Informe Arbitral */}
                <div className="space-y-2">
                  <Label>Informe Arbitral *</Label>
                  <div className="flex items-center gap-4">
                    {informeArbitral && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="w-4 h-4" />
                        <span>{informeArbitral.name}</span>
                      </div>
                    )}
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="informe-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {informeArbitral ? 'Cambiar Archivo' : 'Subir Informe'}
                        <input
                          id="informe-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleInformeChange}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos permitidos: PDF, DOC, DOCX, TXT
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <textarea
                    className="w-full p-3 border rounded-md resize-none"
                    rows={4}
                    value={resultado.observaciones}
                    onChange={(e) => setResultado({...resultado, observaciones: e.target.value})}
                    placeholder="Observaciones adicionales del partido (incidentes, lesiones, etc.)"
                  />
                </div>
              </div>

              {/* Vista previa del resultado */}
              {resultado.golesLocal && resultado.golesVisitante && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Vista previa del resultado:</h4>
                  <p className="text-lg font-bold text-center">
                    {fixtureSeleccionado.home_teams?.name} {resultado.golesLocal} - {resultado.golesVisitante} {fixtureSeleccionado.away_teams?.name}
                  </p>
                  {informeArbitral && (
                    <p className="text-sm text-center text-green-600 mt-2">
                      ✓ Informe arbitral adjunto: {informeArbitral.name}
                    </p>
                  )}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4">
                <Button 
                  onClick={enviarResultado} 
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={!puedeEnviarResultado}
                >
                  📤 Enviar Resultado
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cerrarModal}
                  className="flex-1"
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

export default Arbitro;