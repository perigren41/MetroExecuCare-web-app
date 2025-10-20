const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentUsers
} = require('../controllers/departmentController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Public routes (all authenticated users)
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.get('/:id/users', getDepartmentUsers);

// Admin-only routes
router.post('/', requireAdmin, createDepartment);
router.put('/:id', requireAdmin, updateDepartment);
router.delete('/:id', requireAdmin, deleteDepartment);

module.exports = router;