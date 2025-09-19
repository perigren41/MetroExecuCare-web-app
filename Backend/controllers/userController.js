const { pool } = require('../config/database/connection');
const bcrypt = require('bcryptjs');

// GET /api/users - List users (admin only)
const getUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin role required.' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    // Build query with filters
    let query = `
      SELECT 
        id, employee_id, email, first_name, last_name, middle_name, role, 
        department, position, branch, contact_number, is_active,
        created_at, updated_at 
      FROM users 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    let queryParams = [];
    let countParams = [];

    // Add search filter
    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }

    // Add role filter
    if (role) {
      query += ` AND role = ?`;
      countQuery += ` AND role = ?`;
      queryParams.push(role);
      countParams.push(role);
    }

    // Add status filter
    if (status) {
      query += ` AND is_active = ?`;
      countQuery += ` AND is_active = ?`;
      queryParams.push(status === 'active' ? 1 : 0);
      countParams.push(status === 'active' ? 1 : 0);
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    // Execute queries
    const [users] = await pool.execute(query, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// GET /api/users/:id - Get specific user
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin or accessing their own profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. You can only access your own profile.' 
      });
    }

    const [users] = await pool.execute(
      `SELECT 
        id, employee_id, email, first_name, last_name, middle_name, role, 
        department, position, branch, contact_number, is_active,
        created_at, updated_at 
      FROM users 
      WHERE id = ?`,
      [id]
    );

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
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// PUT /api/users/:id - Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      first_name, 
      last_name, 
      email, 
      role, 
      department, 
      position, 
      contact_number 
    } = req.body;

    // Check if user is admin or updating their own profile (limited fields)
    const isAdmin = req.user.role === 'admin';
    const isOwnProfile = req.user.id === parseInt(id);

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied.' 
      });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute('SELECT id, email FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'First name, last name, and email are required' 
      });
    }

    // Check if email is already taken by another user
    if (email !== existingUsers[0].email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?', 
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Email already exists' 
        });
      }
    }

    // Build update query based on user permissions
    let updateFields = [];
    let updateValues = [];

    // Fields all users can update
    updateFields.push('first_name = ?', 'last_name = ?', 'email = ?');
    updateValues.push(first_name, last_name, email);

    if (department !== undefined) {
      updateFields.push('department = ?');
      updateValues.push(department);
    }
    if (position !== undefined) {
      updateFields.push('position = ?');
      updateValues.push(position);
    }
    if (contact_number !== undefined) {
      updateFields.push('contact_number = ?');
      updateValues.push(contact_number);
    }

    // Admin-only fields
    if (isAdmin && role !== undefined) {
      const validRoles = ['executive', 'hr_personnel', 'benefits_officer', 'welfare_head', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid role specified' 
        });
      }
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(query, updateValues);

    // Get updated user data
    const [updatedUsers] = await pool.execute(
      `SELECT 
        id, employee_id, email, first_name, last_name, middle_name, role, 
        department, position, branch, contact_number, is_active,
        created_at, updated_at 
      FROM users 
      WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUsers[0] }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// PUT /api/users/:id/status - Activate/deactivate user
const updateUserStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin role required.' 
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid status is required (active, inactive, suspended)' 
      });
    }

    // Check if user exists
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id && status !== 'active') {
      return res.status(400).json({ 
        success: false,
        error: 'You cannot deactivate your own account' 
      });
    }

    // Update user status
    await pool.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status === 'active' ? 1 : 0, id]
    );

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : status === 'inactive' ? 'deactivated' : 'suspended'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// DELETE /api/users/:id - Soft delete user
const deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin role required.' 
      });
    }

    const { id } = req.params;

    // Check if user exists
    const [users] = await pool.execute('SELECT id, email FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        success: false,
        error: 'You cannot delete your own account' 
      });
    }

    // Soft delete: update is_active to 0 and modify email to prevent conflicts
    const deletedEmail = `deleted_${Date.now()}_${users[0].email}`;
    await pool.execute(
      'UPDATE users SET is_active = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [0, deletedEmail, id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// CRITICAL: Make sure this export is at the bottom and correctly structured
module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser
};