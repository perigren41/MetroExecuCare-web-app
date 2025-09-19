const express = require('express');
const router = express.Router();

// Import controllers
const {
  createRequest,
  getRequests,
  getRequestById
} = require('../controllers/requestController');

const {
  assignRequest,
  claimRequest,
  processRequest,
  approveRequest,
  rejectRequest,
  getDashboardStats
} = require('../controllers/requestWorkflowController');

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// Import validators
const {
  validateCreateRequest,
  validateRequestId,
  validateRequestQuery,
  validateHRProcessing,
  validateRequestStatusUpdate
} = require('../validators/requestValidators');

// Apply authentication to all routes
router.use(authenticateToken);

// Request CRUD Routes
// POST /api/requests - Create new request (Executives only)
router.post('/', validateCreateRequest, createRequest);

// GET /api/requests - List requests with filtering and pagination
router.get('/', validateRequestQuery, getRequests);

// GET /api/requests/dashboard - Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// GET /api/requests/:id - Get specific request details
router.get('/:id', validateRequestId, getRequestById);

// Request Workflow Routes
// POST /api/requests/:id/assign - Assign request to HR personnel (admin/benefits/welfare only)
router.post('/:id/assign', validateRequestId, assignRequest);

// POST /api/requests/:id/claim - Claim unassigned request (HR personnel only)
router.post('/:id/claim', validateRequestId, claimRequest);

// POST /api/requests/:id/process - Process request (HR personnel only)
router.post('/:id/process', validateRequestId, validateHRProcessing, processRequest);

// POST /api/requests/:id/approve - Approve request at current stage
router.post('/:id/approve', validateRequestId, validateRequestStatusUpdate, approveRequest);

// POST /api/requests/:id/reject - Reject request
router.post('/:id/reject', validateRequestId, validateRequestStatusUpdate, rejectRequest);

module.exports = router;