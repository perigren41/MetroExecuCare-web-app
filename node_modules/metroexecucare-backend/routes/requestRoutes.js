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
  getDashboardStats,
  getPendingApprovals
} = require('../controllers/requestWorkflowController');

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadRequestFile } = require('../middleware/uploadMiddleware');

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

// GET /api/requests/pending-approvals - Get pending approvals by role
router.get('/pending-approvals', getPendingApprovals);

// GET /api/requests/:id - Get specific request details
router.get('/:id', validateRequestId, getRequestById);

// POST /api/requests/:id/upload-file - Upload file for specific request
router.post('/:id/upload-file', validateRequestId, uploadRequestFile, require('../controllers/requestController').uploadRequestFileHandler);

// GET /api/requests/:id/files/:fileId/download - Download specific file
router.get('/:id/files/:fileId/download', validateRequestId, require('../controllers/requestController').downloadRequestFile);

// GET /api/requests/:id/download-latest-file - Download latest approved file (Welfare Head file)
router.get('/:id/download-latest-file', validateRequestId, require('../controllers/requestController').downloadLatestFile);

// GET /api/requests/:id/download-executive-file - Download executive original file
router.get('/:id/download-executive-file', validateRequestId, require('../controllers/requestController').downloadExecutiveFile);

// DELETE /api/requests/:id/files/:fileId - Delete specific file
router.delete('/:id/files/:fileId', validateRequestId, require('../controllers/requestController').deleteRequestFile);

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