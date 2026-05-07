// src/App.js
// This is the root of our React app.
// It sets up routing (React Router) so different URLs show different pages.
//
// Route structure:
//   /           → redirects to /login
//   /register   → Register page (public)
//   /login      → Login page (public)
//   /todos      → Todos page (PROTECTED — requires login)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Todos from './pages/Todos';

function App() {
  return (
    // AuthProvider makes auth state available to every component in the tree
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default: redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected route — PrivateRoute checks auth before rendering */}
          <Route
            path="/todos"
            element={
              <PrivateRoute>
                <Todos />
              </PrivateRoute>
            }
          />

          {/* Catch-all: unknown routes → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
