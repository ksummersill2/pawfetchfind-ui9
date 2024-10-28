import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, AuthError } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Create profile if it doesn't exist
        const { data: profile } = await supabase
          .from('profiles')
          .select()
          .eq('id', session?.user?.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert([{
            id: session?.user?.id,
            email: session?.user?.email,
            display_name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0]
          }]);
        }
      }

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: !!session,
        user: session?.user ?? null,
        isAdmin: session?.user?.email === 'admin@pawfectfind.com',
        loading: false,
        error: null
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      setAuthState({
        isAuthenticated: !!session,
        user: session?.user ?? null,
        isAdmin: session?.user?.email === 'admin@pawfectfind.com',
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as AuthError
      }));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as AuthError
      }));
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        isAuthenticated: false,
        user: null,
        isAdmin: false,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as AuthError
      }));
    }
  };

  return {
    ...authState,
    signInWithGoogle,
    logout,
    refreshSession: checkSession
  };
};