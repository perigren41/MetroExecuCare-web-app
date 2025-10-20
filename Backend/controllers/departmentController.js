const { pool } = require('../config/database/connection');

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const { is_active } = req.query;

    let query = `
      SELECT
        d.id,
        d.name,
        d.description,
        d.is_active,
        d.created_at,
        d.updated_at,
        COUNT(u.id) as user_count
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.id
    `;

    const params = [];

    if (is_active !== undefined) {
      query += ' WHERE d.is_active = ?';
      params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
    }

    query += ' GROUP BY d.id, d.name, d.description, d.is_active, d.created_at, d.updated_at';
    query += ' ORDER BY d.name ASC';

    const [departments] = await pool.execute(query, params);

    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments'
    });
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [departments] = await pool.execute(
      `SELECT
        d.id,
        d.name,
        d.description,
        d.is_active,
        d.created_at,
        d.updated_at,
        COUNT(u.id) as user_count
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.id
      WHERE d.id = ?
      GROUP BY d.id, d.name, d.description, d.is_active, d.created_at, d.updated_at`,
      [id]
    );

    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: departments[0]
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department'
    });
  }
};

// Create new department
const createDepartment = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Department name is required (minimum 2 characters)'
      });
    }

    // Check for duplicate
    const [existing] = await pool.execute(
      'SELECT id FROM departments WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Department with this name already exists'
      });
    }

    // Create department
    const [result] = await pool.execute(
      `INSERT INTO departments (name, description, is_active)
       VALUES (?, ?, ?)`,
      [name.trim(), description || null, is_active !== false ? 1 : 0]
    );

    // Fetch created department
    const [newDepartment] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: newDepartment[0]
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create department'
    });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    // Check if department exists
    const [existing] = await pool.execute(
      'SELECT id FROM departments WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Validation
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Department name must be at least 2 characters'
      });
    }

    // Check for duplicate name (excluding current department)
    if (name) {
      const [duplicate] = await pool.execute(
        'SELECT id FROM departments WHERE name = ? AND id != ?',
        [name.trim(), id]
      );

      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Department with this name already exists'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description || null);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    params.push(id);

    await pool.execute(
      `UPDATE departments SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Fetch updated department
    const [updated] = await pool.execute(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update department'
    });
  }
};

// Delete department (soft delete)
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const [existing] = await pool.execute(
      'SELECT id, name FROM departments WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Check if department has users
    const [users] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE department_id = ?',
      [id]
    );

    if (users[0].count > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete department. ${users[0].count} user(s) are assigned to this department.`,
        user_count: users[0].count
      });
    }

    // Soft delete (set is_active = false)
    await pool.execute(
      'UPDATE departments SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete department'
    });
  }
};

// Get users in a department
const getDepartmentUsers = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const [department] = await pool.execute(
      'SELECT id, name FROM departments WHERE id = ?',
      [id]
    );

    if (department.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Get users
    const [users] = await pool.execute(
      `SELECT
        u.id,
        u.employee_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.position,
        b.name as branch_name,
        u.is_active
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.department_id = ?
      ORDER BY u.last_name, u.first_name`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        department: department[0],
        users: users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching department users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department users'
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentUsers
};