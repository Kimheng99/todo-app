// src/context/AuthContext.js
// React Context lets us share state (like the logged-in user) across ALL components
// without passing it through props at every level.
//
// Think of it as a "global store" — any component can read or update auth state.
//
// We store:
//   - user: the logged-in user's info (id, name, email)
//   - token: the JWT token string
//
// We provide:
//   - login(): saves token + user to state and localStorage
//   - logout(): clears everything and redirects to login

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context object
const AuthContext = createContext(null);

// AuthProvider wraps the app and provides auth state to all children
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // While we check localStorage on startup

  // On app startup: restore auth state from localStorage
  // This way, if you refresh the page, you don't get logged out
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Called after successful login or register
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Called when user clicks "Logout"
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // isAuthenticated is true when we have a valid token
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — makes it easy to use auth in any component:
// const { user, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
