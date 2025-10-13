const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Gmail Service Configuration for MetroExecuCare
 * Handles email sending through Gmail SMTP or OAuth2
 */

class GmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize the email transporter
   */
  initializeTransporter() {
    try {
      // Check if Gmail credentials are configured
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('⚠️ Gmail credentials not configured. Email notifications will be disabled.');
        return;
      }

      // Create transporter using Gmail SMTP
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      console.log('✅ Gmail service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gmail service:', error.message);
    }
  }

  /**
   * Send an email
   * @param {Object} emailOptions - Email configuration
   * @param {string} emailOptions.to - Recipient email address
   * @param {string} emailOptions.subject - Email subject
   * @param {string} emailOptions.html - HTML email content
   * @param {string} emailOptions.text - Plain text email content (fallback)
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      // If transporter is not initialized, return early
      if (!this.transporter) {
        console.warn('⚠️ Email not sent: Gmail service not configured');
        return {
          success: false,
          message: 'Email service not configured'
        };
      }

      // Send email
      const info = await this.transporter.sendMail({
        from: `"MetroExecuCare" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || 'Please view this email in an HTML-compatible email client.'
      });

      console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk emails
   * @param {Array<Object>} emailList - Array of email configurations
   * @returns {Promise<Array>} - Array of send results
   */
  async sendBulkEmails(emailList) {
    const results = await Promise.allSettled(
      emailList.map(email => this.sendEmail(email))
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;

    console.log(`📧 Bulk email results: ${successCount} sent, ${failCount} failed`);

    return results;
  }

  /**
   * Test email connection
   * @returns {Promise<boolean>} - Connection status
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        console.warn('⚠️ Cannot test connection: Gmail service not configured');
        return false;
      }

      await this.transporter.verify();
      console.log('✅ Gmail connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Gmail connection test failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new GmailService();
