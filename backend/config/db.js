// config/db.js
// This file sets up our connection to PostgreSQL.
// We use the 'pg' library (node-postgres) to talk to the database.
// The Pool class manages a "pool" of reusable connections — 
// instead of opening a new connection for every query, it reuses them,
// which is much faster for a web server handling many requests.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release(); // Release the test connection back to the pool
  }
});

module.exports = pool;
