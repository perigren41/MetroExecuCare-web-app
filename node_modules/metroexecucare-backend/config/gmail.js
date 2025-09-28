const nodemailer = require('nodemailer');

/**
 * Gmail Service for MetroExecuCare
 * This module handles Gmail App Password authentication and email sending functionality
 */

class GmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeService();
  }

  /**
   * Initialize Gmail service with App Password credentials
   */
  initializeService() {
    try {
      // Check if App Password is configured
      if (process.env.GMAIL_USE_APP_PASSWORD === 'true' &&
          process.env.GMAIL_USER_EMAIL &&
          process.env.GMAIL_APP_PASSWORD) {
        console.log('✅ Gmail service initialized with App Password');
        this.isConfigured = true;
        return;
      }

      console.warn('⚠️  Gmail service not configured. Missing environment variables: GMAIL_USER_EMAIL, GMAIL_APP_PASSWORD');
      console.warn('💡 Email notifications will be logged to console instead of being sent');
      this.isConfigured = false;

    } catch (error) {
      console.error('❌ Gmail service initialization failed:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Create Nodemailer transporter with Gmail App Password
   */
  async createTransporter() {
    try {
      if (!this.isConfigured) {
        throw new Error('Gmail service not properly configured');
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      console.log('✅ Gmail transporter created with App Password');
      return this.transporter;
    } catch (error) {
      console.error('❌ Failed to create Gmail transporter:', error.message);
      throw error;
    }
  }

  /**
   * Send email using Gmail App Password
   * @param {Object} emailData - Email configuration
   * @param {string} emailData.to - Recipient email
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.html - HTML content
   * @param {string} emailData.text - Plain text content (optional)
   * @param {Array} emailData.attachments - Attachments (optional)
   */
  async sendEmail(emailData) {
    try {
      if (!this.isConfigured) {
        // Fallback: Log email to console if Gmail not configured
        console.log('\n📧 EMAIL NOTIFICATION (Gmail not configured):');
        console.log(`📤 To: ${emailData.to}`);
        console.log(`📋 Subject: ${emailData.subject}`);
        console.log(`📄 Content: ${emailData.text || 'HTML content provided'}`);
        console.log('─'.repeat(50));
        return { success: true, messageId: 'console-log', mock: true };
      }

      // Ensure we have a fresh transporter
      if (!this.transporter) {
        await this.createTransporter();
      }

      const mailOptions = {
        from: `MetroExecuCare System <${process.env.GMAIL_USER_EMAIL}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments || []
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${emailData.to}`);
      console.log(`📧 Message ID: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      console.error(`❌ Failed to send email to ${emailData.to}:`, error.message);

      // Fallback: Log to console if sending fails
      console.log('\n📧 EMAIL NOTIFICATION (Failed to send, logging instead):');
      console.log(`📤 To: ${emailData.to}`);
      console.log(`📋 Subject: ${emailData.subject}`);
      console.log(`❌ Error: ${error.message}`);
      console.log('─'.repeat(50));

      return {
        success: false,
        error: error.message,
        fallbackLogged: true
      };
    }
  }

  /**
   * Test Gmail connection
   */
  async testConnection() {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          message: 'Gmail service not configured - missing environment variables'
        };
      }

      await this.createTransporter();

      return {
        success: true,
        message: 'Gmail service connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `Gmail connection failed: ${error.message}`
      };
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      hasTransporter: !!this.transporter,
      environment: process.env.NODE_ENV || 'development',
      method: 'App Password'
    };
  }
}

// Export singleton instance
module.exports = new GmailService();