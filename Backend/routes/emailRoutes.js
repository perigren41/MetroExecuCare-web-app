const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { pool } = require('../config/database/connection');

/**
 * Email Management Routes for MetroExecuCare
 * Admin-only routes for testing and managing email notifications
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/email/test - Test email service configuration
router.get('/test', requireAdmin, async (req, res) => {
  try {
    const testResult = await emailService.testEmailService();

    res.json({
      success: true,
      message: 'Email service test completed',
      data: testResult
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      error: 'Email service test failed',
      details: error.message
    });
  }
});

// POST /api/email/test-notification - Send test notification
router.post('/test-notification', requireAdmin, async (req, res) => {
  try {
    const { type = 'status_update', recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email is required'
      });
    }

    // Get actual user data from database
    const [recipients] = await pool.execute(
      'SELECT id, first_name, last_name, email, employee_id, department, position, role FROM users WHERE email = ?',
      [recipientEmail]
    );

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: `No user found with email: ${recipientEmail}`
      });
    }

    const recipient = recipients[0];

    // Mock request data for testing
    const mockRequestData = {
      id: 999,
      request_number: 'REQ2025TEST001',
      request_type: 'letter_of_approval',
      current_status: 'pending',
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      letter_purpose: 'Annual executive health checkup as per company policy'
    };

    // Get executive user (for templates that need executive data)
    const [executives] = await pool.execute(
      'SELECT id, first_name, last_name, email, employee_id, department, position FROM users WHERE role = "executive"'
    );
    const executive = executives[0] || recipient;

    // Use actual recipient data instead of admin data
    const actualRecipient = {
      id: recipient.id,
      first_name: recipient.first_name,
      last_name: recipient.last_name,
      email: recipient.email,
      employee_id: recipient.employee_id,
      department: recipient.department,
      position: recipient.position,
      role: recipient.role
    };

    let result;

    switch (type) {
      case 'new_request':
        // For new_request, recipient should be HR personnel
        if (recipient.role !== 'hr_personnel') {
          return res.status(400).json({
            success: false,
            error: 'new_request notifications should be sent to HR personnel'
          });
        }
        result = await emailService.sendNewRequestNotification(
          mockRequestData,
          executive,
          [actualRecipient]
        );
        break;

      case 'assignment':
        // For assignment, recipient should be HR personnel
        if (recipient.role !== 'hr_personnel') {
          return res.status(400).json({
            success: false,
            error: 'assignment notifications should be sent to HR personnel'
          });
        }
        result = await emailService.sendRequestAssignmentNotification(
          mockRequestData,
          executive,
          actualRecipient
        );
        break;

      case 'approval_request':
        // For approval_request, recipient should be benefits_officer or welfare_head
        if (!['benefits_officer', 'welfare_head'].includes(recipient.role)) {
          return res.status(400).json({
            success: false,
            error: 'approval_request notifications should be sent to benefits_officer or welfare_head'
          });
        }
        const stage = recipient.role === 'benefits_officer' ? 'benefits_review' : 'welfare_review';
        result = await emailService.sendApprovalRequestNotification(
          mockRequestData,
          executive,
          actualRecipient,
          stage
        );
        break;

      case 'status_update':
        // For status_update, recipient should be executive
        if (recipient.role !== 'executive') {
          return res.status(400).json({
            success: false,
            error: 'status_update notifications should be sent to executive'
          });
        }
        result = await emailService.sendStatusUpdateNotification(
          mockRequestData,
          actualRecipient,
          'approved',
          'Test approval with comments from the system administrator for testing purposes.',
          req.user
        );
        break;

      case 'final_approval':
        // For final_approval, recipient should be executive
        if (recipient.role !== 'executive') {
          return res.status(400).json({
            success: false,
            error: 'final_approval notifications should be sent to executive'
          });
        }
        result = await emailService.sendFinalApprovalNotification(
          mockRequestData,
          actualRecipient
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid notification type. Valid types: new_request, assignment, approval_request, status_update, final_approval'
        });
    }

    res.json({
      success: true,
      message: `Test ${type} notification sent successfully`,
      data: {
        recipient: recipientEmail,
        notificationType: type,
        result: result
      }
    });

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification',
      details: error.message
    });
  }
});

// GET /api/email/history/:requestId - Get notification history for a request
router.get('/history/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    // Check if user has access to this request
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole !== 'admin') {
      // Check if user is involved in this request
      const [requests] = await pool.execute(
        `SELECT employee_id FROM checkup_requests WHERE id = ?`,
        [requestId]
      );

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Request not found'
        });
      }

      if (requests[0].employee_id !== userId && !['hr_personnel', 'benefits_officer', 'welfare_head'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    const notifications = await emailService.getNotificationHistory(requestId);

    res.json({
      success: true,
      data: {
        requestId: requestId,
        notifications: notifications
      }
    });

  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification history'
    });
  }
});

// GET /api/email/status - Get email service status
router.get('/status', requireAdmin, async (req, res) => {
  try {
    const gmailService = require('../config/gmail');
    const status = gmailService.getStatus();

    res.json({
      success: true,
      data: {
        emailService: status,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get email status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get email service status'
    });
  }
});

module.exports = router;