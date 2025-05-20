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
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get initial session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        if (sessionData.session?.user) {
          console.log('User authenticated:', sessionData.session.user.id);
          setUser(sessionData.session.user);
          
          // Fetch user profile if authenticated
          const profileData = await fetchProfile(sessionData.session.user.id);
          setProfile(profileData);
        } else {
          console.log('No session found');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial auth check
    initializeAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Update profile when auth state changes
        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );
    
    return () => {
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
        throw error;
      }
      
      console.log('Sign in successful');
      return data;
    } catch (err) {
      console.error('Sign in exception:', err);
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
      
      // Clear user data
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
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