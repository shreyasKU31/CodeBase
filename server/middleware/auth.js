// backend/middleware/auth.js

require("dotenv").config();
const { verifyToken } = require('@clerk/backend');

/**
 * Secure authentication middleware for Clerk.
 * Verifies the JWT from the Authorization header to protect routes.
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Use the simpler Clerk verification method
    const payload = await verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY
    });

    // Attach the user's ID to the request object
    req.user = { 
      id: payload.sub, // 'sub' is the standard JWT claim for user ID
      email: payload.email,
      username: payload.username
    };
    
    // Attach the Clerk token for Supabase integration
    req.clerkToken = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
