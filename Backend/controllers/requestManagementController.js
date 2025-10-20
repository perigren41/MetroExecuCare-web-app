/**
 * Request Management Controller
 * Handles executive request management: check active, edit, delete
 */

const { pool } = require('../config/database/connection');

/**
 * Check if executive has an active request
 * GET /api/requests/check-active
 * Auth: Required (Executive)
 */
const checkActiveRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const employeeId = req.user.employee_id;

    console.log(`Checking active request for user ID: ${userId}, employee_id: ${employeeId}`);

    // Query for active request (not terminal states)
    // Terminal states: approved, rejected, completed, cancelled, deleted
    const [requests] = await pool.execute(
      `SELECT
        id,
        request_number,
        request_type,
        current_status,
        created_at,
        assigned_hr_id,
        assigned_hr_at
      FROM checkup_requests
      WHERE employee_id = ?
      AND current_status NOT IN ('approved', 'rejected', 'completed', 'cancelled', 'deleted')
      ORDER BY created_at DESC
      LIMIT 1`,
      [userId]  // Changed from employeeId to userId for executives
    );

    if (requests.length > 0) {
      const activeRequest = requests[0];
      return res.json({
        success: true,
        hasActiveRequest: true,
        activeRequest: {
          id: activeRequest.id,
          request_number: activeRequest.request_number,
          request_type: activeRequest.request_type,
          current_status: activeRequest.current_status,
          created_at: activeRequest.created_at,
          is_claimed: activeRequest.assigned_hr_id !== null,
          claimed_at: activeRequest.assigned_hr_at
        }
      });
    }

    return res.json({
      success: true,
      hasActiveRequest: false,
      activeRequest: null
    });

  } catch (error) {
    console.error('Error checking active request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check active request',
      error: error.message
    });
  }
};

/**
 * Edit request (only if unclaimed by HR)
 * PUT /api/requests/:id/edit
 * Auth: Required (Executive, owns request)
 */
const editRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    const employeeId = req.user.employee_id;
    const {
      letter_purpose,
      hospital_id
    } = req.body;

    console.log(`Edit request ${requestId} by executive ${employeeId}`);

    // Verify request exists and belongs to user
    const [requests] = await pool.execute(
      'SELECT id, employee_id, assigned_hr_id FROM checkup_requests WHERE id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    // Verify ownership
    if (request.employee_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this request'
      });
    }

    // Check if request is editable (not claimed by HR)
    if (request.assigned_hr_id !== null) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit request - it has already been claimed by HR Personnel',
        is_claimed: true
      });
    }

    // Validate hospital if provided
    if (hospital_id) {
      const [hospitals] = await pool.execute(
        'SELECT id FROM hospitals WHERE id = ? AND is_active = 1',
        [hospital_id]
      );

      if (hospitals.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid hospital ID'
        });
      }
    }

    // Update request
    const [result] = await pool.execute(
      `UPDATE checkup_requests
       SET letter_purpose = ?,
           hospital_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        letter_purpose,
        hospital_id || null,
        requestId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update request'
      });
    }

    // Get updated request
    const [updatedRequests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [requestId]
    );

    return res.json({
      success: true,
      message: 'Request updated successfully',
      request: updatedRequests[0]
    });

  } catch (error) {
    console.error('Error editing request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to edit request',
      error: error.message
    });
  }
};

/**
 * Delete request (only if unclaimed by HR)
 * DELETE /api/requests/:id
 * Auth: Required (Executive, owns request)
 */
const deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    const employeeId = req.user.employee_id;

    console.log(`Delete request ${requestId} by executive ${employeeId}`);

    // Verify request exists and belongs to user
    const [requests] = await pool.execute(
      'SELECT id, employee_id, assigned_hr_id, current_status FROM checkup_requests WHERE id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    // Verify ownership
    if (request.employee_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this request'
      });
    }

    // Check if request is deletable (not claimed by HR)
    if (request.assigned_hr_id !== null) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete request - it has already been claimed by HR Personnel',
        is_claimed: true
      });
    }

    // Soft delete: update current_status to 'deleted'
    const [result] = await pool.execute(
      `UPDATE checkup_requests
       SET current_status = 'deleted',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete request'
      });
    }

    // Log activity (using correct activity_logs schema)
    await pool.execute(
      `INSERT INTO activity_logs (request_id, user_id, action, description, old_values, created_at)
       VALUES (?, ?, 'DELETE_REQUEST', ?, ?, CURRENT_TIMESTAMP)`,
      [
        requestId,
        userId,
        `Executive deleted unclaimed request #${requestId}`,
        JSON.stringify({ request_id: requestId, request_number: request.request_number })
      ]
    );

    return res.json({
      success: true,
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete request',
      error: error.message
    });
  }
};

module.exports = {
  checkActiveRequest,
  editRequest,
  deleteRequest
};
