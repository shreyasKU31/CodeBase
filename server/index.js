require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');
const webhookRoutes = require('./routes/webhooks');
const { createClerkSupabaseClient } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection using default client
    const supabase = createClerkSupabaseClient();
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return res.status(500).json({ 
        status: 'ERROR', 
        message: 'Database connection failed',
        error: error.message,
        code: error.code
      });
    }
    
    res.json({ 
      status: 'OK', 
      message: 'DevHance API is running',
      database: 'Connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// Database schema check endpoint
app.get('/api/check-schema', async (req, res) => {
  try {
    const supabase = createClerkSupabaseClient();
    const tables = ['users', 'projects', 'project_likes', 'project_comments'];
    const results = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        results[table] = error ? { exists: false, error: error.message } : { exists: true, count: data?.length || 0 };
      } catch (err) {
        results[table] = { exists: false, error: err.message };
      }
    }
    
    res.json({
      status: 'SCHEMA_CHECK',
      tables: results,
      message: 'Database schema check completed'
    });
  } catch (error) {
    console.error('Schema check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Schema check failed',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
