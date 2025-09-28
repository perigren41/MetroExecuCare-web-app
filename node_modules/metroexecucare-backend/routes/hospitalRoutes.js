const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getHospitals,
  searchHospitals,
  createHospital,
  getHospitalById
} = require('../controllers/hospitalController');

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/hospitals - Get all hospitals (with filters)
router.get('/', getHospitals);

// GET /api/hospitals/search - Search hospitals by name/city
router.get('/search', searchHospitals);

// GET /api/hospitals/:id - Get specific hospital
router.get('/:id', getHospitalById);

// POST /api/hospitals - Create new hospital (for non-accredited registrations)
router.post('/', createHospital);

module.exports = router;