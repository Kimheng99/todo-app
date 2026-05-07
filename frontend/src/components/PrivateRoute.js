// src/components/PrivateRoute.js
// This component "guards" routes that require authentication.
//
// How it works:
// - If the user IS logged in → render the protected page normally
// - If the user is NOT logged in → redirect them to /login
//
// We wrap the Todos page with this so unauthenticated users
// can never access it directly (even by typing the URL).

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // While we're checking localStorage, don't render anything yet
  // (prevents a flash of the login page before auth is restored)
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  // If logged in: show the page. If not: go to /login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
