const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generate access token
 * @param {object} payload - User data to include in token
 * @returns {string} - JWT access token
 */
const generateAccessToken = (payload) => {
  try {
    const accessToken = jwt.sign(
      {
        id: payload.id,
        employee_id: payload.employee_id,
        email: payload.email,
        role: payload.role,
        first_name: payload.first_name,
        last_name: payload.last_name,
        department: payload.department,
        position: payload.position
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
        issuer: 'MetroExecuCare',
        audience: 'MetroExecuCare-Users'
      }
    );
    return accessToken;
  } catch (error) {
    throw new Error('Error generating access token: ' + error.message);
  }
};

/**
 * Generate refresh token
 * @param {object} payload - User data to include in token
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const refreshToken = jwt.sign(
      {
        id: payload.id,
        employee_id: payload.employee_id,
        email: payload.email,
        tokenType: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
        issuer: 'MetroExecuCare',
        audience: 'MetroExecuCare-Refresh'
      }
    );
    return refreshToken;
  } catch (error) {
    throw new Error('Error generating refresh token: ' + error.message);
  }
};

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {object} - Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'MetroExecuCare',
      audience: 'MetroExecuCare-Users'
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Access token not active');
    }
    throw new Error('Token verification failed: ' + error.message);
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'MetroExecuCare',
      audience: 'MetroExecuCare-Refresh'
    });
    
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw new Error('Refresh token verification failed: ' + error.message);
  }
};

/**
 * Extract user data from token without verification (for expired tokens)
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload (without verification)
 */
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    throw new Error('Error decoding token: ' + error.message);
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date} - Expiration date
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token or missing expiration');
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    throw new Error('Error getting token expiration: ' + error.message);
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    return Date.now() >= expiration.getTime();
  } catch (error) {
    return true; // Consider invalid tokens as expired
  }
};

/**
 * Generate both access and refresh tokens
 * @param {object} payload - User data
 * @returns {object} - Object containing both tokens
 */
const generateTokenPair = (payload) => {
  try {
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload)
    };
  } catch (error) {
    throw new Error('Error generating token pair: ' + error.message);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  generateTokenPair
};