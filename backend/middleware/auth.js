// middleware/auth.js
// This is our "security guard" middleware.
// It runs BEFORE protected route handlers to verify the user is logged in.
//
// How it works:
// 1. The frontend sends a JWT token in the request header: Authorization: Bearer <token>
// 2. This middleware extracts that token
// 3. It verifies the token is valid and hasn't been tampered with
// 4. If valid, it attaches the user's info (id, email) to req.user
// 5. The next route handler can then use req.user.id to know WHO is making the request

const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  // Get the Authorization header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers['authorization'];

  // Extract just the token part (after "Bearer ")
  const token = authHeader && authHeader.split(' ')[1];

  // If no token was provided, deny access
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Verify the token using our secret key
  // If the token was tampered with or expired, jwt.verify() will throw an error
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to the request object
    // Now any route handler that runs after this can access req.user
    req.user = decoded;

    next(); // Move on to the actual route handler
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;
