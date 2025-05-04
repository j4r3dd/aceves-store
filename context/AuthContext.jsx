// context/AuthContext.jsx (Refactored)
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Create the context
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch and set session data
    const checkSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Set session and user data if available
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (err) {
        console.error('Error checking session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Check session on initial load
    checkSession();
    
    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    );
    
    // Clean up listener on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Auth functions
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced auth context value
  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    supabase, // Expose supabase client for advanced use cases
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}