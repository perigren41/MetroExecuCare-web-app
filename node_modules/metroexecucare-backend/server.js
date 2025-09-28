  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const rateLimit = require('express-rate-limit');
  const path = require('path');
  require('dotenv').config();

  

  // Import database connection
  const { testConnection } = require('./config/database/connection');

  const app = express();

  // Security middleware
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    }
  });

  // Apply rate limiting only to API routes
  app.use('/api/', limiter);

  // CORS configuration
  const corsOptions = {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://localhost:3007',
      'http://localhost:3008',
      'http://localhost:3009',
      'http://localhost:3010'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Static file serving for uploads
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'MetroExecuCare API Server',
      version: '1.0.0',
      documentation: '/api/health'
    });
  });



  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'MetroExecuCare API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'Connected'
    });
  });

  // Test database endpoint
  app.get('/api/db-test', async (req, res) => {
    try {
      const isConnected = await testConnection();
      res.status(200).json({
        success: true,
        message: 'Database connection test',
        connected: isConnected
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message
      });
    }
  });

  // Database verification endpoint
  app.get('/api/db-verify', async (req, res) => {
    try {
      const { executeQuery } = require('./config/database/connection');
      
      // Check if all tables exist
      const tablesQuery = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? 
        ORDER BY TABLE_NAME
      `;
      const tables = await executeQuery(tablesQuery, [process.env.DB_NAME]);
      
      // Get row counts for initial data tables
      const systemSettingsCount = await executeQuery('SELECT COUNT(*) as count FROM system_settings');
      const hospitalsCount = await executeQuery('SELECT COUNT(*) as count FROM hospitals');
      const faqsCount = await executeQuery('SELECT COUNT(*) as count FROM faqs');
      
      // Expected tables
      const expectedTables = [
        'activity_logs', 'checkup_requests', 'faqs', 'hospitals',
        'notifications', 'request_approvals', 'request_assignments',
        'request_files', 'system_settings', 'users'
      ];
      
      const existingTables = tables.map(t => t.TABLE_NAME);
      const missingTables = expectedTables.filter(table => !existingTables.includes(table));
      
      res.status(200).json({
        success: true,
        message: 'Database verification results',
        database: process.env.DB_NAME,
        tables: {
          expected: expectedTables.length,
          existing: existingTables.length,
          list: existingTables,
          missing: missingTables
        },
        initialData: {
          systemSettings: systemSettingsCount[0].count,
          hospitals: hospitalsCount[0].count,
          faqs: faqsCount[0].count
        },
        status: missingTables.length === 0 ? 'Complete' : 'Incomplete'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Database verification failed',
        error: error.message
      });
    }
  });

  // Import routes
  const authRoutes = require('./routes/authRoutes');
  const userRoutes = require('./routes/userRoutes');
  const requestRoutes = require('./routes/requestRoutes');
  const emailRoutes = require('./routes/emailRoutes');
  const hospitalRoutes = require('./routes/hospitalRoutes');
  const testRoutes = require('./routes/testRoutes');

  // Use routes
  app.use('/api/users', userRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/email', emailRoutes);
  app.use('/api/hospitals', hospitalRoutes);
  app.use('/api/test', testRoutes);

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Global error handler middleware
  app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  });

  // 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'PUT /api/auth/profile',
      'PUT /api/auth/change-password',
      'POST /api/auth/refresh',
      'POST /api/auth/logout',
      'GET /api/users',
      'GET /api/users/:id',
      'PUT /api/users/:id',
      'PUT /api/users/:id/status',
      'DELETE /api/users/:id',
      'POST /api/users/profile/picture',
      'DELETE /api/users/profile/picture'
    ]
  });
});

  const PORT = process.env.PORT || 5000;

  // Initialize database connection and start server
  async function startServer() {
    try {
      console.log('🔄 Starting MetroExecuCare Server...');
      
      // Test database connection
      console.log('🔍 Testing database connection...');
      const isConnected = await testConnection();
      
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      
      // Start server
      app.listen(PORT, () => {
        console.log(`🚀 MetroExecuCare API Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/`);
        console.log(`👥 User endpoints: http://localhost:${PORT}/api/users/`);
      });
      
    } catch (error) {
      console.error('\n❌ Failed to start server:');
      console.error(`   Error: ${error.message}`);
      console.error('\n💡 Troubleshooting tips:');
      console.error('   • Check your .env file configuration');
      console.error('   • Ensure MySQL server is running');
      console.error('   • Verify database credentials');
      console.error('   • Check if database exists\n');
    }
  }

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
    const { closePool } = require('./config/database/connection');
    await closePool();
  });

  process.on('SIGINT', async () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    const { closePool } = require('./config/database/connection');
    await closePool();
  });

  // Start the server
  startServer();