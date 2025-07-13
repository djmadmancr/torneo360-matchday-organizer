
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserRole = 'admin' | 'organizer' | 'referee' | 'team_admin';

interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  roles?: string[]; // Add support for multiple roles
  full_name?: string;
}

interface AuthContextType {
  session: Session | null;
  currentUser: CurrentUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from public.users table
  const fetchUserProfile = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, roles, full_name')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role as UserRole,
        roles: Array.isArray(data.roles) ? data.roles : 
               typeof data.roles === 'string' ? JSON.parse(data.roles) : 
               [data.role || 'team_admin'],
        full_name: data.full_name
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer user profile fetching to avoid deadlocks
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(session.user.id);
            setCurrentUser(userProfile);
            setIsLoading(false);
          }, 0);
        } else {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(userProfile => {
          setCurrentUser(userProfile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error('Error al iniciar sesión: ' + error.message);
        return false;
      }

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        setCurrentUser(userProfile);
        toast.success('¡Bienvenido!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Error al iniciar sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast.error('Error al registrarse: ' + error.message);
        return false;
      }

      if (data.user) {
        toast.success('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Error al registrarse');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error al cerrar sesión');
      } else {
        setSession(null);
        setCurrentUser(null);
        toast.success('Sesión cerrada');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const value: AuthContextType = {
    session,
    currentUser,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
