// 1. CONSOLIDATED AUTH CONTEXT (context/AuthContext.jsx)
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  // Helper function to fetch profile data
  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      console.log('Profile data received:', data);
      return data;
    } catch (err) {
      console.error('Profile fetch exception:', err);
      return null;
    }
  };

  // Initialize auth state and set up listener
  useEffect(() => {
    let isMounted = true;
    let initialLoadComplete = false;

    // Set up auth state change listener FIRST
    // This ensures we catch the INITIAL_SESSION event from Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event, newSession?.user?.id);

        // Clear any previous errors on auth state change
        setError(null);

        setSession(newSession);
        setUser(newSession?.user || null);

        // Update profile when auth state changes
        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          if (isMounted) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }

        // Mark loading as false after handling auth state
        if (isMounted) {
          initialLoadComplete = true;
          setLoading(false);
        }
      }
    );

    // Fallback: if onAuthStateChange doesn't fire within 3 seconds, check session manually
    const fallbackTimer = setTimeout(async () => {
      if (!isMounted || initialLoadComplete) return;

      console.log('Fallback: checking session manually');
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (!isMounted || initialLoadComplete) return;

        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);

          if (sessionData.session.user) {
            const profileData = await fetchProfile(sessionData.session.user.id);
            if (isMounted) {
              setProfile(profileData);
            }
          }
        }
      } catch (err) {
        console.error('Fallback session check error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Consolidated auth functions
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        throw error;
      }

      console.log('Sign in successful');
      // Don't set loading=false here - onAuthStateChange will handle it
      return data;
    } catch (err) {
      console.error('Sign in exception:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const signUp = async (email, password, metadata) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting registration for:', email);

      // Call our registration API endpoint
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          nombre: metadata.nombre,
          telefono: metadata.telefono,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      console.log('Registration successful');

      // Now sign in the user automatically
      const signInResult = await signIn(email, password);

      return signInResult;
    } catch (err) {
      console.error('Sign up exception:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        setLoading(false);
        throw error;
      }

      // Clear user data immediately (onAuthStateChange will also fire)
      setUser(null);
      setProfile(null);
      setSession(null);
      // Don't set loading=false here - onAuthStateChange will handle it
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Helper function to check if user has admin role
  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  // For debugging - remove in production
  useEffect(() => {
    console.log('Auth state updated:', { 
      user: user?.id, 
      profile: profile?.role,
      isAuthenticated: !!user,
      isAdmin: isAdmin()
    });
  }, [user, profile]);

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: isAdmin,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}