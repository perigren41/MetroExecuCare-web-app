const express = require('express');
const router = express.Router();
const {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchUsers
} = require('../controllers/branchController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Public routes (all authenticated users)
router.get('/', getAllBranches);
router.get('/:id', getBranchById);
router.get('/:id/users', getBranchUsers);

// Admin-only routes
router.post('/', requireAdmin, createBranch);
router.put('/:id', requireAdmin, updateBranch);
router.delete('/:id', requireAdmin, deleteBranch);

module.exports = router;