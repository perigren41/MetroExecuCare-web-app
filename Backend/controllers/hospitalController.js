const { pool } = require('../config/database/connection');

// Get hospitals with optional filters
const getHospitals = async (req, res) => {
  try {
    const { accredited, active = '1' } = req.query;

    let query = `
      SELECT id, name, address, city, contact_number, email, is_accredited, is_active
      FROM hospitals
      WHERE is_active = ?
    `;

    let queryParams = [active];

    // Filter by accreditation status if specified
    if (accredited !== undefined) {
      query += ' AND is_accredited = ?';
      queryParams.push(accredited === 'true' ? 1 : 0);
    }

    query += ' ORDER BY name ASC';

    const [hospitals] = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospitals'
    });
  }
};

// Search hospitals by name or city
const searchHospitals = async (req, res) => {
  try {
    const { q, accredited } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    let query = `
      SELECT id, name, address, city, contact_number, email, is_accredited, is_active
      FROM hospitals
      WHERE is_active = 1
        AND (name LIKE ? OR city LIKE ?)
    `;

    let queryParams = [`%${q.trim()}%`, `%${q.trim()}%`];

    // Filter by accreditation if specified
    if (accredited !== undefined) {
      query += ' AND is_accredited = ?';
      queryParams.push(accredited === 'true' ? 1 : 0);
    }

    query += ' ORDER BY name ASC LIMIT 10';

    const [hospitals] = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('Search hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search hospitals'
    });
  }
};

// Get specific hospital by ID
const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    const [hospitals] = await pool.query(
      'SELECT * FROM hospitals WHERE id = ? AND is_active = 1',
      [id]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospitals[0]
    });
  } catch (error) {
    console.error('Get hospital by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospital'
    });
  }
};

// Create new hospital (for non-accredited registrations)
const createHospital = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      contact_number,
      email,
      reason_of_request
    } = req.body;

    // Validate required fields
    if (!name || !address || !city || !reason_of_request) {
      return res.status(400).json({
        success: false,
        error: 'Hospital name, address, city, and reason of request are required'
      });
    }

    // Check for potential duplicates (same name and city)
    const [existingHospitals] = await pool.query(
      'SELECT id, name, city, address FROM hospitals WHERE LOWER(name) = LOWER(?) AND LOWER(city) = LOWER(?)',
      [name.trim(), city.trim()]
    );

    if (existingHospitals.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'A hospital with similar name and city already exists',
        existing_hospitals: existingHospitals
      });
    }

    // Insert new hospital as non-accredited
    const [result] = await pool.query(`
      INSERT INTO hospitals (name, address, city, contact_number, email, is_accredited, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 0, 1, NOW())
    `, [
      name.trim(),
      address.trim(),
      city.trim(),
      contact_number?.trim() || null,
      email?.trim() || null
    ]);

    // Get the created hospital
    const [newHospital] = await pool.query(
      'SELECT * FROM hospitals WHERE id = ?',
      [result.insertId]
    );

    console.log(`New non-accredited hospital registered: ${name} in ${city} (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      data: newHospital[0]
    });

  } catch (error) {
    console.error('Create hospital error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register hospital'
    });
  }
};

module.exports = {
  getHospitals,
  searchHospitals,
  createHospital,
  getHospitalById
};