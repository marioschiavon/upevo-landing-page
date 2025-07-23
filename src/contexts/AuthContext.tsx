
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state...');
          setSession(null);
          setUser(null);
          setLoading(false);
          
          // Clear any remaining tokens
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-uazfmqkmuqmwuubfwtst-auth-token');
          
          // Force redirect to login after state is cleared
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        } else if (event === 'SIGNED_IN') {
          console.log('User signed in');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        console.error('Erro ao criar perfil do usuário:', error);
      }
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Iniciando processo de logout...');
      
      // Mostrar toast de loading
      toast({
        title: "Fazendo logout...",
        description: "Aguarde um momento",
      });
      
      // Fazer logout no Supabase - o evento SIGNED_OUT será disparado automaticamente
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout do Supabase:', error);
        toast({
          title: "Erro",
          description: "Erro ao fazer logout",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Logout do Supabase realizado com sucesso');
      // O resto será tratado pelo onAuthStateChange quando o evento SIGNED_OUT for disparado
      
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
