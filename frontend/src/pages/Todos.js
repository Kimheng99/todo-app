// src/pages/Todos.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load todos when the page mounts
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await fetchTodos();
      if (data.error) {
        setError(data.error);
      } else {
        setTodos(data.todos);
      }
    } catch {
      setError('Could not load todos.');
    } finally {
      setLoading(false);
    }
  };

  // ── Add a new todo ──────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setAdding(true);
    try {
      const data = await createTodo(newTitle);
      if (data.error) {
        setError(data.error);
      } else {
        // Prepend the new todo to the top of the list
        setTodos([data.todo, ...todos]);
        setNewTitle('');
      }
    } catch {
      setError('Could not add todo.');
    } finally {
      setAdding(false);
    }
  };

  // ── Toggle completed status ─────────────────────────────────────────────────
  const handleToggle = async (todo) => {
    const newCompleted = !todo.completed;

    // Optimistic update: update the UI immediately, then sync with server.
    // This feels faster to the user than waiting for the server to respond.
    setTodos(todos.map(t =>
      t.id === todo.id ? { ...t, completed: newCompleted } : t
    ));

    try {
      await updateTodo(todo.id, { completed: newCompleted });
    } catch {
      // If the request fails, revert the optimistic update
      setTodos(todos.map(t =>
        t.id === todo.id ? { ...t, completed: todo.completed } : t
      ));
    }
  };

  // ── Start editing a todo title ──────────────────────────────────────────────
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  // ── Save edited title ───────────────────────────────────────────────────────
  const saveEdit = async (id) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }

    setTodos(todos.map(t =>
      t.id === id ? { ...t, title: editingTitle } : t
    ));
    setEditingId(null);

    try {
      await updateTodo(id, { title: editingTitle });
    } catch {
      setError('Could not save edit.');
      loadTodos(); // Reload to restore correct state
    }
  };

  // ── Delete a todo ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setTodos(todos.filter(t => t.id !== id)); // Optimistic remove

    try {
      await deleteTodo(id);
    } catch {
      setError('Could not delete todo.');
      loadTodos();
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const completed = todos.filter(t => t.completed).length;
  const total = todos.length;

  return (
    <div className="todos-page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="todos-header">
        <div className="header-left">
          <div className="logo">✓</div>
          <div>
            <h1>My Tasks</h1>
            <p className="greeting">Hello, {user?.name}!</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Sign out
        </button>
      </header>

      <main className="todos-main">
        {/* ── Error Banner ────────────────────────────────────────────── */}
        {error && (
          <div className="error-banner" onClick={() => setError('')}>
            {error} <span className="dismiss">×</span>
          </div>
        )}

        {/* ── Progress Bar ────────────────────────────────────────────── */}
        {total > 0 && (
          <div className="progress-section">
            <div className="progress-label">
              <span>{completed} of {total} tasks complete</span>
              <span>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Add Todo Form ────────────────────────────────────────────── */}
        <form onSubmit={handleAdd} className="add-form">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="add-input"
          />
          <button type="submit" className="btn-add" disabled={adding || !newTitle.trim()}>
            {adding ? '...' : '+'}
          </button>
        </form>

        {/* ── Todo List ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading your tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No tasks yet</h3>
            <p>Add your first task above to get started!</p>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
              >
                {/* Checkbox */}
                <button
                  className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                  onClick={() => handleToggle(todo)}
                  aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {todo.completed && <span>✓</span>}
                </button>

                {/* Title or Edit Input */}
                {editingId === todo.id ? (
                  <input
                    className="edit-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveEdit(todo.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(todo.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="todo-title"
                    onDoubleClick={() => !todo.completed && startEdit(todo)}
                    title={todo.completed ? '' : 'Double-click to edit'}
                  >
                    {todo.title}
                  </span>
                )}

                {/* Actions */}
                <div className="todo-actions">
                  {!todo.completed && editingId !== todo.id && (
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => startEdit(todo)}
                      title="Edit"
                    >
                      ✎
                    </button>
                  )}
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(todo.id)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ── Clear completed button ───────────────────────────────────── */}
        {completed > 0 && (
          <div className="list-footer">
            <button
              className="btn-clear"
              onClick={async () => {
                const completedTodos = todos.filter(t => t.completed);
                setTodos(todos.filter(t => !t.completed));
                for (const todo of completedTodos) {
                  await deleteTodo(todo.id);
                }
              }}
            >
              Clear {completed} completed task{completed > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Todos;
