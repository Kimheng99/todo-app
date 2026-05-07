// controllers/todoController.js
// All todo-related business logic lives here.
//
// IMPORTANT SECURITY NOTE:
// Every query filters by user_id = req.user.id
// This means a user can ONLY see/edit/delete their OWN todos.
// Even if someone manually sends another user's todo ID, the query will
// find no matching record (because the user_id won't match), so it safely
// returns "not found" instead of leaking another user's data.

const pool = require('../config/db');

// ─────────────────────────────────────────────
// GET ALL TODOS for logged-in user
// GET /api/todos
// ─────────────────────────────────────────────
const getTodos = async (req, res) => {
  try {
    // req.user.id comes from the JWT token (set by auth middleware)
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, title, completed, created_at 
       FROM todos 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ todos: result.rows });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Server error. Could not fetch todos.' });
  }
};

// ─────────────────────────────────────────────
// CREATE a new todo
// POST /api/todos
// ─────────────────────────────────────────────
const createTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Todo title is required.' });
    }

    const result = await pool.query(
      `INSERT INTO todos (user_id, title, completed) 
       VALUES ($1, $2, false) 
       RETURNING id, title, completed, created_at`,
      [userId, title.trim()]
    );

    res.status(201).json({
      message: 'Todo created!',
      todo: result.rows[0],
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Server error. Could not create todo.' });
  }
};

// ─────────────────────────────────────────────
// UPDATE a todo (title and/or completed status)
// PUT /api/todos/:id
// ─────────────────────────────────────────────
const updateTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;
    const { title, completed } = req.body;

    // We always include user_id = $3 in the WHERE clause.
    // This ensures users can ONLY update their OWN todos.
    const result = await pool.query(
      `UPDATE todos 
       SET title = COALESCE($1, title), 
           completed = COALESCE($2, completed)
       WHERE id = $3 AND user_id = $4
       RETURNING id, title, completed, created_at`,
      [title?.trim() || null, completed ?? null, todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    res.json({
      message: 'Todo updated!',
      todo: result.rows[0],
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Server error. Could not update todo.' });
  }
};

// ─────────────────────────────────────────────
// DELETE a todo
// DELETE /api/todos/:id
// ─────────────────────────────────────────────
const deleteTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;

    // Again: AND user_id = $2 ensures only the owner can delete their todo
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    res.json({ message: 'Todo deleted successfully.' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Server error. Could not delete todo.' });
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
