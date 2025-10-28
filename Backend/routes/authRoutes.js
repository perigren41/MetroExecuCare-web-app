const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database/connection');
require('dotenv').config();
const { authenticateToken } = require('../middleware/authMiddleware');
const { logActivity, ACTIVITY_TYPES } = require('../utils/activityLogger');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} = require('../validators/authValidators');

// POST /api/auth/register - Requires authentication (admin creates users)
router.post('/register', authenticateToken, validateRegister, async (req, res) => {
  try {

    if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in environment variables');
  process.exit(1);
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    console.error('❌ JWT_REFRESH_SECRET is not defined in environment variables');
    process.exit(1);
  }

    console.log('Registration request body:', req.body);

    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Add this line

    const {
      employee_id,
      email,
      password,
      first_name,
      last_name,
      middle_name,
      role,
      department,
      department_id,
      position,
      branch,
      branch_id,
      contact_number,
      birth_date
    } = req.body;

    // Handle both department_id/branch_id and department/branch (frontend sends _id versions)
    const finalDepartment = department_id || department || null;
    const finalBranch = branch_id || branch || null;

    console.log('Destructured role:', role);

    // Check if user already exists
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Convert birth_date to MySQL format
    const mysqlBirthDate = birth_date ? new Date(birth_date).toISOString().split('T')[0] : null;

    console.log('Birth date conversion:', { birth_date, mysqlBirthDate });

    // Insert new user - CORRECTED to match your database schema
    // Convert all undefined values to null to prevent SQL errors
    const insertParams = [
      employee_id,
      email,
      hashedPassword,
      first_name,
      last_name,
      middle_name,
      role,
      finalDepartment,
      position,
      finalBranch,
      contact_number,
      mysqlBirthDate
    ].map(val => val === undefined ? null : val);

    console.log('Insert parameters:', insertParams);

    const [result] = await pool.execute(
      `INSERT INTO users (employee_id, email, password_hash, first_name, last_name, middle_name, role, department, position, branch, contact_number, birth_date, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      insertParams
    );

    // Verify required data for JWT
    const userId = result.insertId;
    if (!userId) {
      throw new Error('Failed to create user - no user ID returned');
    }
    if (!email) {
      throw new Error('Email is required for JWT token');
    }
    if (!role) {
      throw new Error('Role is required for JWT token');
    }

    console.log('Creating JWT with:', { id: userId, email, role });

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: email, role: role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    // Log user creation activity
    await logActivity({
      userId: req.user.id, // The admin who created the user
      action: ACTIVITY_TYPES.CREATE_USER,
      description: `Created new user ${employee_id} (${first_name} ${last_name}) with role ${role}`,
      newValues: {
        userId: userId,
        employee_id,
        email,
        first_name,
        last_name,
        role,
        department: finalDepartment,
        position,
        branch: finalBranch
      }
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          employee_id,
          email,
          first_name,
          last_name,
          middle_name: middle_name || null,
          role,
          department: finalDepartment,
          position,
          branch: finalBranch,
          contact_number,
          birth_date: mysqlBirthDate
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/auth/login - CORRECTED VERSION
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email - CORRECTED column names
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is active - CORRECTED to use is_active
    if (user.is_active !== 1) {
      return res.status(401).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Verify password - CORRECTED to use password_hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          employee_id: user.employee_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name,
          role: user.role,
          department: user.department,
          position: user.position,
          contact_number: user.contact_number
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/auth/profile - CORRECTED VERSION
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Profile request - User from token:', req.user);
    const [users] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, middle_name, role, department, position, branch, contact_number, profile_picture, is_active, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );
    console.log('Profile query result:', users);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: users[0] }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/auth/profile - CORRECTED VERSION
router.put('/profile', authenticateToken, validateUpdateProfile, async (req, res) => {
  try {
    const { first_name, last_name, middle_name, email, department, position, branch, contact_number } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // Update user - CORRECTED column names
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, middle_name = ?, email = ?, department = ?, position = ?, branch = ?, contact_number = ?, updated_at = NOW() WHERE id = ?',
      [first_name, last_name, middle_name, email, department, position, branch, contact_number, req.user.id]
    );

    // Get updated user data - CORRECTED column names
    const [users] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, middle_name, role, department, position, branch, contact_number, is_active, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: users[0] }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/auth/change-password - CORRECTED VERSION
router.put('/change-password', authenticateToken, validateChangePassword, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Get current user - CORRECTED to use password_hash
    const [users] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password - CORRECTED to use password_hash
    const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 12);

    // Update password - CORRECTED to use password_hash
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user data
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    const user = users[0];

    // Generate new access token
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a production app, you would blacklist the token here
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;