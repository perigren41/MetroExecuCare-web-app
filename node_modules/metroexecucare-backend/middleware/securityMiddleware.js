const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000', // React development server
      'http://localhost:3001', // Alternative React port
      'https://metroexecucare.com', // Production domain
      'https://www.metroexecucare.com', // Production www domain
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      // In development, allow all localhost origins
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200, // Support legacy browsers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-Client-Version'
  ]
};

/**
 * Helmet security configuration
 */
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.metroexecucare.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for file uploads
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
};

/**
 * General rate limiting
 */
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Strict rate limiting for sensitive endpoints
 */
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many sensitive requests, please try again later',
    error: 'STRICT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * File upload rate limiting
 */
const uploadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 uploads per windowMs
  message: {
    success: false,
    message: 'Too many file uploads, please try again later',
    error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Input sanitization middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Input sanitization error:', error.message);
    res.status(400).json({
      success: false,
      message: 'Invalid input data',
      error: 'INPUT_SANITIZATION_ERROR'
    });
  }
};

/**
 * Sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return obj
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol (except for specific cases)
      .slice(0, 1000); // Limit string length
  }
  
  if (typeof obj === 'number') {
    // Prevent extremely large numbers that could cause issues
    if (obj > Number.MAX_SAFE_INTEGER || obj < Number.MIN_SAFE_INTEGER) {
      return 0;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.slice(0, 100).map(sanitizeObject); // Limit array size and sanitize elements
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    let keyCount = 0;
    
    for (const key in obj) {
      if (keyCount >= 50) break; // Limit number of object keys
      
      if (obj.hasOwnProperty(key)) {
        const sanitizedKey = key.replace(/[<>]/g, '').slice(0, 100);
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
        keyCount++;
      }
    }
    
    return sanitized;
  }
  
  return obj;
};

/**
 * Request logging middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  req.requestId = requestId;
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${requestId} ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')?.slice(0, 100)}`);
  
  // Log sensitive operations
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.path.includes('/api/')) {
    console.log(`[${requestId}] ${req.method} ${req.path} - Body keys: ${Object.keys(req.body || {}).join(', ')}`);
  }
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    console.log(`[${requestId}] Response ${statusCode} - ${duration}ms`);
    
    // Log errors
    if (statusCode >= 400) {
      console.error(`[${requestId}] Error Response:`, {
        status: statusCode,
        error: data.error,
        message: data.message
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[${req.requestId || 'unknown'}] Unhandled error:`, err);
  
  // Handle specific error types
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large',
      error: 'FILE_TOO_LARGE'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field',
      error: 'UNEXPECTED_FILE'
    });
  }
  
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      error: 'CORS_ERROR'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_ERROR',
    requestId: req.requestId
  });
};

/**
 * Security headers middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-API-Version', process.env.API_VERSION || '1.0.0');
  
  // Prevent caching of sensitive endpoints
  if (req.path.includes('/api/auth/') || req.path.includes('/api/admin/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
  
  next();
};

module.exports = {
  corsOptions,
  helmetOptions,
  generalRateLimit,
  strictRateLimit,
  uploadRateLimit,
  sanitizeInput,
  requestLogger,
  errorHandler,
  securityHeaders,
  helmet: helmet(helmetOptions),
  cors: cors(corsOptions)
};