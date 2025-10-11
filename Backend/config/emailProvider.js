const nodemailer = require('nodemailer');
const { Resend } = require('resend');
require('dotenv').config();

/**
 * Unified Email Service for MetroExecuCare
 * Supports both Gmail SMTP (fallback) and Resend (preferred for Railway)
 *
 * Priority:
 * 1. Resend (if RESEND_API_KEY is configured)
 * 2. Gmail SMTP (if GMAIL_USER and GMAIL_APP_PASSWORD are configured)
 */

class EmailService {
  constructor() {
    this.provider = null;
    this.resendClient = null;
    this.nodemailerTransporter = null;
    this.fromEmail = null;
    this.initializeProvider();
  }

  /**
   * Initialize email provider based on available credentials
   */
  initializeProvider() {
    try {
      // Debug: Log what environment variables are present
      console.log('🔍 [EMAIL PROVIDER DEBUG] Checking environment variables...');
      console.log(`   - RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'SET (length: ' + process.env.RESEND_API_KEY.length + ')' : 'NOT SET'}`);
      console.log(`   - FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
      console.log(`   - GMAIL_USER: ${process.env.GMAIL_USER ? 'SET' : 'NOT SET'}`);
      console.log(`   - GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET'}`);

      // Try Resend first (preferred for production/Railway)
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== '') {
        this.resendClient = new Resend(process.env.RESEND_API_KEY);
        this.provider = 'resend';
        this.fromEmail = process.env.FROM_EMAIL || 'MetroExecuCare <noreply@metroexecucare.com>';
        console.log('✅ Email service initialized with Resend');
        console.log(`   FROM: ${this.fromEmail}`);
        return;
      }

      // Fall back to Gmail SMTP
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        console.log('⚠️ RESEND_API_KEY not configured, falling back to Gmail SMTP');
        console.log('⚠️ WARNING: Gmail SMTP may not work on Railway due to port blocking!');
        this.nodemailerTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
        this.provider = 'gmail';
        this.fromEmail = `"MetroExecuCare" <${process.env.GMAIL_USER}>`;
        console.log('✅ Gmail SMTP service initialized (fallback mode)');
        return;
      }

      // No provider configured
      console.warn('⚠️ No email provider configured. Email notifications will be disabled.');
      console.warn('   Configure either RESEND_API_KEY or GMAIL_USER + GMAIL_APP_PASSWORD');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
    }
  }

  /**
   * Send an email using the configured provider
   * @param {Object} emailOptions - Email configuration
   * @param {string} emailOptions.to - Recipient email address
   * @param {string} emailOptions.subject - Email subject
   * @param {string} emailOptions.html - HTML email content
   * @param {string} emailOptions.text - Plain text email content (optional)
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.provider) {
        console.warn('⚠️ Email not sent: No email provider configured');
        return {
          success: false,
          message: 'Email service not configured'
        };
      }

      // Send via Resend
      if (this.provider === 'resend') {
        console.log(`📤 [RESEND] Attempting to send email to ${to}`);
        console.log(`   FROM: ${this.fromEmail}`);
        console.log(`   SUBJECT: ${subject}`);

        const result = await this.resendClient.emails.send({
          from: this.fromEmail,
          to: to,
          subject: subject,
          html: html,
          text: text || 'Please view this email in an HTML-compatible email client.'
        });

        console.log(`✅ Email sent via Resend to ${to}`);
        console.log(`   Message ID: ${result.data?.id || result.id || 'no-id'}`);
        console.log(`   Full result:`, JSON.stringify(result, null, 2));

        return {
          success: true,
          messageId: result.data?.id || result.id,
          provider: 'resend'
        };
      }

      // Send via Gmail SMTP (Nodemailer)
      if (this.provider === 'gmail') {
        const info = await this.nodemailerTransporter.sendMail({
          from: this.fromEmail,
          to: to,
          subject: subject,
          html: html,
          text: text || 'Please view this email in an HTML-compatible email client.'
        });

        console.log(`✅ Email sent via Gmail to ${to}: ${info.messageId}`);

        return {
          success: true,
          messageId: info.messageId,
          provider: 'gmail',
          response: info.response
        };
      }

      throw new Error('Unknown email provider');

    } catch (error) {
      console.error(`❌ Failed to send email via ${this.provider}:`, error.message);
      console.error(`   Error details:`, JSON.stringify(error, null, 2));
      if (error.response) {
        console.error(`   API Response:`, JSON.stringify(error.response, null, 2));
      }

      return {
        success: false,
        error: error.message,
        errorDetails: error.response || error,
        provider: this.provider
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

    console.log(`📧 Bulk email results: ${successCount} sent, ${failCount} failed (via ${this.provider})`);

    return results;
  }

  /**
   * Test email connection
   * @returns {Promise<boolean>} - Connection status
   */
  async testConnection() {
    try {
      if (!this.provider) {
        console.warn('⚠️ Cannot test connection: No email provider configured');
        return false;
      }

      if (this.provider === 'resend') {
        // Resend doesn't have a test connection method, but we can verify the API key exists
        console.log('✅ Resend connection ready (API key configured)');
        return true;
      }

      if (this.provider === 'gmail') {
        await this.nodemailerTransporter.verify();
        console.log('✅ Gmail SMTP connection test successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ ${this.provider} connection test failed:`, error.message);
      return false;
    }
  }

  /**
   * Get current provider name
   * @returns {string} - Provider name ('resend', 'gmail', or null)
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Get provider status
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      provider: this.provider,
      configured: this.provider !== null,
      fromEmail: this.fromEmail
    };
  }
}

// Export singleton instance
module.exports = new EmailService();
