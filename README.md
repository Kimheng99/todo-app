# ✓ TodoApp — Full Stack (React + Node + PostgreSQL)

A complete todo application with user authentication. Each user sees only their own todos.

---

## 📁 Project Structure

```
todo-app/
├── backend/                    ← Node.js + Express API
│   ├── server.js               ← Entry point: starts Express server
│   ├── package.json
│   ├── .env.example            ← Copy this to .env and fill in your values
│   ├── config/
│   │   └── db.js               ← PostgreSQL connection pool
│   ├── routes/
│   │   ├── auth.js             ← /api/auth/register, /api/auth/login
│   │   └── todos.js            ← /api/todos (CRUD)
│   ├── controllers/
│   │   ├── authController.js   ← Register & login logic
│   │   └── todoController.js   ← CRUD logic for todos
│   ├── middleware/
│   │   └── auth.js             ← JWT verification middleware
│   └── db/
│       └── schema.sql          ← SQL to create database tables
│
└── frontend/                   ← React app
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js            ← React entry point
        ├── index.css           ← Global styles
        ├── App.js              ← Routes setup
        ├── api/
        │   └── api.js          ← All fetch() calls to the backend
        ├── context/
        │   └── AuthContext.js  ← Global auth state (user, token)
        ├── components/
        │   └── PrivateRoute.js ← Redirects to login if not authenticated
        └── pages/
            ├── Register.js     ← /register
            ├── Login.js        ← /login
            └── Todos.js        ← /todos (protected)
```

---

## 🗄️ Step 1: Set Up PostgreSQL

### Install PostgreSQL (if not installed)
- **Mac**: `brew install postgresql@15` then `brew services start postgresql@15`
- **Ubuntu/Debian**: `sudo apt install postgresql postgresql-contrib`
- **Windows**: Download from https://www.postgresql.org/download/windows/

### Create the database
```bash
# Open PostgreSQL command line
psql -U postgres

# Inside psql, create the database
CREATE DATABASE todoapp;

# Exit psql
\q
```

### Create the tables
```bash
# Run the schema file against your new database
psql -U postgres -d todoapp -f backend/db/schema.sql
```

This creates two tables:

```sql
-- Stores user accounts
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,   -- bcrypt hashed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stores todos, linked to users
CREATE TABLE todos (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(500) NOT NULL,
  completed  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚙️ Step 2: Configure the Backend

```bash
cd backend

# Copy the example env file
cp .env.example .env
```

Now open `.env` and fill in your details:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todoapp
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=make_this_a_long_random_string_like_this_abc123xyz
JWT_EXPIRES_IN=7d
```

**Important:** Change `JWT_SECRET` to any long random string. This is the key used to sign tokens — keep it secret in production!

---

## 📦 Step 3: Install Dependencies

### Backend
```bash
cd todo-app/backend
npm install
```

### Frontend
```bash
cd todo-app/frontend
npm install
```

---

## 🚀 Step 4: Run the App

You need **two terminal windows** — one for the backend, one for the frontend.

### Terminal 1 — Start the backend:
```bash
cd todo-app/backend
npm run dev       # Uses nodemon (auto-restarts on file changes)
# OR
npm start         # Uses node (no auto-restart)
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ Connected to PostgreSQL database
```

### Terminal 2 — Start the frontend:
```bash
cd todo-app/frontend
npm start
```

Your browser will open automatically at **http://localhost:3000**

---

## 🧪 Step 5: Test the App

### Via the browser:
1. Go to http://localhost:3000/register
2. Create an account
3. You'll be redirected to the Todos page
4. Add, complete, edit, and delete todos
5. Open an incognito window and create a second account — notice each user has their own separate todos

### Via curl (test the API directly):
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"secret123"}'

# Login (copy the token from the response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret123"}'

# Get todos (replace TOKEN with the token from login)
curl http://localhost:5000/api/todos \
  -H "Authorization: Bearer TOKEN"

# Create a todo
curl -X POST http://localhost:5000/api/todos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries"}'

# Update a todo (replace 1 with actual todo id)
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete a todo
curl -X DELETE http://localhost:5000/api/todos/1 \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔐 How Authentication Works (Beginner Explanation)

### Registration flow:
1. User submits name + email + password
2. Backend checks email isn't already taken
3. Password is **hashed** with bcrypt (turned into an unreadable scramble like `$2b$10$...`)
4. Hashed password is saved to the database — **the real password is never stored**
5. A JWT token is created and sent back to the frontend

### Login flow:
1. User submits email + password
2. Backend finds the user by email
3. bcrypt.compare() checks if the submitted password matches the stored hash
4. If it matches, a JWT token is returned

### JWT Token:
- A **JWT (JSON Web Token)** is like a signed ID card
- It contains your user ID and email, and is signed with a secret key
- The frontend stores it in **localStorage** and sends it with every request:
  `Authorization: Bearer eyJhbGci...`
- The backend verifies the signature to confirm the token is genuine
- No session or cookie needed!

### Why only see your own todos?
Every database query includes `WHERE user_id = [logged-in user's id]`.
So even if someone sends another user's todo ID, the query finds nothing because the `user_id` doesn't match.

---

## 🐛 Common Issues

| Problem | Solution |
|--------|---------|
| `ECONNREFUSED` on port 5000 | Make sure the backend is running |
| `password authentication failed` | Check DB_USER and DB_PASSWORD in `.env` |
| `database "todoapp" does not exist` | Run `CREATE DATABASE todoapp;` in psql |
| `relation "users" does not exist` | Run `psql -U postgres -d todoapp -f backend/db/schema.sql` |
| CORS error in browser | Make sure the backend CORS origin matches `http://localhost:3000` |
| `JWT_SECRET` error | Make sure your `.env` file exists and has a JWT_SECRET value |

---

## 📡 API Reference

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns token |
| GET | `/api/todos` | Yes | Get all my todos |
| POST | `/api/todos` | Yes | Create a todo |
| PUT | `/api/todos/:id` | Yes | Update a todo |
| DELETE | `/api/todos/:id` | Yes | Delete a todo |
