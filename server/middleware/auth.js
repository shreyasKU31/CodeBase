require('dotenv').config();

const { verifyToken } = require('@clerk/backend');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    if (!process.env.CLERK_JWT_KEY || !process.env.CLERK_ISSUER_URL) {
      console.warn('⚠️  Missing Clerk environment variables. Please set CLERK_JWT_KEY and CLERK_ISSUER_URL in your .env file.');
      return res.status(500).json({ message: 'Authentication service not configured' });
    }

    const payload = await verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY,
      issuer: process.env.CLERK_ISSUER_URL
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username || payload.email?.split('@')[0]
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth; 