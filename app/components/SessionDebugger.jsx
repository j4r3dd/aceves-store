// app/components/SessionDebugger.jsx (development-only)
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SessionDebugger() {
  // Don't render anything in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const { user, session, loading, error } = useAuth();

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
        <div>Status: <strong>{loading ? 'Loading...' : (user ? 'Authenticated' : 'Not authenticated')}</strong></div>
        {user && <div>User ID: {user.id.substring(0, 8)}...</div>}
        {user && <div>Email: {user.email}</div>}
        {session && <div>Expires: {new Date(session.expires_at * 1000).toLocaleString()}</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
      <div style={{ marginTop: '8px', fontSize: '11px', color: 'gray' }}>
        ENV: {process.env.NODE_ENV}
      </div>
    </div>
  );
}