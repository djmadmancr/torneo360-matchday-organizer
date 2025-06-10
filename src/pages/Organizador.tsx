
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Organizador = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreTorneo: "",
    tipoFutbol: "",
    formato: "",
    tipoTorneo: "",
    edadMinima: "",
    edadMaxima: "",
    maxJugadores: "",
    puntoPenales: false,
    torneoPublico: true,
    reglamento: ""
  });

  const [torneoId] = useState(() => {
    return 'TRN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombreTorneo || !formData.tipoFutbol || !formData.formato) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    console.log("Datos del torneo:", { ...formData, torneoId });
    toast.success("¡Torneo creado exitosamente! ID: " + torneoId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
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
            <div>
              <h1 className="text-2xl font-bold text-primary">🔵 Panel de Organizador</h1>
              <p className="text-muted-foreground">Crea y configura tu torneo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🏆 Crear Nuevo Torneo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombreTorneo">Nombre del Torneo *</Label>
                  <Input
                    id="nombreTorneo"
                    value={formData.nombreTorneo}
                    onChange={(e) => setFormData({...formData, nombreTorneo: e.target.value})}
                    placeholder="Ej: Copa Primavera 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="torneoId">ID del Torneo</Label>
                  <Input
                    id="torneoId"
                    value={torneoId}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* Configuración del Torneo */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoFutbol">Tipo de Fútbol *</Label>
                  <Select onValueChange={(value) => setFormData({...formData, tipoFutbol: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="futbol5">Fútbol 5</SelectItem>
                      <SelectItem value="futbol7">Fútbol 7</SelectItem>
                      <SelectItem value="futbol9">Fútbol 9</SelectItem>
                      <SelectItem value="futbol11">Fútbol 11</SelectItem>
                      <SelectItem value="sala">Fútbol Sala</SelectItem>
                      <SelectItem value="playa">Fútbol Playa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formato">Formato *</Label>
                  <Select onValueChange={(value) => setFormData({...formData, formato: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completo">Completo</SelectItem>
                      <SelectItem value="eliminatorio">Eliminatorio</SelectItem>
                      <SelectItem value="rapido">Rápido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoTorneo">Tipo de Torneo</Label>
                <Select onValueChange={(value) => setFormData({...formData, tipoTorneo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de torneo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="internacional">Internacional</SelectItem>
                    <SelectItem value="invitacional">Invitacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Configuración de Participantes */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edadMinima">Edad Mínima</Label>
                  <Input
                    id="edadMinima"
                    type="number"
                    value={formData.edadMinima}
                    onChange={(e) => setFormData({...formData, edadMinima: e.target.value})}
                    placeholder="16"
                    min="5"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edadMaxima">Edad Máxima</Label>
                  <Input
                    id="edadMaxima"
                    type="number"
                    value={formData.edadMaxima}
                    onChange={(e) => setFormData({...formData, edadMaxima: e.target.value})}
                    placeholder="35"
                    min="5"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxJugadores">Máx. Jugadores por Equipo</Label>
                  <Input
                    id="maxJugadores"
                    type="number"
                    value={formData.maxJugadores}
                    onChange={(e) => setFormData({...formData, maxJugadores: e.target.value})}
                    placeholder="15"
                    min="7"
                    max="30"
                  />
                </div>
              </div>

              {/* Opciones Adicionales */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="puntoPenales">Punto adicional por penales</Label>
                    <p className="text-sm text-muted-foreground">Solo aplica en fase de grupos</p>
                  </div>
                  <Switch
                    id="puntoPenales"
                    checked={formData.puntoPenales}
                    onCheckedChange={(checked) => setFormData({...formData, puntoPenales: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="torneoPublico">Torneo público</Label>
                    <p className="text-sm text-muted-foreground">Mostrar en la lista pública de torneos</p>
                  </div>
                  <Switch
                    id="torneoPublico"
                    checked={formData.torneoPublico}
                    onCheckedChange={(checked) => setFormData({...formData, torneoPublico: checked})}
                  />
                </div>
              </div>

              {/* Reglamento */}
              <div className="space-y-2">
                <Label htmlFor="reglamento">Reglamento General del Torneo</Label>
                <Textarea
                  id="reglamento"
                  value={formData.reglamento}
                  onChange={(e) => setFormData({...formData, reglamento: e.target.value})}
                  placeholder="Describe las reglas generales del torneo, horarios, sanciones, etc."
                  rows={6}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  🏆 Crear Torneo
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Organizador;
