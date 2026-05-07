// src/api/api.js
// This file centralizes all API calls to the backend.
// Instead of writing fetch() in every component, we write it once here.
//
// BASE_URL points to our Express backend.
// All requests go through the functions below.

const BASE_URL = 'http://localhost:5000/api';

// Helper: Get the JWT token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper: Build headers for authenticated requests
// We include "Authorization: Bearer <token>" so the backend knows who we are
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const registerUser = async (name, email, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// ─── TODOS ───────────────────────────────────────────────────────────────────

export const fetchTodos = async () => {
  const res = await fetch(`${BASE_URL}/todos`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const createTodo = async (title) => {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
  return res.json();
};

export const updateTodo = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  return res.json();
};

export const deleteTodo = async (id) => {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
};
