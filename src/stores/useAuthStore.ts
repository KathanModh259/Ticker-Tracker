import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { useTickerStore } from './useTickerStore';

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signUp: (email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signUp: async (email: string, password: string, phone?: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: phone ? { phone } : undefined
        }
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      if (data.user) {
        set({ 
          user: {
            id: data.user.id,
            email: data.user.email!,
            phone: data.user.user_metadata?.phone,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || data.user.created_at
          },
          session: data.session,
          loading: false 
        });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, error: 'Sign up failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      if (data.user) {
        set({ 
          user: {
            id: data.user.id,
            email: data.user.email!,
            phone: data.user.user_metadata?.phone,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || data.user.created_at
          },
          session: data.session,
          loading: false 
        });
        
        // Load user's watchlist
        useTickerStore.getState().loadUserWatchlist(data.user.id);
        
        return { success: true };
      }

      set({ loading: false });
      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({ user: null, session: null, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      set({ error: errorMessage, loading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateProfile: async (updates: Partial<AuthUser>) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, error: error.message };
      }

      // Update local state
      const currentUser = get().user;
      if (currentUser) {
        set({ 
          user: { ...currentUser, ...updates },
          loading: false 
        });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null })
}));

// Initialize auth state
let isInitialized = false;

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        useAuthStore.setState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            phone: session.user.user_metadata?.phone,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at
          },
          session,
          loading: false
        });
        
        // Load user's watchlist
        useTickerStore.getState().loadUserWatchlist(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({
          user: null,
          session: null,
          loading: false
        });
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session
        if (session?.user) {
          useAuthStore.setState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              phone: session.user.user_metadata?.phone,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at
            },
            session,
            loading: false
          });
          
          // Load user's watchlist
          useTickerStore.getState().loadUserWatchlist(session.user.id);
        } else {
          useAuthStore.setState({ 
            user: null, 
            session: null, 
            loading: false 
          });
        }
        isInitialized = true;
      }
    });

// Get initial session only if not already initialized
if (!isInitialized) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!isInitialized) {
      if (session?.user) {
        useAuthStore.setState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            phone: session.user.user_metadata?.phone,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at
          },
          session,
          loading: false
        });
      } else {
        useAuthStore.setState({ 
          user: null, 
          session: null, 
          loading: false 
        });
      }
      isInitialized = true;
    }
  });
}
