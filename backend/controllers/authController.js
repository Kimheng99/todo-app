// controllers/authController.js
// Controllers contain the actual business logic for each route.
// Think of them as the "brain" behind each API endpoint.

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ─────────────────────────────────────────────
// REGISTER
// POST /api/auth/register
// ─────────────────────────────────────────────
// What it does:
// 1. Receives name, email, password from the request body
// 2. Checks if the email is already used
// 3. Hashes the password with bcrypt (NEVER store plain-text passwords!)
// 4. Saves the new user to the database
// 5. Returns a JWT token so the user is immediately logged in

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation — make sure all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if a user with this email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password
    // bcrypt.hash(password, saltRounds)
    // saltRounds = 10 means bcrypt will run its hashing algorithm 2^10 = 1024 times.
    // This makes it slow enough that brute-force attacks are impractical.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, created_at`,
      [name, email.toLowerCase(), hashedPassword]
    );

    const newUser = result.rows[0];

    // Create a JWT token
    // jwt.sign(payload, secret, options)
    // The payload is the data we embed in the token — we store the user's id and email.
    // The secret is our private key used to sign the token. Anyone with this secret can
    // verify the token, so keep it safe!
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────────
// What it does:
// 1. Receives email and password
// 2. Looks up the user by email
// 3. Compares the submitted password against the stored hash using bcrypt.compare()
// 4. If they match, returns a JWT token

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    // If no user found — we say "invalid credentials" rather than "email not found"
    // This is a security best practice: don't tell attackers which part was wrong
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare the submitted password with the stored hash
    // bcrypt.compare() hashes the submitted password the same way and checks if they match
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

module.exports = { register, login };
