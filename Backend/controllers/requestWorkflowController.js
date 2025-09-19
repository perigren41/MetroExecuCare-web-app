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
        error: 'Only admin, benefits officer, or welfare head can assign requests'
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
        error: 'Invalid HR personnel ID'
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

// POST /api/requests/:id/claim - Claim unassigned request (HR personnel only)
const claimRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'hr_personnel') {
      return res.status(403).json({
        success: false,
        error: 'Only HR personnel can claim requests'
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

    if (request.current_status !== 'pending' || request.assigned_hr_id !== null) {
      return res.status(400).json({
        success: false,
        error: 'Request is not available for claiming'
      });
    }

    // Update request
    await pool.execute(
      `UPDATE checkup_requests SET 
        assigned_hr_id = ?, assigned_at = NOW(), current_status = 'assigned_to_hr',
        updated_at = NOW()
       WHERE id = ?`,
      [userId, id]
    );

    // Create assignment record
    await pool.execute(
      `INSERT INTO request_assignments (
        request_id, hr_personnel_id, assigned_by, assignment_type, assigned_at
      ) VALUES (?, ?, ?, 'self_claimed', NOW())`,
      [id, userId, userId]
    );

    // Log activity
    await logActivity(id, userId, 'request_claimed',
      'Request claimed by HR personnel',
      { status: 'pending', assigned_hr_id: null },
      { status: 'assigned_to_hr', assigned_hr_id: userId }
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
          position: 'HR Personnel'
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

    res.json({
      success: true,
      message: 'Request claimed successfully'
    });

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
    const { id } = req.params;
    const {
      hospital_id,
      hospital_name,
      hospital_address,
      hospital_contact,
      hr_assigned_hospital_id,
      approved_date,
      comments
    } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'hr_personnel') {
      return res.status(403).json({
        success: false,
        error: 'Only HR personnel can process requests'
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
          error: 'Invalid HR assigned hospital ID'
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
      if (hospital_name) {
        updateFields.push('hospital_name = ?');
        updateValues.push(hospital_name.trim());
      }
      if (hospital_address) {
        updateFields.push('hospital_address = ?');
        updateValues.push(hospital_address.trim());
      }
      if (hospital_contact) {
        updateFields.push('hospital_contact = ?');
        updateValues.push(hospital_contact.trim());
      }
    }

    // Set HR assigned hospital (for checkup scheduling)
    if (hr_assigned_hospital_id) {
      updateFields.push('hr_assigned_hospital_id = ?');
      updateValues.push(hr_assigned_hospital_id);
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
      `HR processing completed - Hospital information filled and ${request.request_type.replace('_', ' ')} forwarded to Benefits review`,
      { status: request.current_status },
      activityData
    );

    // Send email notifications for next approval stages
    try {
      // Get request and executive details for emails
      const [requestDetails] = await pool.execute(`
        SELECT
          cr.*,
          u.first_name, u.last_name, u.email
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
          email: requestData.email
        };

        // Notify ALL Benefits Officers
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

        // Notify ALL Welfare Heads (they can see it's coming after benefits)
        const [welfareHeads] = await pool.execute(
          'SELECT id, first_name, last_name, email, role, position FROM users WHERE role = "welfare_head" AND is_active = 1'
        );

        welfareHeads.forEach(head => {
          emailService.sendApprovalRequestNotification(
            requestData, executive, head, 'welfare_review'
          )
            .then(() => console.log(`📧 Approval request notification sent to ${head.email} for welfare_review`))
            .catch(error => console.error('Email notification error:', error.message));
        });

        // Send status update to Executive
        const [hrUser] = await pool.execute(
          'SELECT id, first_name, last_name, email, role, position FROM users WHERE id = ?',
          [userId]
        );

        if (hrUser.length > 0) {
          emailService.sendStatusUpdateNotification(
            requestData, executive, 'pending',
            `Your request has been processed by HR and is now under Benefits Officer review.`,
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
    res.status(500).json({
      success: false,
      error: 'Internal server error'
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

    if (request.current_status === 'hr_processing' && userRole === 'hr_personnel' && request.assigned_hr_id === userId) {
      currentStage = 'hr_stage';
      nextStatus = 'benefits_review';
    } else if (request.current_status === 'benefits_review' && userRole === 'benefits_officer') {
      currentStage = 'benefits_stage';
      nextStatus = 'welfare_review'; // Both request types require welfare approval
    } else if (request.current_status === 'welfare_review' && userRole === 'welfare_head') {
      currentStage = 'welfare_stage';
      nextStatus = 'approved';
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

    updateValues.push(id);

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

    // Set next stage as current if not final approval
    if (nextStatus !== 'approved') {
      const stageMapping = {
        'benefits_review': 'benefits_stage',
        'welfare_review': 'welfare_stage'
      };

      if (stageMapping[nextStatus]) {
        await pool.execute(
          `UPDATE request_approvals SET is_current_stage = TRUE 
           WHERE request_id = ? AND approval_stage = ?`,
          [id, stageMapping[nextStatus]]
        );
      }
    }

    // Log activity
    const stageNames = {
      'hr_stage': 'HR',
      'benefits_stage': 'Benefits Officer',
      'welfare_stage': 'Welfare Head'
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
        SELECT u.*, cr.*, approver.first_name as approver_first_name, approver.last_name as approver_last_name
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
          role: userRole,
          position: userRole === 'benefits_officer' ? 'Benefits Officer' : userRole === 'welfare_head' ? 'Welfare Head' : userRole === 'hr_personnel' ? 'HR Personnel' : 'Administrator'
        };

        // Email to Executive about approval
        const statusMessage = nextStatus === 'approved' ? 'approved' : 'pending';
        const detailMessage = nextStatus === 'approved'
          ? `Your request has been fully approved by ${stageNames[currentStage]}. Final approval letters will be generated.`
          : `Your request has been approved by ${stageNames[currentStage]} and is now moving to the next approval stage.`;

        emailService.sendStatusUpdateNotification(
          requestData, executive, statusMessage, detailMessage, approver
        )
          .then(() => console.log(`📧 Approval notification sent to ${executive.email}`))
          .catch(error => console.error('Email notification error:', error.message));

        // If moving to next stage, notify the next approvers
        if (nextStatus === 'benefits_review') {
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
              .then(() => console.log(`📧 Welfare approval request sent to ${head.email}`))
              .catch(error => console.error('Email notification error:', error.message));
          });

        } else if (nextStatus === 'approved') {
          // Final approval - notify assigned HR and send final notification to Executive
          const [assignedHR] = await pool.execute(
            'SELECT id, first_name, last_name, email, role, position FROM users WHERE id = ?',
            [request.assigned_hr_id]
          );

          if (assignedHR.length > 0) {
            const hrUser = assignedHR[0];

            // Notify HR that request is fully approved
            emailService.sendStatusUpdateNotification(
              requestData, hrUser, 'approved',
              `Request ${requestData.request_number} has been fully approved by Welfare Head. Please generate and send final approval letters.`,
              approver
            )
              .then(() => console.log(`📧 Final approval notification sent to HR ${hrUser.email}`))
              .catch(error => console.error('Email notification error:', error.message));

            // Send final approval notification to Executive
            emailService.sendFinalApprovalNotification(requestData, executive)
              .then(() => console.log(`📧 Final approval notification sent to ${executive.email}`))
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
      message: `Request approved at ${stageNames[currentStage]} stage`,
      data: {
        current_status: nextStatus,
        is_final_approval: nextStatus === 'approved'
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
        SELECT u.*, cr.*, rejector.first_name as rejector_first_name, rejector.last_name as rejector_last_name,
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
          role: userRole,
          position: userRole === 'benefits_officer' ? 'Benefits Officer' : userRole === 'welfare_head' ? 'Welfare Head' : userRole === 'hr_personnel' ? 'HR Personnel' : 'Administrator'
        };

        const stageNames = {
          'hr_stage': 'HR',
          'benefits_stage': 'Benefits Officer',
          'welfare_stage': 'Welfare Head'
        };

        // Email to Executive about rejection
        emailService.sendStatusUpdateNotification(
          requestData, executive, 'rejected',
          `Your request has been rejected by ${stageNames[currentStage]}. Reason: ${comments}`,
          rejector
        )
          .then(() => console.log(`📧 Rejection notification sent to ${executive.email}`))
          .catch(error => console.error('Email notification error:', error.message));

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
            .then(() => console.log(`📧 Rejection notification sent to HR ${hrUser.email}`))
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
      // HR personnel dashboard stats
      const [assignedStats] = await pool.execute(`
        SELECT 
          COUNT(*) as assigned_to_me,
          SUM(CASE WHEN current_status = 'assigned_to_hr' THEN 1 ELSE 0 END) as pending_action,
          SUM(CASE WHEN current_status = 'hr_processing' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN current_status IN ('benefits_review', 'welfare_review', 'approved', 'completed') THEN 1 ELSE 0 END) as processed,
          SUM(CASE WHEN priority_level = 'urgent' THEN 1 ELSE 0 END) as urgent_assigned,
          SUM(CASE WHEN DATEDIFF(due_date, CURDATE()) < 0 AND current_status NOT IN ('completed', 'rejected') THEN 1 ELSE 0 END) as overdue_assigned
        FROM checkup_requests 
        WHERE assigned_hr_id = ?
      `, [userId]);

      const [unassignedCount] = await pool.execute(`
        SELECT COUNT(*) as unassigned_requests
        FROM checkup_requests 
        WHERE current_status = 'pending' AND assigned_hr_id IS NULL
      `);

      stats = {
        ...assignedStats[0],
        unassigned_requests: unassignedCount[0].unassigned_requests
      };

    } else if (userRole === 'benefits_officer') {
      // Benefits officer dashboard stats
      const [reviewStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN current_status = 'benefits_review' THEN 1 ELSE 0 END) as pending_review,
          SUM(CASE WHEN current_status IN ('welfare_review', 'approved', 'completed') THEN 1 ELSE 0 END) as processed,
          SUM(CASE WHEN current_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN priority_level = 'urgent' AND current_status = 'benefits_review' THEN 1 ELSE 0 END) as urgent_pending,
          SUM(CASE WHEN DATEDIFF(due_date, CURDATE()) < 3 AND current_status = 'benefits_review' THEN 1 ELSE 0 END) as due_soon
        FROM checkup_requests 
        WHERE current_status IN ('benefits_review', 'welfare_review', 'approved', 'rejected', 'completed')
      `);

      stats = reviewStats[0];

    } else if (userRole === 'welfare_head') {
      // Welfare head dashboard stats
      const [overallStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN current_status = 'welfare_review' THEN 1 ELSE 0 END) as pending_final_approval,
          SUM(CASE WHEN current_status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN current_status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN current_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN priority_level = 'urgent' THEN 1 ELSE 0 END) as urgent_requests,
          SUM(CASE WHEN DATEDIFF(due_date, CURDATE()) < 0 AND current_status NOT IN ('completed', 'rejected') THEN 1 ELSE 0 END) as overdue
        FROM checkup_requests
      `);

      stats = overallStats[0];

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

module.exports = {
  assignRequest,
  claimRequest,
  processRequest,
  approveRequest,
  rejectRequest,
  getDashboardStats
};