// Use new unified email provider (supports both Resend and Gmail)
const emailProvider = require('../config/emailProvider');
const { pool } = require('../config/database/connection');
const EmailTemplates = require('../templates/email/emailTemplates');

/**
 * Email Service for MetroExecuCare
 * Handles all email notifications throughout the request approval workflow
 *
 * Email Provider: Automatically uses Resend (preferred) or Gmail SMTP (fallback)
 */

class EmailService {
  constructor() {
    this.emailProvider = emailProvider;
    // Log which provider is being used
    const status = this.emailProvider.getStatus();
    console.log(`📧 EmailService initialized with provider: ${status.provider || 'none'}`);
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
   * Send HR final verification notification
   * @param {Object} requestData - Request information
   * @param {Object} executive - Executive who submitted the request
   * @param {Object} hrPersonnel - HR personnel assigned to the request
   * @param {Object} welfareHead - Welfare head who approved
   */
  async sendHRFinalVerificationNotification(requestData, executive, hrPersonnel, welfareHead) {
    try {
      const subject = `Final Verification Required - ${requestData.request_number}`;

      const emailData = {
        to: hrPersonnel.email,
        subject: subject,
        html: this.generateHRFinalVerificationTemplate(requestData, executive, hrPersonnel, welfareHead),
        text: `Request ${requestData.request_number} has been approved by the Division Head and requires your final document verification.`
      };

      const result = await this.sendNotificationEmail(emailData, 'hr_final_verification', requestData.id, hrPersonnel.id);
      console.log(`📧 HR final verification notification sent to ${hrPersonnel.email}`);

      return result;
    } catch (error) {
      console.error('Error sending HR final verification notification:', error);
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
      console.log(`📧 [EMAIL DEBUG] Attempting to send: ${notificationType}`);
      console.log(`📧 [EMAIL DEBUG] To: ${emailData.to}`);
      console.log(`📧 [EMAIL DEBUG] Subject: ${emailData.subject}`);
      console.log(`📧 [EMAIL DEBUG] Request ID: ${requestId}`);

      // Send email
      const emailResult = await this.emailProvider.sendEmail(emailData);

      console.log(`📧 [EMAIL DEBUG] Email result:`, emailResult);

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
      console.error(`❌ [EMAIL DEBUG] Error in sendNotificationEmail (${notificationType}):`, error);

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
   * Map notification types to valid ENUM values in database
   * @param {string} notificationType - Notification type from code
   * @returns {string} - Valid ENUM value for database
   */
  mapNotificationTypeToEnum(notificationType) {
    const typeMapping = {
      'new_request': 'request_submitted',
      'request_assigned': 'request_assigned',
      'approval_request': 'benefits_review_started',
      'status_update': 'hr_processing_started',
      'final_approval': 'request_approved_final',
      'hr_final_verification': 'hr_approved',
      'executive_final_approval': 'request_approved_final',
      'executive_final_rejection': 'request_rejected',
      'file_request': 'file_requested',
      'file_uploaded': 'file_uploaded'
    };

    return typeMapping[notificationType] || 'request_submitted'; // Default fallback
  }

  /**
   * Log notification to database
   * @param {Object} notificationData - Notification data to log
   */
  async logNotification(notificationData) {
    try {
      // Map notification type to valid ENUM value
      const mappedType = this.mapNotificationTypeToEnum(notificationData.notification_type);

      // Validate required data and convert undefined to null
      const values = [
        notificationData.request_id || null,
        notificationData.recipient_id || null,
        mappedType,
        notificationData.email_subject || 'No subject',
        notificationData.email_content || 'No content',
        notificationData.html_content || null,
        notificationData.email_to || null,
        notificationData.sent_successfully ? 'sent' : 'failed',
        notificationData.error_message || null,
        notificationData.message_id || null,
        notificationData.sent_successfully ? new Date() : null
      ];

      // Only log if we have at minimum the email recipient
      if (!values[6]) {
        console.warn('⚠️  Cannot log notification: recipient_email is missing');
        return;
      }

      const query = `
        INSERT INTO notifications (
          request_id, recipient_id, notification_type, subject,
          message, html_content, recipient_email, status,
          error_message, gmail_message_id, sent_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      await pool.execute(query, values);
      console.log(`📊 Notification logged: ${notificationData.notification_type} to ${notificationData.email_to}`);
    } catch (error) {
      console.error('⚠️  Error logging notification to database:', error.message);
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
      const testResult = await this.emailProvider.testConnection();
      return {
        ...testResult,
        serviceStatus: this.emailProvider.getStatus()
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

  generateHRFinalVerificationTemplate(requestData, executive, hrPersonnel, welfareHead) {
    return EmailTemplates.hrFinalVerificationNotification(requestData, executive, hrPersonnel, welfareHead);
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

  /**
   * Send file request notification to executive
   * @param {Object} data - { to, executiveName, requesterName, requesterRole, requestId, requestType, message }
   */
  async sendFileRequestNotification(data) {
    try {
      const subject = `📎 Additional Files Requested - Request ${data.requestId}`;

      const emailData = {
        to: data.to,
        subject: subject,
        html: EmailTemplates.fileRequestNotification(data),
        text: `${data.requesterName} (${data.requesterRole}) has requested additional files for your request ${data.requestId}. Message: ${data.message}`
      };

      const result = await this.emailProvider.sendEmail(emailData);
      console.log(`📧 File request notification sent to ${data.to}`);

      return result;
    } catch (error) {
      console.error('Error sending file request notification:', error);
      throw error;
    }
  }

  /**
   * Send file uploaded notification to approver
   * @param {Object} data - { to, requesterName, executiveName, requestId }
   */
  async sendFileUploadedNotification(data) {
    try {
      const subject = `✅ Requested Files Uploaded - Request ${data.requestId}`;

      const emailData = {
        to: data.to,
        subject: subject,
        html: EmailTemplates.fileUploadedNotification(data),
        text: `${data.executiveName} has uploaded the files you requested for request ${data.requestId}.`
      };

      const result = await this.emailProvider.sendEmail(emailData);
      console.log(`📧 File uploaded notification sent to ${data.to}`);

      return result;
    } catch (error) {
      console.error('Error sending file uploaded notification:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();