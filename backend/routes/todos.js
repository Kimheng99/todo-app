// routes/todos.js
// All todo routes are PROTECTED — they require a valid JWT token.
// The authenticateToken middleware runs before every handler in this router.

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todoController');

// Apply the auth middleware to ALL routes in this router.
// Any request without a valid token will be rejected here, before
// reaching the controller functions below.
router.use(authenticateToken);

// GET    /api/todos       → get all todos for logged-in user
// POST   /api/todos       → create a new todo
// PUT    /api/todos/:id   → update a todo by id
// DELETE /api/todos/:id   → delete a todo by id
router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;
