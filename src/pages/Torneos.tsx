import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Key, ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublicTournaments } from '@/components/tournaments/PublicTournaments';
import { InviteCodeSearch } from '@/components/tournaments/InviteCodeSearch';

const Torneos = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('public');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
              <h1 className="text-xl md:text-2xl font-bold text-primary">🏆 Torneos Disponibles</h1>
              <p className="text-sm text-muted-foreground">Busca y únete a torneos de fútbol</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <Trophy className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Encuentra tu Torneo</h2>
                <p className="text-gray-600 max-w-2xl mx-auto mt-2">
                  Únete a torneos públicos o busca torneos privados con código de invitación
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="public" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Torneos Públicos
              </TabsTrigger>
              <TabsTrigger value="invite" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Por Invitación
              </TabsTrigger>
            </TabsList>

            <TabsContent value="public">
              <PublicTournaments />
            </TabsContent>

            <TabsContent value="invite">
              <InviteCodeSearch />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Torneos;