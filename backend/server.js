// server.js
// This is the entry point of our backend.
// It sets up Express, registers middleware, mounts routes, and starts listening.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ────────────────────────────────────────────────────────

// CORS (Cross-Origin Resource Sharing)
// Our React frontend runs on http://localhost:3000
// Our backend runs on http://localhost:5000
// Without CORS, the browser blocks requests between different ports/domains.
// This tells Express: "yes, allow requests from our frontend."
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Parse incoming JSON request bodies
// Without this, req.body would be undefined when the client sends JSON data
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

// All authentication routes → /api/auth/register, /api/auth/login
app.use('/api/auth', authRoutes);

// All todo routes → /api/todos (GET, POST, PUT /:id, DELETE /:id)
app.use('/api/todos', todoRoutes);

// Health check route — useful to test if the server is running
app.get('/', (req, res) => {
  res.json({ message: '✅ Todo API is running!' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// If no route matched, return a 404 error
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any unhandled errors thrown in route handlers
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
