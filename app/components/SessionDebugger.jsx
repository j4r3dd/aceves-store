'use client';
// app/components/SessionDebugger.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function SessionDebugger() {
  const [sessionInfo, setSessionInfo] = useState({
    status: 'Checking...',
    userId: null,
    email: null,
    expiresAt: null,
    error: null
  });

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setSessionInfo({
          status: 'Error',
          error: error.message,
          userId: null,
          email: null,
          expiresAt: null
        });
        return;
      }
      
      if (data.session) {
        setSessionInfo({
          status: 'Authenticated',
          userId: data.session.user.id,
          email: data.session.user.email,
          expiresAt: new Date(data.session.expires_at * 1000).toLocaleString(),
          error: null
        });
      } else {
        setSessionInfo({
          status: 'Not authenticated',
          userId: null,
          email: null,
          expiresAt: null,
          error: null
        });
      }
    } catch (err) {
      setSessionInfo({
        status: 'Exception',
        error: err.message,
        userId: null,
        email: null,
        expiresAt: null
      });
    }
  };

  useEffect(() => {
    checkSession();
    
    // Set up auth state change listener
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      checkSession();
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Session Debug</h4>
      <div>
        <div>Status: <strong>{sessionInfo.status}</strong></div>
        {sessionInfo.userId && <div>User ID: {sessionInfo.userId.substring(0, 8)}...</div>}
        {sessionInfo.email && <div>Email: {sessionInfo.email}</div>}
        {sessionInfo.expiresAt && <div>Expires: {sessionInfo.expiresAt}</div>}
        {sessionInfo.error && <div style={{ color: 'red' }}>Error: {sessionInfo.error}</div>}
      </div>
      <button 
        onClick={checkSession}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          padding: '4px 8px',
          fontSize: '11px',
          marginTop: '8px',
          cursor: 'pointer'
        }}
      >
        Refresh
      </button>
    </div>
  );
}