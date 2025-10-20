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
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Public routes (all authenticated users)
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.get('/:id/users', getDepartmentUsers);

// Admin-only routes
router.post('/', authorizeRoles('admin'), createDepartment);
router.put('/:id', authorizeRoles('admin'), updateDepartment);
router.delete('/:id', authorizeRoles('admin'), deleteDepartment);

module.exports = router;