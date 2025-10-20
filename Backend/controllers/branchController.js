const { pool } = require('../config/database/connection');

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const { is_active, city } = req.query;

    let query = `
      SELECT
        b.id,
        b.name,
        b.code,
        b.address,
        b.city,
        b.region,
        b.contact_number,
        b.email,
        b.is_active,
        b.created_at,
        b.updated_at,
        COUNT(u.id) as user_count
      FROM branches b
      LEFT JOIN users u ON u.branch_id = b.id
    `;

    const params = [];
    const conditions = [];

    if (is_active !== undefined) {
      conditions.push('b.is_active = ?');
      params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
    }

    if (city) {
      conditions.push('b.city = ?');
      params.push(city);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY b.id, b.name, b.code, b.address, b.city, b.region, b.contact_number, b.email, b.is_active, b.created_at, b.updated_at';
    query += ' ORDER BY b.name ASC';

    const [branches] = await pool.execute(query, params);

    res.status(200).json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branches'
    });
  }
};

// Get branch by ID
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const [branches] = await pool.execute(
      `SELECT
        b.id,
        b.name,
        b.code,
        b.address,
        b.city,
        b.region,
        b.contact_number,
        b.email,
        b.is_active,
        b.created_at,
        b.updated_at,
        COUNT(u.id) as user_count
      FROM branches b
      LEFT JOIN users u ON u.branch_id = b.id
      WHERE b.id = ?
      GROUP BY b.id, b.name, b.code, b.address, b.city, b.region, b.contact_number, b.email, b.is_active, b.created_at, b.updated_at`,
      [id]
    );

    if (branches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: branches[0]
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branch'
    });
  }
};

// Create new branch
const createBranch = async (req, res) => {
  try {
    const { name, code, address, city, region, contact_number, email, is_active } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Branch name is required (minimum 2 characters)'
      });
    }

    // Check for duplicate name
    const [existingName] = await pool.execute(
      'SELECT id FROM branches WHERE name = ?',
      [name.trim()]
    );

    if (existingName.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Branch with this name already exists'
      });
    }

    // Check for duplicate code (if provided)
    if (code && code.trim().length > 0) {
      const [existingCode] = await pool.execute(
        'SELECT id FROM branches WHERE code = ?',
        [code.trim()]
      );

      if (existingCode.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Branch with this code already exists'
        });
      }
    }

    // Create branch
    const [result] = await pool.execute(
      `INSERT INTO branches (name, code, address, city, region, contact_number, email, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        code?.trim() || null,
        address?.trim() || null,
        city?.trim() || null,
        region?.trim() || null,
        contact_number?.trim() || null,
        email?.trim() || null,
        is_active !== false ? 1 : 0
      ]
    );

    // Fetch created branch
    const [newBranch] = await pool.execute(
      'SELECT * FROM branches WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: newBranch[0]
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create branch'
    });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, city, region, contact_number, email, is_active } = req.body;

    // Check if branch exists
    const [existing] = await pool.execute(
      'SELECT id FROM branches WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    // Validation
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Branch name must be at least 2 characters'
      });
    }

    // Check for duplicate name (excluding current branch)
    if (name) {
      const [duplicate] = await pool.execute(
        'SELECT id FROM branches WHERE name = ? AND id != ?',
        [name.trim(), id]
      );

      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Branch with this name already exists'
        });
      }
    }

    // Check for duplicate code (excluding current branch)
    if (code) {
      const [duplicateCode] = await pool.execute(
        'SELECT id FROM branches WHERE code = ? AND id != ?',
        [code.trim(), id]
      );

      if (duplicateCode.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Branch with this code already exists'
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
    if (code !== undefined) {
      updates.push('code = ?');
      params.push(code?.trim() || null);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address?.trim() || null);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      params.push(city?.trim() || null);
    }
    if (region !== undefined) {
      updates.push('region = ?');
      params.push(region?.trim() || null);
    }
    if (contact_number !== undefined) {
      updates.push('contact_number = ?');
      params.push(contact_number?.trim() || null);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email?.trim() || null);
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
      `UPDATE branches SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Fetch updated branch
    const [updated] = await pool.execute(
      'SELECT * FROM branches WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update branch'
    });
  }
};

// Delete branch (soft delete)
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if branch exists
    const [existing] = await pool.execute(
      'SELECT id, name FROM branches WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    // Check if branch has users
    const [users] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE branch_id = ?',
      [id]
    );

    if (users[0].count > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete branch. ${users[0].count} user(s) are assigned to this branch.`,
        user_count: users[0].count
      });
    }

    // Soft delete (set is_active = false)
    await pool.execute(
      'UPDATE branches SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Branch deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete branch'
    });
  }
};

// Get users in a branch
const getBranchUsers = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if branch exists
    const [branch] = await pool.execute(
      'SELECT id, name FROM branches WHERE id = ?',
      [id]
    );

    if (branch.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
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
        d.name as department_name,
        u.is_active
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.branch_id = ?
      ORDER BY u.last_name, u.first_name`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        branch: branch[0],
        users: users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching branch users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branch users'
    });
  }
};

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchUsers
};