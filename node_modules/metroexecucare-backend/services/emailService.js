const gmailService = require('../config/gmail');
const { pool } = require('../config/database/connection');
const EmailTemplates = require('../templates/email/emailTemplates');

/**
 * Email Service for MetroExecuCare
 * Handles all email notifications throughout the request approval workflow
 */

class EmailService {
  constructor() {
    this.gmailService = gmailService;
  }

  /**
   * Send new request notification to HR personnel
   * @param {Object} requestData - Request information
   * @param {Object} executive - Executive who submitted the request
   * @param {Array} hrPersonnel - List of HR personnel to notify
   */
  async sendNewRequestNotification(requestData, executive, hrPersonnel) {
    try {
      const subject = `New Executive Checkup Request - ${requestData.request_number}`;

      const emailPromises = hrPersonnel.map(hr => {
        const emailData = {
          to: hr.email,
          subject: subject,
          html: this.generateNewRequestTemplate(requestData, executive, hr),
          text: `New executive checkup request ${requestData.request_number} has been submitted by ${executive.first_name} ${executive.last_name} and requires your attention.`
        };

        return this.sendNotificationEmail(emailData, 'new_request', requestData.id, hr.id);
      });

      const results = await Promise.allSettled(emailPromises);
      console.log(`📧 New request notifications sent to ${results.length} HR personnel`);

      return results;
    } catch (error) {
      console.error('Error sending new request notifications:', error);
      throw error;
    }
  }

  /**
   * Send request assignment notification to specific HR personnel
   * @param {Object} requestData - Request information
   * @param {Object} executive - Executive who submitted the request
   * @param {Object} assignedHR - HR personnel assigned to handle the request
   */
  async sendRequestAssignmentNotification(requestData, executive, assignedHR) {
    try {
      const subject = `Request Assigned - ${requestData.request_number}`;

      const emailData = {
        to: assignedHR.email,
        subject: subject,
        html: this.generateAssignmentTemplate(requestData, executive, assignedHR),
        text: `Request ${requestData.request_number} has been assigned to you for processing.`
      };

      const result = await this.sendNotificationEmail(emailData, 'request_assigned', requestData.id, assignedHR.id);
      console.log(`📧 Assignment notification sent to ${assignedHR.email}`);

      return result;
    } catch (error) {
      console.error('Error sending assignment notification:', error);
      throw error;
    }
  }

  /**
   * Send approval request notification to approver (Benefits Officer or Welfare Head)
   * @param {Object} requestData - Request information
   * @param {Object} executive - Executive who submitted the request
   * @param {Object} approver - Approver to notify
   * @param {string} stage - Current approval stage ('benefits_review' or 'welfare_review')
   */
  async sendApprovalRequestNotification(requestData, executive, approver, stage) {
    try {
      const stageNames = {
        'benefits_review': 'Benefits Officer Review',
        'welfare_review': 'Employee Welfare Division Head Review'
      };

      const subject = `Approval Required - ${requestData.request_number} (${stageNames[stage]})`;

      const emailData = {
        to: approver.email,
        subject: subject,
        html: this.generateApprovalRequestTemplate(requestData, executive, approver, stage),
        text: `Request ${requestData.request_number} requires your approval at the ${stageNames[stage]} stage.`
      };

      const result = await this.sendNotificationEmail(emailData, 'approval_request', requestData.id, approver.id);
      console.log(`📧 Approval request notification sent to ${approver.email} for ${stage}`);

      return result;
    } catch (error) {
      console.error('Error sending approval request notification:', error);
      throw error;
    }
  }

  /**
   * Send status update notification to executive
   * @param {Object} requestData - Request information
   * @param {Object} executive - Executive to notify
   * @param {string} status - New status
   * @param {string} comments - Approval/rejection comments
   * @param {Object} approver - Who performed the action
   */
  async sendStatusUpdateNotification(requestData, executive, status, comments, approver) {
    try {
      const statusMessages = {
        'approved': 'Approved',
        'rejected': 'Rejected',
        'pending': 'Under Review',
        'completed': 'Completed'
      };

      const subject = `Request ${statusMessages[status]} - ${requestData.request_number}`;

      const emailData = {
        to: executive.email,
        subject: subject,
        html: this.generateStatusUpdateTemplate(requestData, executive, status, comments, approver),
        text: `Your request ${requestData.request_number} has been ${statusMessages[status].toLowerCase()}.`
      };

      const result = await this.sendNotificationEmail(emailData, 'status_update', requestData.id, executive.id);
      console.log(`📧 Status update notification sent to ${executive.email}: ${status}`);

      return result;
    } catch (error) {
      console.error('Error sending status update notification:', error);
      throw error;
    }
  }

  /**
   * Send final approval notification with letters to executive
   * @param {Object} requestData - Request information
   * @param {Object} executive - Executive to notify
   * @param {Array} letterFiles - Array of letter file paths for attachments
   */
  async sendFinalApprovalNotification(requestData, executive, letterFiles = []) {
    try {
      const subject = `Request Approved - Letters Available - ${requestData.request_number}`;

      // Prepare attachments if letter files are provided
      const attachments = letterFiles.map(filePath => ({
        filename: `${requestData.request_number}_approval_letter.pdf`,
        path: filePath
      }));

      const emailData = {
        to: executive.email,
        subject: subject,
        html: this.generateFinalApprovalTemplate(requestData, executive),
        text: `Your request ${requestData.request_number} has been fully approved. Your approval letters are ready for download.`,
        attachments: attachments
      };

      const result = await this.sendNotificationEmail(emailData, 'final_approval', requestData.id, executive.id);
      console.log(`📧 Final approval notification sent to ${executive.email} with ${attachments.length} attachments`);

      return result;
    } catch (error) {
      console.error('Error sending final approval notification:', error);
      throw error;
    }
  }

  /**
   * Send notification email and log to database
   * @param {Object} emailData - Email configuration
   * @param {string} notificationType - Type of notification
   * @param {number} requestId - Related request ID
   * @param {number} recipientId - Recipient user ID
   */
  async sendNotificationEmail(emailData, notificationType, requestId, recipientId) {
    try {
      // Send email
      const emailResult = await this.gmailService.sendEmail(emailData);

      // Log notification to database
      await this.logNotification({
        request_id: requestId,
        recipient_id: recipientId,
        notification_type: notificationType,
        email_subject: emailData.subject,
        email_content: emailData.text || 'HTML content',
        html_content: emailData.html,
        email_to: emailData.to,
        sent_successfully: emailResult.success,
        message_id: emailResult.messageId || null,
        error_message: emailResult.error || null,
        is_mock: emailResult.mock || false
      });

      return emailResult;
    } catch (error) {
      console.error('Error in sendNotificationEmail:', error);

      // Still try to log the failed attempt
      try {
        await this.logNotification({
          request_id: requestId,
          recipient_id: recipientId,
          notification_type: notificationType,
          email_subject: emailData.subject,
          email_content: emailData.text || 'HTML content',
          html_content: emailData.html,
          email_to: emailData.to,
          sent_successfully: false,
          error_message: error.message,
          is_mock: false
        });
      } catch (logError) {
        console.error('Error logging failed notification:', logError);
      }

      throw error;
    }
  }

  /**
   * Log notification to database
   * @param {Object} notificationData - Notification data to log
   */
  async logNotification(notificationData) {
    try {
      const query = `
        INSERT INTO notifications (
          request_id, recipient_id, notification_type, subject,
          message, html_content, recipient_email, status,
          error_message, gmail_message_id, sent_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      const values = [
        notificationData.request_id,
        notificationData.recipient_id,
        notificationData.notification_type,
        notificationData.email_subject,
        notificationData.email_content,
        notificationData.html_content || null,
        notificationData.email_to,
        notificationData.sent_successfully ? 'sent' : 'failed',
        notificationData.error_message,
        notificationData.message_id,
        notificationData.sent_successfully ? new Date() : null
      ];

      await pool.execute(query, values);
      console.log(`📊 Notification logged: ${notificationData.notification_type} to ${notificationData.email_to}`);
    } catch (error) {
      console.error('Error logging notification to database:', error);
      // Don't throw here - logging failure shouldn't break email sending
    }
  }

  /**
   * Get notification history for a request
   * @param {number} requestId - Request ID
   */
  async getNotificationHistory(requestId) {
    try {
      const query = `
        SELECT
          n.*,
          u.first_name,
          u.last_name,
          u.email as recipient_email
        FROM notifications n
        LEFT JOIN users u ON n.recipient_id = u.id
        WHERE n.request_id = ?
        ORDER BY n.created_at DESC
      `;

      const [notifications] = await pool.execute(query, [requestId]);
      return notifications;
    } catch (error) {
      console.error('Error getting notification history:', error);
      throw error;
    }
  }

  /**
   * Test email service
   */
  async testEmailService() {
    try {
      const testResult = await this.gmailService.testConnection();
      return {
        ...testResult,
        serviceStatus: this.gmailService.getStatus()
      };
    } catch (error) {
      return {
        success: false,
        message: `Email service test failed: ${error.message}`
      };
    }
  }

  // Template generation methods using EmailTemplates
  generateNewRequestTemplate(requestData, executive, hr) {
    return EmailTemplates.newRequestNotification(requestData, executive, hr);
  }

  generateAssignmentTemplate(requestData, executive, assignedHR) {
    return EmailTemplates.requestAssignmentNotification(requestData, executive, assignedHR);
  }

  generateApprovalRequestTemplate(requestData, executive, approver, stage) {
    return EmailTemplates.approvalRequestNotification(requestData, executive, approver, stage);
  }

  generateStatusUpdateTemplate(requestData, executive, status, comments, approver) {
    return EmailTemplates.statusUpdateNotification(requestData, executive, status, comments, approver);
  }

  generateFinalApprovalTemplate(requestData, executive) {
    return EmailTemplates.finalApprovalNotification(requestData, executive);
  }

  /**
   * Send executive final approval notification with download links
   * @param {Object} requestData - Request information
   * @param {Object} executive - Executive who submitted the request
   * @param {Array} approvedFiles - Array of approved file information
   */
  async sendExecutiveFinalApprovalNotification(requestData, executive, approvedFiles = []) {
    try {
      const subject = `🎉 Executive Request Approved - Documents Ready - ${requestData.request_number}`;

      const emailData = {
        to: executive.email,
        subject: subject,
        html: this.generateExecutiveFinalApprovalTemplate(requestData, executive, approvedFiles),
        text: `Congratulations! Your executive checkup request ${requestData.request_number} has completed final HR clearance and is now fully approved. Your documents are ready for download.`
      };

      const result = await this.sendNotificationEmail(emailData, 'executive_final_approval', requestData.id, executive.id);
      console.log(`📧 Executive final approval notification sent to ${executive.email}`);

      return result;
    } catch (error) {
      console.error('Error sending executive final approval notification:', error);
      throw error;
    }
  }

  /**
   * Send executive final rejection notification
   * @param {Object} requestData - Request information
   * @param {Object} executive - Executive who submitted the request
   * @param {string} rejectionReason - Reason for rejection
   * @param {Object} rejectedBy - HR personnel who rejected the request
   */
  async sendExecutiveFinalRejectionNotification(requestData, executive, rejectionReason, rejectedBy) {
    try {
      const subject = `❌ Executive Request Rejected - Final Review - ${requestData.request_number}`;

      const emailData = {
        to: executive.email,
        subject: subject,
        html: this.generateExecutiveFinalRejectionTemplate(requestData, executive, rejectionReason, rejectedBy),
        text: `Your executive checkup request ${requestData.request_number} has been rejected during final HR clearance review. Reason: ${rejectionReason || 'No specific reason provided'}`
      };

      const result = await this.sendNotificationEmail(emailData, 'executive_final_rejection', requestData.id, executive.id);
      console.log(`📧 Executive final rejection notification sent to ${executive.email}`);

      return result;
    } catch (error) {
      console.error('Error sending executive final rejection notification:', error);
      throw error;
    }
  }

  // Template generation methods for new executive final notifications
  generateExecutiveFinalApprovalTemplate(requestData, executive, approvedFiles) {
    return EmailTemplates.executiveFinalApprovalNotification(requestData, executive, approvedFiles);
  }

  generateExecutiveFinalRejectionTemplate(requestData, executive, rejectionReason, rejectedBy) {
    return EmailTemplates.executiveFinalRejectionNotification(requestData, executive, rejectionReason, rejectedBy);
  }
}

module.exports = new EmailService();