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
  getPendingApprovals,
  getUserActionStats,
  getUserActionLogs
} = require('../controllers/requestWorkflowController');

const {
  checkActiveRequest,
  editRequest,
  deleteRequest
} = require('../controllers/requestManagementController');

const {
  createFileRequest,
  getFileRequestsByRequest,
  getMyPendingFileRequests,
  respondToFileRequest
} = require('../controllers/fileRequestController');

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

// GET /api/requests/user-stats - Get user-specific action statistics
router.get('/user-stats', getUserActionStats);

// GET /api/requests/user-action-logs - Get user-specific action logs
router.get('/user-action-logs', getUserActionLogs);

// Request Management Routes (Executive)
// GET /api/requests/check-active - Check if executive has active request
router.get('/check-active', checkActiveRequest);

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

// PUT /api/requests/:id/edit - Edit request (Executive only, unclaimed)
router.put('/:id/edit', validateRequestId, editRequest);

// DELETE /api/requests/:id - Delete request (Executive only, unclaimed)
router.delete('/:id', validateRequestId, deleteRequest);

// File Request Routes
// POST /api/requests/file-requests - Create file request (Approvers only)
router.post('/file-requests', createFileRequest);

// GET /api/requests/file-requests/my-pending - Get pending file requests for current executive
router.get('/file-requests/my-pending', getMyPendingFileRequests);

// GET /api/requests/file-requests/request/:requestId - Get file requests for specific checkup request
router.get('/file-requests/request/:requestId', getFileRequestsByRequest);

// POST /api/requests/file-requests/:id/respond - Respond to file request (Executive uploads files)
router.post('/file-requests/:id/respond', respondToFileRequest);

module.exports = router;