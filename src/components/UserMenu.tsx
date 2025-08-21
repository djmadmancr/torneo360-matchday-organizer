import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { useLegacyAuth } from '@/hooks/useLegacyAuth';
import { useNavigate } from 'react-router-dom';
import { UserProfileModal } from '@/components/UserProfileModal';

interface UserMenuProps {
  onEditProfile: () => void;
  currentUser?: {
    email: string;
    full_name?: string;
  };
}

export const UserMenu: React.FC<UserMenuProps> = ({ onEditProfile, currentUser }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { logout } = useLegacyAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    if (currentUser) {
      setShowProfileModal(true);
    } else {
      onEditProfile();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background">
          <DropdownMenuItem onClick={handleEditProfile}>
            <Settings className="mr-2 h-4 w-4" />
            Configuración de usuario
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentUser && (
        <UserProfileModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          currentUser={currentUser}
        />
      )}
    </>
  );
};