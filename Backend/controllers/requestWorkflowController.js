const { pool } = require('../config/database/connection');
const { hasPermission, canApproveAtStage, getNextApprovalRole } = require('../config/rolePermissions');
const emailService = require('../services/emailService');

// Helper function to log activities
const logActivity = async (requestId, userId, action, description, oldValues = null, newValues = null, fileId = null) => {
  try {
    await pool.execute(
      `INSERT INTO activity_logs (
        request_id, user_id, action, description, old_values, new_values, 
        file_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        requestId, userId, action, description,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        fileId
      ]
    );
  } catch (error) {
    console.error('Log activity error:', error);
  }
};

// POST /api/requests/:id/assign - Assign request to HR personnel (admin/benefits/welfare only)
const assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { hr_personnel_id, notes } = req.body;
    const assignerId = req.user.id;
    const assignerRole = req.user.role;

    // Check permissions
    if (!['admin', 'benefits_officer', 'welfare_head'].includes(assignerRole)) {
      return res.status(403).json({
        success: false,
        error: 'Only Admin, Benefits Officer, or Division Head can assign requests'
      });
    }

    // Validate HR personnel
    const [hrPersonnel] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, position FROM users WHERE id = ? AND role = "hr_personnel" AND is_active = 1',
      [hr_personnel_id]
    );

    if (hrPersonnel.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Human Resource personnel ID'
      });
    }

    // Get current request
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    if (request.current_status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Request can only be assigned when in pending status'
      });
    }

    // Update request
    await pool.execute(
      `UPDATE checkup_requests SET 
        assigned_hr_id = ?, assigned_at = NOW(), current_status = 'assigned_to_hr',
        updated_at = NOW()
       WHERE id = ?`,
      [hr_personnel_id, id]
    );

    // Create assignment record
    await pool.execute(
      `INSERT INTO request_assignments (
        request_id, hr_personnel_id, assigned_by, assignment_type, notes, assigned_at
      ) VALUES (?, ?, ?, 'manually_assigned', ?, NOW())`,
      [id, hr_personnel_id, assignerId, notes || null]
    );

    // Log activity
    await logActivity(id, assignerId, 'request_assigned',
      `Request assigned to ${hrPersonnel[0].first_name} ${hrPersonnel[0].last_name}`,
      { status: 'pending', assigned_hr_id: null },
      { status: 'assigned_to_hr', assigned_hr_id: hr_personnel_id }
    );

    // Send email notification to assigned HR and Executive (async, don't wait)
    try {
      // Get executive details for the email
      const [executives] = await pool.execute(
        'SELECT u.*, cr.* FROM users u JOIN checkup_requests cr ON u.id = cr.employee_id WHERE cr.id = ?',
        [id]
      );

      if (executives.length > 0) {
        const executive = executives[0];
        const requestData = executives[0];
        const assignedHR = hrPersonnel[0];

        // Email to assigned HR
        emailService.sendRequestAssignmentNotification(requestData, executive, assignedHR)
          .then(() => console.log(`📧 Assignment notification sent to ${assignedHR.email}`))
          .catch(error => console.error('Email notification error:', error.message));

        // Email to Executive
        emailService.sendStatusUpdateNotification(
          requestData, executive, 'pending',
          `Your request has been assigned to ${assignedHR.first_name} ${assignedHR.last_name} for processing.`,
          assignedHR
        )
          .then(() => console.log(`📧 Assignment update sent to ${executive.email}`))
          .catch(error => console.error('Email notification error:', error.message));
      }
    } catch (emailError) {
      console.error('Error sending assignment notifications:', emailError.message);
      // Don't fail the assignment if email fails
    }

    res.json({
      success: true,
      message: 'Request assigned successfully',
      data: {
        assigned_to: {
          id: hrPersonnel[0].id,
          name: `${hrPersonnel[0].first_name} ${hrPersonnel[0].last_name}`,
          email: hrPersonnel[0].email
        }
      }
    });

  } catch (error) {
    console.error('Assign request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// POST /api/requests/:id/claim - Claim request (HR, Benefits Officer, Welfare Head)
const claimRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is allowed to claim requests
    const allowedRoles = ['hr_personnel', 'benefits_officer', 'welfare_head'];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Only Human Resource Personnel, Benefits Officer, and Division Head can claim requests'
      });
    }

    // Start transaction for atomic claim operation
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get current request with row lock to prevent concurrent claims
      const [requests] = await connection.execute(
        'SELECT * FROM checkup_requests WHERE id = ? FOR UPDATE',
        [id]
      );

      if (requests.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Request not found'
        });
      }

      const request = requests[0];

      // Determine expected status and stage based on user role
      let expectedStatus, newStatus, approvalStage, claimDescription;

      if (userRole === 'hr_personnel') {
        expectedStatus = 'pending';
        newStatus = 'hr_processing';
        approvalStage = 'hr_stage';
        claimDescription = 'Request claimed by Human Resource Personnel';

        // Check if already claimed by another HR
        if (request.current_status !== 'pending' || request.assigned_hr_id !== null) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Request is not available for claiming - it may have been claimed by another Human Resource Personnel'
          });
        }

        // Update request with HR assignment
        const [updateResult] = await connection.execute(
          `UPDATE checkup_requests SET
            assigned_hr_id = ?, assigned_at = NOW(), current_status = ?,
            updated_at = NOW()
           WHERE id = ? AND current_status = ? AND assigned_hr_id IS NULL`,
          [userId, newStatus, id, expectedStatus]
        );

        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Request could not be claimed - it may have been claimed by another user'
          });
        }

        // Create assignment record
        await connection.execute(
          `INSERT INTO request_assignments (
            request_id, hr_personnel_id, assigned_by, assignment_type, assigned_at
          ) VALUES (?, ?, ?, 'self_claimed', NOW())`,
          [id, userId, userId]
        );

      } else if (userRole === 'benefits_officer') {
        expectedStatus = 'benefits_review';
        approvalStage = 'benefits_stage';
        claimDescription = 'Request claimed by Benefits Officer';

        // Check if already claimed by another Benefits Officer
        const [existingClaim] = await connection.execute(
          `SELECT approver_id FROM request_approvals
           WHERE request_id = ? AND approval_stage = ? AND approver_id IS NOT NULL`,
          [id, approvalStage]
        );

        if (request.current_status !== expectedStatus) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Request is not at Benefits Officer review stage'
          });
        }

        if (existingClaim.length > 0 && existingClaim[0].approver_id !== null) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Request has already been claimed by another Benefits Officer'
          });
        }

        // Update request_approvals to assign this Benefits Officer
        const [updateResult] = await connection.execute(
          `UPDATE request_approvals SET
            approver_id = ?,
            updated_at = NOW()
           WHERE request_id = ? AND approval_stage = ? AND approver_id IS NULL`,
          [userId, id, approvalStage]
        );

        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Request could not be claimed - it may have been claimed by another user'
          });
        }

      } else if (userRole === 'welfare_head') {
        expectedStatus = 'welfare_review';
        approvalStage = 'welfare_stage';
        claimDescription = 'Request claimed by Division Head';

        // Check if already claimed by another Welfare Head
        const [existingClaim] = await connection.execute(
          `SELECT approver_id FROM request_approvals
           WHERE request_id = ? AND approval_stage = ? AND approver_id IS NOT NULL`,
          [id, approvalStage]
        );

        if (request.current_status !== expectedStatus) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Request is not at Division Head review stage'
          });
        }

        if (existingClaim.length > 0 && existingClaim[0].approver_id !== null) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Request has already been claimed by another Division Head'
          });
        }

        // Update request_approvals to assign this Welfare Head
        const [updateResult] = await connection.execute(
          `UPDATE request_approvals SET
            approver_id = ?,
            updated_at = NOW()
           WHERE request_id = ? AND approval_stage = ? AND approver_id IS NULL`,
          [userId, id, approvalStage]
        );

        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Request could not be claimed - it may have been claimed by another user'
          });
        }
      }

      // Commit the transaction
      await connection.commit();

      // Log activity (outside transaction)
      await logActivity(id, userId, 'request_claimed',
        claimDescription,
        { status: request.current_status },
        { status: request.current_status, claimed_by: userId, stage: approvalStage }
      );

    // Send email notification to Executive (async, don't wait)
    try {
      // Get executive and HR details for the email
      const [requestDetails] = await pool.execute(`
        SELECT u.*, cr.*, hr.first_name as hr_first_name, hr.last_name as hr_last_name, hr.email as hr_email
        FROM users u
        JOIN checkup_requests cr ON u.id = cr.employee_id
        JOIN users hr ON hr.id = ?
        WHERE cr.id = ?
      `, [userId, id]);

      if (requestDetails.length > 0) {
        const executive = requestDetails[0];
        const requestData = requestDetails[0];
        const assignedHR = {
          id: userId,
          first_name: requestDetails[0].hr_first_name,
          last_name: requestDetails[0].hr_last_name,
          email: requestDetails[0].hr_email,
          role: 'hr_personnel',
          position: 'Human Resource Personnel'
        };

        // Email to Executive about assignment
        emailService.sendStatusUpdateNotification(
          requestData, executive, 'pending',
          `Your request has been claimed by ${assignedHR.first_name} ${assignedHR.last_name} and is now being processed.`,
          assignedHR
        )
          .then(() => console.log(`📧 Claim notification sent to ${executive.email}`))
          .catch(error => console.error('Email notification error:', error.message));

        // Email to assigned HR
        emailService.sendRequestAssignmentNotification(requestData, executive, assignedHR)
          .then(() => console.log(`📧 Assignment notification sent to ${assignedHR.email}`))
          .catch(error => console.error('Email notification error:', error.message));
      }
    } catch (emailError) {
      console.error('Error sending claim notifications:', emailError.message);
      // Don't fail the claim if email fails
    }

      const roleNames = {
        'hr_personnel': 'Human Resource Personnel',
        'benefits_officer': 'Benefits Officer',
        'welfare_head': 'Division Head'
      };

      res.json({
        success: true,
        message: `Request claimed successfully by ${roleNames[userRole]}`,
        data: {
          request_id: id,
          status: request.current_status,
          claimed_by: userId,
          role: userRole,
          stage: approvalStage
        }
      });

    } catch (transactionError) {
      // Rollback transaction on any error
      await connection.rollback();
      throw transactionError;
    } finally {
      // Always release the connection
      connection.release();
    }

  } catch (error) {
    console.error('Claim request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// POST /api/requests/:id/process - Process request (HR personnel only)
const processRequest = async (req, res) => {
  try {
    console.log('🔄 ProcessRequest called with params:', req.params);
    console.log('🔄 ProcessRequest body:', req.body);
    console.log('🔄 ProcessRequest user:', { id: req.user?.id, role: req.user?.role });

    const { id } = req.params;
    const {
      hospital_id,
      hospital_name,
      hospital_address,
      hospital_contact,
      hr_assigned_hospital_id,
      approved_date,
      comments,
      letter_purpose
    } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'hr_personnel') {
      return res.status(403).json({
        success: false,
        error: 'Only Human Resources personnel can process requests'
      });
    }

    // Get current request
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    if (request.assigned_hr_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only process requests assigned to you'
      });
    }

    if (!['assigned_to_hr', 'hr_processing'].includes(request.current_status)) {
      return res.status(400).json({
        success: false,
        error: 'Request is not in a processable status'
      });
    }

    // Validate request type requirements
    if (request.request_type === 'letter_of_approval') {
      // For accredited hospitals - need hospital_id from hospitals table
      if (!hospital_id) {
        return res.status(400).json({
          success: false,
          error: 'Hospital selection is required for Letter of Approval'
        });
      }
      
      const [hospitals] = await pool.execute(
        'SELECT id, name FROM hospitals WHERE id = ? AND is_active = 1 AND is_accredited = 1',
        [hospital_id]
      );

      if (hospitals.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid accredited hospital ID'
        });
      }
    } else if (request.request_type === 'letter_of_authorization') {
      // For non-accredited hospitals - need manual hospital details
      if (!hospital_name || hospital_name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Hospital name is required for Letter of Authorization'
        });
      }
    }

    // Validate HR assigned hospital (can be different from requested hospital)
    if (hr_assigned_hospital_id) {
      const [hrHospitals] = await pool.execute(
        'SELECT id, name FROM hospitals WHERE id = ? AND is_active = 1',
        [hr_assigned_hospital_id]
      );

      if (hrHospitals.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Human Resources assigned hospital ID'
        });
      }
    }

    // Update request with hospital information and advance to benefits_review
    const updateFields = ['current_status = "benefits_review"', 'updated_at = NOW()'];
    const updateValues = [];

    // Set hospital information based on request type
    if (request.request_type === 'letter_of_approval' && hospital_id) {
      updateFields.push('hospital_id = ?');
      updateValues.push(hospital_id);
    } else if (request.request_type === 'letter_of_authorization') {
      // For Letter of Authorization, we should have already created the hospital
      // and have the hospital_id available. Use the existing_hospital_id if provided.
      const { existing_hospital_id } = req.body;

      if (existing_hospital_id) {
        updateFields.push('hospital_id = ?');
        updateValues.push(existing_hospital_id);
        console.log('📝 Letter of Authorization - using existing hospital ID:', existing_hospital_id);
      } else if (hr_assigned_hospital_id) {
        // If no existing hospital but HR assigned one, use that
        updateFields.push('hospital_id = ?');
        updateValues.push(hr_assigned_hospital_id);
        console.log('📝 Letter of Authorization - using HR assigned hospital ID:', hr_assigned_hospital_id);
      }

      // TODO: Add letter_purpose to checkup_requests table if needed
      if (letter_purpose) {
        console.log('📝 Letter of Authorization - letter purpose received:', letter_purpose);
        // updateFields.push('letter_purpose = ?');
        // updateValues.push(letter_purpose.trim());
      }
    }

    // Set HR assigned hospital (for checkup scheduling)
    if (hr_assigned_hospital_id) {
      updateFields.push('hr_assigned_hospital_id = ?');
      updateValues.push(hr_assigned_hospital_id);
    }

    // Update preferred checkup date if provided
    if (approved_date) {
      updateFields.push('preferred_date = ?');
      updateValues.push(approved_date);
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE checkup_requests SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Update HR approval record - mark as approved and no longer current stage
    await pool.execute(
      `UPDATE request_approvals SET
        approver_id = ?, action = 'approved', comments = ?,
        approved_hospital_id = ?, approved_date = ?,
        action_date = NOW(), is_current_stage = FALSE
       WHERE request_id = ? AND approval_stage = 'hr_stage'`,
      [userId, comments || null, hr_assigned_hospital_id || null, approved_date || null, id]
    );

    // Set Benefits stage as current
    await pool.execute(
      `UPDATE request_approvals SET is_current_stage = TRUE
       WHERE request_id = ? AND approval_stage = 'benefits_stage'`,
      [id]
    );

    // Log activity
    const activityData = {
      status: 'benefits_review',
      approved_date
    };

    if (request.request_type === 'letter_of_approval' && hospital_id) {
      activityData.hospital_id = hospital_id;
      activityData.hospital_type = 'accredited';
    } else if (request.request_type === 'letter_of_authorization') {
      activityData.hospital_name = hospital_name;
      activityData.hospital_address = hospital_address;
      activityData.hospital_contact = hospital_contact;
      activityData.hospital_type = 'non-accredited';
    }

    if (hr_assigned_hospital_id) {
      activityData.hr_assigned_hospital_id = hr_assigned_hospital_id;
    }

    await logActivity(id, userId, 'hr_processing_completed',
      `Human Resources processing completed - Hospital information filled and ${request.request_type.replace('_', ' ')} forwarded to Benefits review`,
      { status: request.current_status },
      activityData
    );

    // Send email notifications for next approval stages
    try {
      // Get request and executive details for emails
      const [requestDetails] = await pool.execute(`
        SELECT
          cr.*,
          u.first_name, u.last_name, u.email, u.department, u.position
        FROM checkup_requests cr
        JOIN users u ON cr.employee_id = u.id
        WHERE cr.id = ?
      `, [id]);

      if (requestDetails.length > 0) {
        const requestData = requestDetails[0];
        const executive = {
          id: requestData.employee_id,
          first_name: requestData.first_name,
          last_name: requestData.last_name,
          email: requestData.email,
          department: requestData.department,
          position: requestData.position
        };

        // Notify ALL Benefits Officers - they are the NEXT approvers after HR
        const [benefitsOfficers] = await pool.execute(
          'SELECT id, first_name, last_name, email, role, position FROM users WHERE role = "benefits_officer" AND is_active = 1'
        );

        benefitsOfficers.forEach(officer => {
          emailService.sendApprovalRequestNotification(
            requestData, executive, officer, 'benefits_review'
          )
            .then(() => console.log(`📧 Approval request notification sent to ${officer.email} for benefits_review`))
            .catch(error => console.error('Email notification error:', error.message));
        });

        // ❌ REMOVED: Do NOT notify Welfare Heads yet - they should only be notified AFTER Benefits Officer approves
        // Welfare Heads will receive their notification from the approveRequest function when Benefits Officer approves

        // Send status update to Executive
        const [hrUser] = await pool.execute(
          'SELECT id, first_name, last_name, email, role, position FROM users WHERE id = ?',
          [userId]
        );

        if (hrUser.length > 0) {
          emailService.sendStatusUpdateNotification(
            requestData, executive, 'pending',
            `Your request has been processed by Human Resources and is now under Benefits Officer review.`,
            hrUser[0]
          )
            .then(() => console.log(`📧 Status update notification sent to ${executive.email}`))
            .catch(error => console.error('Email notification error:', error.message));
        }
      }
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError.message);
      // Don't fail the processing if email fails
    }

    res.json({
      success: true,
      message: 'Request processing completed and forwarded to Benefits review'
    });

  } catch (error) {
    console.error('Process request error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message // Include actual error message for debugging
    });
  }
};

// POST /api/requests/:id/approve - Approve request at current stage
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      comments,
      assigned_hospital_id,
      approved_date
    } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get current request
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Determine current approval stage
    let currentStage = null;
    let nextStatus = null;

    console.log(`🔍 Initial Request State:`, {
      requestId: id,
      currentStatus: request.current_status,
      userRole: userRole,
      assignedHrId: request.assigned_hr_id,
      userId: userId
    });

    if (request.current_status === 'hr_processing' && userRole === 'hr_personnel' && request.assigned_hr_id === userId) {
      currentStage = 'hr_stage';
      nextStatus = 'benefits_review';
    } else if (request.current_status === 'benefits_review' && userRole === 'benefits_officer') {
      currentStage = 'benefits_stage';
      nextStatus = 'welfare_review'; // Both request types require welfare approval
    } else if (request.current_status === 'welfare_review' && userRole === 'welfare_head') {
      currentStage = 'welfare_stage';
      nextStatus = 'hr_final_verification'; // Send back to HR for final document verification
      console.log(`🔍 Welfare approval - nextStatus set to:`, {
        nextStatus: nextStatus,
        length: nextStatus.length,
        charCodes: Array.from(nextStatus).map(c => c.charCodeAt(0))
      });
    } else if (request.current_status === 'hr_final_verification' && userRole === 'hr_personnel' && request.assigned_hr_id === userId) {
      currentStage = 'hr_final_stage';
      nextStatus = 'completed'; // Final completion with document sending
    } else {
      return res.status(403).json({
        success: false,
        error: 'You cannot approve this request at its current stage'
      });
    }

    // Validate hospital if provided
    if (assigned_hospital_id) {
      const [hospitals] = await pool.execute(
        'SELECT id, name FROM hospitals WHERE id = ? AND is_active = 1',
        [assigned_hospital_id]
      );

      if (hospitals.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hospital ID'
        });
      }
    }

    // Update request status
    const updateFields = ['current_status = ?', 'updated_at = NOW()'];
    const updateValues = [nextStatus];

    if (nextStatus === 'approved') {
      updateFields.push('completed_at = NOW()');
    }

    if (currentStage === 'hr_stage') {
      if (assigned_hospital_id) {
        updateFields.push('hr_assigned_hospital_id = ?');
        updateValues.push(assigned_hospital_id);
      }
    }

    // Update preferred checkup date if provided (for any stage)
    if (approved_date) {
      updateFields.push('preferred_date = ?');
      updateValues.push(approved_date);
    }

    updateValues.push(id);

    // Validate status against allowed ENUM values
    const allowedStatuses = [
      'pending', 'assigned_to_hr', 'hr_processing', 'benefits_review',
      'welfare_review', 'hr_final_verification', 'approved', 'rejected',
      'letter_generated', 'letter_sent', 'completed', 'cancelled', 'deleted'
    ];

    // Trim nextStatus to remove any whitespace
    nextStatus = nextStatus.trim();

    console.log(`🔍 DEBUG - Request ${id}:`, {
      currentStatus: request.current_status,
      userRole: userRole,
      currentStage: currentStage,
      nextStatus: nextStatus,
      nextStatusLength: nextStatus.length,
      nextStatusType: typeof nextStatus,
      nextStatusCharCodes: Array.from(nextStatus).map(c => c.charCodeAt(0)),
      updateFields: updateFields,
      updateValues: updateValues
    });

    if (!allowedStatuses.includes(nextStatus)) {
      console.error(`❌ Invalid status value: "${nextStatus}" (length: ${nextStatus.length}, bytes: ${Buffer.byteLength(nextStatus, 'utf8')})`);
      console.error(`❌ Allowed values:`, allowedStatuses);
      return res.status(500).json({
        success: false,
        error: `Invalid status transition: "${nextStatus}". This is a system error.`
      });
    }

    console.log(`✅ Updating request ${id} status from "${request.current_status}" to "${nextStatus}"`);

    // Update the first value in updateValues with trimmed status
    updateValues[0] = nextStatus;

    console.log(`🔍 SQL Query Debug:`, {
      query: `UPDATE checkup_requests SET ${updateFields.join(', ')} WHERE id = ?`,
      values: updateValues,
      nextStatusInArray: updateValues[0],
      nextStatusInArrayLength: updateValues[0].length
    });

    await pool.execute(
      `UPDATE checkup_requests SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Update current approval record
    await pool.execute(
      `UPDATE request_approvals SET
        approver_id = ?, action = 'approved', comments = ?,
        approved_hospital_id = ?, approved_date = ?,
        action_date = NOW(), is_current_stage = FALSE
       WHERE request_id = ? AND approval_stage = ?`,
      [userId, comments || null, assigned_hospital_id || null, approved_date || null, id, currentStage]
    );

    // Set next stage as current if not final completion
    if (nextStatus !== 'completed') {
      const stageMapping = {
        'benefits_review': 'benefits_stage',
        'welfare_review': 'welfare_stage',
        'hr_final_verification': 'hr_final_stage' // HR Final Document Verification
      };

      if (stageMapping[nextStatus]) {
        // Check if the target stage exists for this request (legacy requests might not have hr_final_stage)
        const [stageExists] = await pool.execute(
          `SELECT id FROM request_approvals
           WHERE request_id = ? AND approval_stage = ?`,
          [id, stageMapping[nextStatus]]
        );

        if (stageExists.length > 0) {
          // Target stage exists, update it normally
          await pool.execute(
            `UPDATE request_approvals SET is_current_stage = TRUE
             WHERE request_id = ? AND approval_stage = ?`,
            [id, stageMapping[nextStatus]]
          );
        } else if (nextStatus === 'hr_final_verification') {
          // Legacy request missing hr_final_stage - skip to completed
          console.log(`⚠️ Legacy request ${id}: Missing hr_final_stage, completing directly`);
          nextStatus = 'completed';

          // Update the main request status to completed
          await pool.execute(
            `UPDATE checkup_requests SET current_status = 'completed', updated_at = NOW() WHERE id = ?`,
            [id]
          );
        }
      }
    }

    // Log activity
    const stageNames = {
      'hr_stage': 'Human Resources',
      'benefits_stage': 'Benefits Officer',
      'welfare_stage': 'Division Head',
      'hr_final_stage': 'Human Resource Final Clearance'
    };

    await logActivity(id, userId, `${currentStage}_approved`,
      `Request approved by ${stageNames[currentStage]}`,
      { status: request.current_status },
      {
        status: nextStatus,
        approved_by: userId,
        comments,
        assigned_hospital_id,
        approved_date
      }
    );

    // Send email notifications (async, don't wait)
    try {
      // Get request and user details
      const [requestDetails] = await pool.execute(`
        SELECT u.*, cr.*, approver.first_name as approver_first_name, approver.last_name as approver_last_name, approver.role as approver_role
        FROM users u
        JOIN checkup_requests cr ON u.id = cr.employee_id
        JOIN users approver ON approver.id = ?
        WHERE cr.id = ?
      `, [userId, id]);

      if (requestDetails.length > 0) {
        const executive = requestDetails[0];
        const requestData = requestDetails[0];
        const approver = {
          id: userId,
          first_name: requestDetails[0].approver_first_name,
          last_name: requestDetails[0].approver_last_name,
          role: requestDetails[0].approver_role,
          position: requestDetails[0].approver_role === 'benefits_officer' ? 'Benefits Officer' : requestDetails[0].approver_role === 'welfare_head' ? 'Division Head' : requestDetails[0].approver_role === 'hr_personnel' ? 'Human Resource Personnel' : 'Administrator'
        };

        // Email to Executive about approval (skip if HR final verification completing to 'completed' - that has its own special email)
        if (!(nextStatus === 'completed' && currentStage === 'hr_final_stage')) {
          const statusMessage = nextStatus === 'approved' ? 'approved' : 'pending';
          const detailMessage = nextStatus === 'approved'
            ? `Your request has been fully approved by ${stageNames[currentStage]}. Final approval letters will be generated.`
            : `Your request has been approved by ${stageNames[currentStage]} and is now moving to the next approval stage.`;

          emailService.sendStatusUpdateNotification(
            requestData, executive, statusMessage, detailMessage, approver
          )
            .then(() => console.log(`📧 Approval notification sent to ${executive.email}`))
            .catch(error => console.error('Email notification error:', error.message));
        }

        // If moving to next stage, notify the next approvers
        if (nextStatus === 'hr_final_verification') {
          // Notify HR for final document verification
          const [hrUser] = await pool.execute(
            'SELECT * FROM users WHERE id = ? AND role = ?',
            [requestData.assigned_hr_id, 'hr_personnel']
          );

          if (hrUser.length > 0) {
            emailService.sendHRFinalVerificationNotification(
              requestData,
              executive,
              hrUser[0],
              approver
            )
              .then(() => console.log(`📧 Human Resource final clearance notification sent to ${hrUser[0].email}`))
              .catch(error => console.error('Email notification error:', error.message));
          }
        } else if (nextStatus === 'benefits_review') {
          // Notify ALL Benefits Officers
          const [benefitsOfficers] = await pool.execute(
            'SELECT id, first_name, last_name, email, role, position FROM users WHERE role = "benefits_officer" AND is_active = 1'
          );

          benefitsOfficers.forEach(officer => {
            emailService.sendApprovalRequestNotification(
              requestData, executive, officer, 'benefits_review'
            )
              .then(() => console.log(`📧 Benefits approval request sent to ${officer.email}`))
              .catch(error => console.error('Email notification error:', error.message));
          });

        } else if (nextStatus === 'welfare_review') {
          // Notify ALL Welfare Heads
          const [welfareHeads] = await pool.execute(
            'SELECT id, first_name, last_name, email, role, position FROM users WHERE role = "welfare_head" AND is_active = 1'
          );

          welfareHeads.forEach(head => {
            emailService.sendApprovalRequestNotification(
              requestData, executive, head, 'welfare_review'
            )
              .then(() => console.log(`📧 Division Head approval request sent to ${head.email}`))
              .catch(error => console.error('Email notification error:', error.message));
          });

        } else if (nextStatus === 'completed') {
          // Final completion - HR has verified documents and sent to executive
          // Send executive final approval notification with download links
          if (currentStage === 'hr_final_stage') {
            // This is specifically from HR final verification completion
            emailService.sendExecutiveFinalApprovalNotification(requestData, executive, [])
              .then(() => console.log(`📧 Executive final approval notification with download links sent to ${executive.email}`))
              .catch(error => console.error('Email notification error:', error.message));
          } else {
            // Legacy requests or other completion paths
            emailService.sendFinalCompletionNotification(requestData, executive, approver)
              .then(() => console.log(`📧 Final completion notification sent to ${executive.email}`))
              .catch(error => console.error('Email notification error:', error.message));
          }
        }
      }
    } catch (emailError) {
      console.error('Error sending approval notifications:', emailError.message);
      // Don't fail the approval if email fails
    }

    res.json({
      success: true,
      message: nextStatus === 'completed' && currentStage === 'hr_final_stage'
        ? 'Final document verification completed. All documents have been sent to the employee.'
        : nextStatus === 'completed' && currentStage === 'welfare_stage'
        ? 'Request fully approved and completed. (Legacy request - skipped Human Resource final clearance)'
        : `Request approved at ${stageNames[currentStage]} stage`,
      data: {
        current_status: nextStatus,
        is_final_approval: nextStatus === 'completed',
        is_hr_final_verification: nextStatus === 'hr_final_verification'
      }
    });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// POST /api/requests/:id/reject - Reject request
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!comments || comments.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required and must be at least 10 characters'
      });
    }

    // Get current request
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Check permissions to reject
    let canReject = false;
    let currentStage = null;

    if (request.current_status === 'hr_processing' && userRole === 'hr_personnel' && request.assigned_hr_id === userId) {
      canReject = true;
      currentStage = 'hr_stage';
    } else if (request.current_status === 'benefits_review' && userRole === 'benefits_officer') {
      canReject = true;
      currentStage = 'benefits_stage';
    } else if (request.current_status === 'welfare_review' && userRole === 'welfare_head') {
      canReject = true;
      currentStage = 'welfare_stage';
    }

    if (!canReject) {
      return res.status(403).json({
        success: false,
        error: 'You cannot reject this request at its current stage'
      });
    }

    // Update request
    await pool.execute(
      `UPDATE checkup_requests SET 
        current_status = 'rejected', rejected_at = NOW(), rejected_by = ?, 
        rejection_reason = ?, updated_at = NOW()
       WHERE id = ?`,
      [userId, comments, id]
    );

    // Update approval record
    await pool.execute(
      `UPDATE request_approvals SET 
        approver_id = ?, action = 'rejected', comments = ?, 
        action_date = NOW(), is_current_stage = FALSE
       WHERE request_id = ? AND approval_stage = ?`,
      [userId, comments, id, currentStage]
    );

    // Log activity
    await logActivity(id, userId, 'request_rejected',
      `Request rejected at ${currentStage.replace('_', ' ')} stage`,
      { status: request.current_status },
      { status: 'rejected', rejected_by: userId, rejection_reason: comments }
    );

    // Send email notifications (async, don't wait)
    try {
      // Get request and user details
      const [requestDetails] = await pool.execute(`
        SELECT u.*, cr.*, rejector.first_name as rejector_first_name, rejector.last_name as rejector_last_name, rejector.role as rejector_role,
               hr.first_name as hr_first_name, hr.last_name as hr_last_name, hr.email as hr_email
        FROM users u
        JOIN checkup_requests cr ON u.id = cr.employee_id
        JOIN users rejector ON rejector.id = ?
        LEFT JOIN users hr ON hr.id = cr.assigned_hr_id
        WHERE cr.id = ?
      `, [userId, id]);

      if (requestDetails.length > 0) {
        const executive = requestDetails[0];
        const requestData = requestDetails[0];
        const rejector = {
          id: userId,
          first_name: requestDetails[0].rejector_first_name,
          last_name: requestDetails[0].rejector_last_name,
          role: requestDetails[0].rejector_role,
          position: requestDetails[0].rejector_role === 'benefits_officer' ? 'Benefits Officer' : requestDetails[0].rejector_role === 'welfare_head' ? 'Division Head' : requestDetails[0].rejector_role === 'hr_personnel' ? 'Human Resource Personnel' : 'Administrator'
        };

        const stageNames = {
          'hr_stage': 'Human Resources',
          'benefits_stage': 'Benefits Officer',
          'welfare_stage': 'Division Head',
          'hr_final_stage': 'Human Resource Final Clearance'
        };

        // Email to Executive about rejection
        if (currentStage === 'hr_final_stage') {
          // Use specialized executive final rejection notification for HR final stage
          emailService.sendExecutiveFinalRejectionNotification(
            requestData, executive, comments, rejector
          )
            .then(() => console.log(`📧 Executive final rejection notification sent to ${executive.email}`))
            .catch(error => console.error('Email notification error:', error.message));
        } else {
          // Use standard rejection notification for other stages
          emailService.sendStatusUpdateNotification(
            requestData, executive, 'rejected',
            `Your request has been rejected by ${stageNames[currentStage]}. Reason: ${comments}`,
            rejector
          )
            .then(() => console.log(`📧 Rejection notification sent to ${executive.email}`))
            .catch(error => console.error('Email notification error:', error.message));
        }

        // Email to assigned HR about rejection (if not HR who rejected)
        if (currentStage !== 'hr_stage' && requestDetails[0].hr_email) {
          const hrUser = {
            id: requestDetails[0].assigned_hr_id,
            first_name: requestDetails[0].hr_first_name,
            last_name: requestDetails[0].hr_last_name,
            email: requestDetails[0].hr_email
          };

          emailService.sendStatusUpdateNotification(
            requestData, hrUser, 'rejected',
            `Request ${requestData.request_number} has been rejected by ${stageNames[currentStage]}. Reason: ${comments}`,
            rejector
          )
            .then(() => console.log(`📧 Rejection notification sent to Human Resource ${hrUser.email}`))
            .catch(error => console.error('Email notification error:', error.message));
        }
      }
    } catch (emailError) {
      console.error('Error sending rejection notifications:', emailError.message);
      // Don't fail the rejection if email fails
    }

    res.json({
      success: true,
      message: 'Request rejected successfully'
    });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/requests/dashboard - Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'executive') {
      // Executive dashboard stats
      const [myStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN current_status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN current_status IN ('assigned_to_hr', 'hr_processing') THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN current_status IN ('benefits_review', 'welfare_review') THEN 1 ELSE 0 END) as under_review,
          SUM(CASE WHEN current_status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN current_status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN current_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN priority_level = 'urgent' THEN 1 ELSE 0 END) as urgent_requests,
          SUM(CASE WHEN DATEDIFF(due_date, CURDATE()) < 0 AND current_status NOT IN ('completed', 'rejected') THEN 1 ELSE 0 END) as overdue
        FROM checkup_requests 
        WHERE employee_id = ?
      `, [userId]);

      stats = myStats[0];

    } else if (userRole === 'hr_personnel') {
      // HR personnel dashboard stats - separate unclaimed and claimed counts
      const [hrStats] = await pool.execute(`
        SELECT
          SUM(CASE WHEN cr.current_status = 'pending' AND cr.assigned_hr_id IS NULL THEN 1 ELSE 0 END) as unassigned_requests,
          SUM(CASE WHEN (cr.current_status = 'hr_processing' OR cr.current_status = 'hr_final_verification') AND cr.assigned_hr_id = ? THEN 1 ELSE 0 END) as assigned_to_me,
          SUM(CASE WHEN cr.priority_level = 'urgent' THEN 1 ELSE 0 END) as urgent_requests,
          SUM(CASE WHEN DATEDIFF(cr.due_date, CURDATE()) < 0 AND cr.current_status NOT IN ('completed', 'rejected', 'cancelled', 'deleted') THEN 1 ELSE 0 END) as overdue
        FROM checkup_requests cr
        WHERE (
          (cr.current_status = 'pending' AND cr.assigned_hr_id IS NULL) OR
          (cr.current_status IN ('hr_processing', 'hr_final_verification') AND cr.assigned_hr_id = ?)
        )
        AND cr.current_status NOT IN ('cancelled', 'deleted')
      `, [userId, userId]);

      stats = {
        ...hrStats[0],
        unassigned_requests: hrStats[0].unassigned_requests || 0,  // Unclaimed requests
        assigned_to_me: hrStats[0].assigned_to_me || 0             // Claimed by this HR (hr_processing + hr_final_verification)
      };

    } else if (userRole === 'benefits_officer') {
      // Benefits officer dashboard stats - separate unclaimed and claimed counts
      const [benefitsStats] = await pool.execute(`
        SELECT
          SUM(CASE WHEN ra.approver_id IS NULL THEN 1 ELSE 0 END) as unclaimed_requests,
          SUM(CASE WHEN ra.approver_id = ? THEN 1 ELSE 0 END) as claimed_by_me,
          SUM(CASE WHEN cr.current_status IN ('welfare_review', 'approved', 'completed', 'hr_final_verification') THEN 1 ELSE 0 END) as processed,
          SUM(CASE WHEN cr.current_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN cr.priority_level = 'urgent' THEN 1 ELSE 0 END) as urgent_pending,
          SUM(CASE WHEN DATEDIFF(cr.due_date, CURDATE()) < 3 THEN 1 ELSE 0 END) as due_soon,
          SUM(CASE WHEN DATEDIFF(cr.due_date, CURDATE()) < 0 AND cr.current_status NOT IN ('completed', 'rejected', 'cancelled', 'deleted') THEN 1 ELSE 0 END) as overdue
        FROM request_approvals ra
        JOIN checkup_requests cr ON ra.request_id = cr.id
        WHERE ra.approval_stage = 'benefits_stage'
          AND ra.action = 'pending'
          AND ra.is_current_stage = 1
          AND cr.current_status NOT IN ('cancelled', 'deleted')
      `, [userId]);

      stats = {
        ...benefitsStats[0],
        pending_action: benefitsStats[0].unclaimed_requests || 0,  // Unclaimed requests
        pending_review: benefitsStats[0].claimed_by_me || 0        // Claimed by this BO
      };

    } else if (userRole === 'welfare_head') {
      // Welfare head dashboard stats - separate unclaimed and claimed counts
      const [welfareStats] = await pool.execute(`
        SELECT
          SUM(CASE WHEN ra.approver_id IS NULL THEN 1 ELSE 0 END) as unclaimed_requests,
          SUM(CASE WHEN ra.approver_id = ? THEN 1 ELSE 0 END) as claimed_by_me,
          SUM(CASE WHEN cr.current_status IN ('approved', 'hr_final_verification') THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN cr.current_status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN cr.current_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN cr.priority_level = 'urgent' THEN 1 ELSE 0 END) as urgent_requests,
          SUM(CASE WHEN DATEDIFF(cr.due_date, CURDATE()) < 0 AND cr.current_status NOT IN ('completed', 'rejected', 'cancelled', 'deleted') THEN 1 ELSE 0 END) as overdue
        FROM request_approvals ra
        JOIN checkup_requests cr ON ra.request_id = cr.id
        WHERE ra.approval_stage = 'welfare_stage'
          AND ra.action = 'pending'
          AND ra.is_current_stage = 1
          AND cr.current_status NOT IN ('cancelled', 'deleted')
      `, [userId]);

      // Also get overall system stats for welfare head overview
      const [overallStats] = await pool.execute(`
        SELECT
          COUNT(*) as total_requests,
          SUM(CASE WHEN current_status = 'approved' THEN 1 ELSE 0 END) as system_approved,
          SUM(CASE WHEN current_status = 'completed' THEN 1 ELSE 0 END) as system_completed,
          SUM(CASE WHEN current_status = 'rejected' THEN 1 ELSE 0 END) as system_rejected
        FROM checkup_requests
      `);

      stats = {
        ...welfareStats[0],
        ...overallStats[0],
        pending_action: welfareStats[0].unclaimed_requests || 0,        // Unclaimed requests
        pending_final_approval: welfareStats[0].claimed_by_me || 0      // Claimed by this DH
      };

    } else if (userRole === 'admin') {
      // Admin dashboard stats - comprehensive view
      const [systemStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN current_status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN current_status IN ('assigned_to_hr', 'hr_processing') THEN 1 ELSE 0 END) as hr_stage,
          SUM(CASE WHEN current_status = 'benefits_review' THEN 1 ELSE 0 END) as benefits_stage,
          SUM(CASE WHEN current_status = 'welfare_review' THEN 1 ELSE 0 END) as welfare_stage,
          SUM(CASE WHEN current_status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN current_status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN current_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN priority_level = 'urgent' THEN 1 ELSE 0 END) as urgent_requests,
          SUM(CASE WHEN DATEDIFF(due_date, CURDATE()) < 0 AND current_status NOT IN ('completed', 'rejected') THEN 1 ELSE 0 END) as overdue
        FROM checkup_requests
      `);

      const [unassignedCount] = await pool.execute(`
        SELECT COUNT(*) as unassigned_requests
        FROM checkup_requests 
        WHERE current_status = 'pending' AND assigned_hr_id IS NULL
      `);

      stats = {
        ...systemStats[0],
        unassigned_requests: unassignedCount[0].unassigned_requests
      };
    }

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/requests/pending-approvals?role={role} - Get pending approvals by role from request_approvals table
const getPendingApprovals = async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate role parameter
    if (!role || !['hr_personnel', 'benefits_officer', 'welfare_head'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role parameter. Must be hr_personnel, benefits_officer, or welfare_head'
      });
    }

    // Get pending approvals with request details
    const [approvals] = await pool.execute(`
      SELECT
        ra.id,
        ra.request_id,
        ra.approver_id,
        ra.approver_role,
        ra.approval_stage,
        ra.action,
        ra.is_current_stage,
        ra.stage_order,
        ra.created_at as approval_created_at,
        cr.request_number,
        cr.request_type,
        cr.current_status,
        cr.priority_level,
        cr.created_at as request_created_at,
        u.first_name as employee_first_name,
        u.last_name as employee_last_name,
        u.employee_id,
        h.name as hospital_name
      FROM request_approvals ra
      JOIN checkup_requests cr ON ra.request_id = cr.id
      JOIN users u ON cr.employee_id = u.id
      LEFT JOIN hospitals h ON cr.hospital_id = h.id
      WHERE ra.approver_role = ?
        AND ra.action = 'pending'
        AND ra.is_current_stage = 1
      ORDER BY cr.priority_level DESC, cr.created_at ASC
    `, [role]);

    // Filter to show ONLY unclaimed requests (approver_id is NULL)
    // Claimed requests should appear in "Claimed Requests" section, not "Pending Requests"
    const filteredApprovals = approvals.filter(approval =>
      approval.approver_id === null
    );

    res.json({
      success: true,
      data: {
        approvals: filteredApprovals,
        total_count: filteredApprovals.length,
        role: role,
        user_id: userId
      }
    });

  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending approvals'
    });
  }
};

// GET /api/requests/user-stats - Get user-specific action statistics
const getUserActionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only allow workflow roles (HR, Benefits Officer, Welfare Head)
    if (!['hr_personnel', 'benefits_officer', 'welfare_head'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is only available for workflow personnel'
      });
    }

    // Get current year
    const currentYear = new Date().getFullYear();

    // Get user's action statistics for the current year
    const [stats] = await pool.execute(`
      SELECT
        COUNT(*) as totalRequests,
        SUM(CASE WHEN ra.action = 'approved' THEN 1 ELSE 0 END) as approvedRequests,
        SUM(CASE WHEN ra.action = 'rejected' THEN 1 ELSE 0 END) as rejectedRequests
      FROM request_approvals ra
      WHERE ra.approver_id = ?
        AND ra.action IN ('approved', 'rejected')
        AND YEAR(ra.action_date) = ?
    `, [userId, currentYear]);

    res.json({
      success: true,
      data: stats[0] || {
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
      }
    });

  } catch (error) {
    console.error('Get user action stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user action statistics'
    });
  }
};

// GET /api/requests/user-action-logs?limit=10 - Get user-specific action logs
const getUserActionLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let limit = parseInt(req.query.limit);

    // Validate limit is a valid number
    if (isNaN(limit) || limit <= 0) {
      limit = 10;
    }
    // Cap maximum limit to prevent performance issues
    if (limit > 5000) {
      limit = 5000;
    }

    console.log(`[getUserActionLogs] userId=${userId}, role=${userRole}, limit=${limit}`);

    // Only allow workflow roles (HR, Benefits Officer, Welfare Head)
    if (!['hr_personnel', 'benefits_officer', 'welfare_head'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is only available for workflow personnel'
      });
    }

    // Get user's action logs
    console.log('[getUserActionLogs] Executing query...');
    console.log('[getUserActionLogs] Parameters:', { userId, userIdType: typeof userId, limit, limitType: typeof limit });

    const [logs] = await pool.query(
      `SELECT
        ra.id,
        ra.request_id,
        ra.action,
        COALESCE(ra.action_date, ra.updated_at, ra.created_at) as created_at,
        ra.approval_stage,
        ra.comments,
        cr.request_type,
        cr.current_status,
        cr.request_number,
        h.name as hospital_name,
        u.first_name as employee_first_name,
        u.last_name as employee_last_name
      FROM request_approvals ra
      JOIN checkup_requests cr ON ra.request_id = cr.id
      LEFT JOIN hospitals h ON cr.hospital_id = h.id
      LEFT JOIN users u ON cr.employee_id = u.id
      WHERE ra.approver_id = ?
        AND ra.action IN ('approved', 'rejected')
      ORDER BY COALESCE(ra.action_date, ra.updated_at, ra.created_at) DESC
      LIMIT ?`,
      [userId, limit]
    );

    console.log(`[getUserActionLogs] Query returned ${logs.length} rows`);

    // Format the logs to match the expected format with user-friendly descriptions
    const formattedLogs = logs.map(log => {
      // Create user-friendly description with request number
      const action = log.action === 'approved' ? 'approved' : 'rejected';
      const description = `Request ${action} by you, Request #${log.request_number}`;

      return {
        id: log.id,
        request_id: log.request_id,
        request_type: log.request_type,
        current_status: log.current_status,
        created_at: log.created_at,
        hospital_name: log.hospital_name,
        action: log.action,
        approval_stage: log.approval_stage,
        description: description,
        employee_first_name: log.employee_first_name,
        employee_last_name: log.employee_last_name,
        request_number: log.request_number,
        statusDisplay: {
          text: log.action === 'approved' ? 'Approved' : 'Rejected',
          color: log.action === 'approved' ? 'text-green-600' : 'text-red-600'
        }
      };
    });

    res.json({
      success: true,
      data: formattedLogs
    });

  } catch (error) {
    console.error('❌ [getUserActionLogs] Error details:', error);
    console.error('❌ [getUserActionLogs] Error message:', error.message);
    console.error('❌ [getUserActionLogs] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user action logs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST /api/requests/:id/release - Release/unclaim request (HR personnel only)
const releaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only HR personnel can release requests
    if (userRole !== 'hr_personnel') {
      return res.status(403).json({
        success: false,
        error: 'Only Human Resource Personnel can release requests'
      });
    }

    // Get current request
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Verify this HR is assigned to the request
    if (request.assigned_hr_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only release requests assigned to you'
      });
    }

    // Can only release if in hr_processing status
    if (request.current_status !== 'hr_processing') {
      return res.status(400).json({
        success: false,
        error: 'Request can only be released when in HR processing status'
      });
    }

    // Release the request back to pending
    await pool.execute(
      `UPDATE checkup_requests SET
        assigned_hr_id = NULL,
        assigned_at = NULL,
        current_status = 'pending',
        updated_at = NOW()
       WHERE id = ?`,
      [id]
    );

    // Mark assignment as completed/released
    await pool.execute(
      `UPDATE request_assignments SET
        is_active = FALSE,
        completed_at = NOW(),
        notes = CONCAT(COALESCE(notes, ''), '\nReleased by HR: ', COALESCE(?, 'No reason provided'))
       WHERE request_id = ? AND hr_personnel_id = ? AND is_active = TRUE`,
      [reason, id, userId]
    );

    // Update request_approvals to remove HR assignment
    await pool.execute(
      `UPDATE request_approvals SET
        approver_id = NULL,
        updated_at = NOW()
       WHERE request_id = ? AND approval_stage = 'hr_stage'`,
      [id]
    );

    // Log activity
    await logActivity(id, userId, 'request_released',
      `Request released back to pending pool by HR Personnel${reason ? ': ' + reason : ''}`,
      {
        status: 'hr_processing',
        assigned_hr_id: userId
      },
      {
        status: 'pending',
        assigned_hr_id: null,
        release_reason: reason || null
      }
    );

    // Send email notifications
    try {
      // Get executive and HR user details
      const [requestDetails] = await pool.execute(`
        SELECT
          u.first_name as exec_first_name, u.last_name as exec_last_name, u.email as exec_email,
          cr.*,
          hr.first_name as hr_first_name, hr.last_name as hr_last_name
        FROM checkup_requests cr
        JOIN users u ON cr.employee_id = u.id
        JOIN users hr ON hr.id = ?
        WHERE cr.id = ?
      `, [userId, id]);

      if (requestDetails.length > 0) {
        const requestData = requestDetails[0];
        const executive = {
          first_name: requestData.exec_first_name,
          last_name: requestData.exec_last_name,
          email: requestData.exec_email
        };
        const hrUser = {
          first_name: requestData.hr_first_name,
          last_name: requestData.hr_last_name
        };

        // Notify executive
        emailService.sendStatusUpdateNotification(
          requestData,
          executive,
          'pending',
          `Your request has been released back to the pending pool by ${hrUser.first_name} ${hrUser.last_name}. It will be available for other HR personnel to claim.${reason ? ' Reason: ' + reason : ''}`,
          hrUser
        )
          .then(() => console.log(`📧 Release notification sent to executive ${executive.email}`))
          .catch(error => console.error('Email notification error:', error.message));

        // Notify all other HR personnel
        const [otherHRPersonnel] = await pool.execute(
          'SELECT id, first_name, last_name, email FROM users WHERE role = "hr_personnel" AND is_active = 1 AND id != ?',
          [userId]
        );

        otherHRPersonnel.forEach(hr => {
          emailService.sendStatusUpdateNotification(
            requestData,
            hr,
            'pending',
            `Request ${requestData.request_number} has been released by ${hrUser.first_name} ${hrUser.last_name} and is now available for claiming.${reason ? ' Reason: ' + reason : ''}`,
            hrUser
          )
            .then(() => console.log(`📧 Release notification sent to HR ${hr.email}`))
            .catch(error => console.error('Email notification error:', error.message));
        });
      }
    } catch (emailError) {
      console.error('Error sending release notifications:', emailError.message);
      // Don't fail the release if email fails
    }

    res.json({
      success: true,
      message: 'Request released successfully and is now available for other HR personnel to claim',
      data: {
        request_id: id,
        status: 'pending',
        released_by: userId
      }
    });

  } catch (error) {
    console.error('Release request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  assignRequest,
  claimRequest,
  processRequest,
  approveRequest,
  rejectRequest,
  releaseRequest,
  getDashboardStats,
  getPendingApprovals,
  getUserActionStats,
  getUserActionLogs
};