// routes/auth.js
// This file defines the URL paths for authentication.
// It maps HTTP methods + paths to controller functions.

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register  →  calls the register function
router.post('/register', register);

// POST /api/auth/login  →  calls the login function
router.post('/login', login);

module.exports = router;
