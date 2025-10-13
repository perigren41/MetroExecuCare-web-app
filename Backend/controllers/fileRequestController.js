/**
 * File Request Controller
 * Handles file requests from approvers to executives
 */

const { pool } = require('../config/database/connection');
const emailService = require('../services/emailService');

/**
 * Create file request (Approver requests files from executive)
 * POST /api/file-requests
 * Auth: Required (HR/Benefits/Welfare)
 */
const createFileRequest = async (req, res) => {
  try {
    const { request_id, message } = req.body;
    const requestedBy = req.user.id;
    const requestedByRole = req.user.role;

    console.log(`Creating file request for request ${request_id} by ${requestedByRole}`);

    // Validate role
    const validRoles = ['hr_personnel', 'benefits_officer', 'welfare_head'];
    if (!validRoles.includes(requestedByRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only HR, Benefits Officer, or Welfare Head can request files'
      });
    }

    // Validate request exists and get executive info
    const [requests] = await pool.execute(
      `SELECT
        cr.id,
        cr.employee_id,
        cr.request_number,
        cr.request_type,
        u.email,
        u.first_name,
        u.last_name
      FROM checkup_requests cr
      JOIN users u ON cr.employee_id = u.id
      WHERE cr.id = ?`,
      [request_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const checkupRequest = requests[0];

    // Create file request
    const [result] = await pool.execute(
      `INSERT INTO file_requests (request_id, requested_by, requested_by_role, message, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [request_id, requestedBy, requestedByRole, message]
    );

    const fileRequestId = result.insertId;

    // Get requester info
    const [requesterInfo] = await pool.execute(
      'SELECT first_name, last_name FROM users WHERE id = ?',
      [requestedBy]
    );

    const requester = requesterInfo[0];

    // Format role name for email
    const roleNames = {
      'hr_personnel': 'Human Resource Personnel',
      'benefits_officer': 'Benefits Officer',
      'welfare_head': 'Division Head'
    };
    const formattedRole = roleNames[requestedByRole] || requestedByRole;

    // Send email notification to executive
    try {
      await emailService.sendFileRequestNotification({
        to: checkupRequest.email,
        executiveName: `${checkupRequest.first_name} ${checkupRequest.last_name}`,
        requesterName: `${requester.first_name} ${requester.last_name}`,
        requesterRole: formattedRole,
        requestNumber: checkupRequest.request_number,
        requestType: checkupRequest.request_type,
        message: message
      });
    } catch (emailError) {
      console.error('Failed to send file request email:', emailError);
      // Don't fail the request if email fails
    }

    // Create notification
    await pool.execute(
      `INSERT INTO notifications (request_id, recipient_id, recipient_email, notification_type, subject, message, created_at)
       VALUES (?, ?, ?, 'file_requested', ?, ?, CURRENT_TIMESTAMP)`,
      [
        request_id,
        checkupRequest.employee_id,
        checkupRequest.email,
        'Additional Files Requested',
        `${requester.first_name} ${requester.last_name} has requested additional files for your request`
      ]
    );

    return res.json({
      success: true,
      message: 'File request sent successfully',
      fileRequest: {
        id: fileRequestId,
        request_id,
        requested_by: requestedBy,
        requested_by_role: requestedByRole,
        message,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error creating file request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create file request',
      error: error.message
    });
  }
};

/**
 * Get file requests for a specific checkup request
 * GET /api/file-requests/request/:requestId
 * Auth: Required
 */
const getFileRequestsByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const [fileRequests] = await pool.execute(
      `SELECT
        fr.*,
        u.first_name as requested_by_first_name,
        u.last_name as requested_by_last_name
      FROM file_requests fr
      JOIN users u ON fr.requested_by = u.id
      WHERE fr.request_id = ?
      ORDER BY fr.created_at DESC`,
      [requestId]
    );

    return res.json({
      success: true,
      fileRequests
    });

  } catch (error) {
    console.error('Error getting file requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get file requests',
      error: error.message
    });
  }
};

/**
 * Get pending file requests for current user (executive)
 * GET /api/file-requests/my-pending
 * Auth: Required (Executive)
 */
const getMyPendingFileRequests = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;

    const [fileRequests] = await pool.execute(
      `SELECT
        fr.*,
        u.first_name as requested_by_first_name,
        u.last_name as requested_by_last_name,
        cr.request_type,
        cr.current_status
      FROM file_requests fr
      JOIN checkup_requests cr ON fr.request_id = cr.id
      JOIN users u ON fr.requested_by = u.id
      WHERE cr.employee_id = ?
      AND fr.status = 'pending'
      ORDER BY fr.created_at DESC`,
      [employeeId]
    );

    return res.json({
      success: true,
      pendingFileRequests: fileRequests
    });

  } catch (error) {
    console.error('Error getting pending file requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get pending file requests',
      error: error.message
    });
  }
};

/**
 * Executive responds to file request by uploading files
 * POST /api/file-requests/:id/respond
 * Auth: Required (Executive)
 * Note: File upload handled by separate endpoint, this just marks as fulfilled
 */
const respondToFileRequest = async (req, res) => {
  try {
    const fileRequestId = req.params.id;
    const { file_ids } = req.body; // Array of uploaded file IDs

    // Verify file request exists and belongs to user
    const [fileRequests] = await pool.execute(
      `SELECT fr.*, cr.employee_id, cr.request_number
       FROM file_requests fr
       JOIN checkup_requests cr ON fr.request_id = cr.id
       WHERE fr.id = ?`,
      [fileRequestId]
    );

    if (fileRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File request not found'
      });
    }

    const fileRequest = fileRequests[0];

    // Verify ownership - checkup_requests.employee_id is INT (user.id), not VARCHAR (employee_id)
    if (fileRequest.employee_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to respond to this file request'
      });
    }

    // Mark file request as fulfilled
    await pool.execute(
      `UPDATE file_requests
       SET status = 'fulfilled',
           fulfilled_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [fileRequestId]
    );

    // Send notification to requester
    const [requester] = await pool.execute(
      'SELECT email, first_name, last_name FROM users WHERE id = ?',
      [fileRequest.requested_by]
    );

    if (requester.length > 0) {
      try {
        await emailService.sendFileUploadedNotification({
          to: requester[0].email,
          requesterName: `${requester[0].first_name} ${requester[0].last_name}`,
          executiveName: `${req.user.first_name} ${req.user.last_name}`,
          requestNumber: fileRequest.request_number
        });
      } catch (emailError) {
        console.error('Failed to send file uploaded email:', emailError);
      }
    }

    // Create notification (only if requester email is available)
    if (requester.length > 0) {
      await pool.execute(
        `INSERT INTO notifications (request_id, recipient_id, recipient_email, notification_type, subject, message, created_at)
         VALUES (?, ?, ?, 'file_uploaded', ?, ?, CURRENT_TIMESTAMP)`,
        [
          fileRequest.request_id,
          fileRequest.requested_by,
          requester[0].email,
          'Requested Files Uploaded',
          `${req.user.first_name} ${req.user.last_name} has uploaded the requested files`
        ]
      );
    }

    return res.json({
      success: true,
      message: 'File request marked as fulfilled',
      fileRequest: {
        id: fileRequestId,
        status: 'fulfilled'
      }
    });

  } catch (error) {
    console.error('Error responding to file request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to respond to file request',
      error: error.message
    });
  }
};

module.exports = {
  createFileRequest,
  getFileRequestsByRequest,
  getMyPendingFileRequests,
  respondToFileRequest
};
