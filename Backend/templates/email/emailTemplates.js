/**
 * Email Templates for MetroExecuCare Notifications
 * Professional HTML email templates for all notification types
 */

const EmailTemplates = {
  /**
   * Base template wrapper for all emails
   */
  getBaseTemplate(content, title = 'MetroExecuCare Notification') {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #2c5aa0 0%, #1e3f72 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }

        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 14px;
            opacity: 0.9;
        }

        .content {
            padding: 30px 20px;
        }

        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #2c5aa0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }

        .info-box h3 {
            color: #2c5aa0;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 10px;
            margin: 15px 0;
        }

        .detail-label {
            font-weight: bold;
            color: #666;
        }

        .detail-value {
            color: #333;
        }

        .action-button {
            display: inline-block;
            background-color: #2c5aa0;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }

        .action-button:hover {
            background-color: #1e3f72;
        }

        .status {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            display: inline-block;
        }

        .status.pending {
            background-color: #fff3cd;
            color: #856404;
        }

        .status.approved {
            background-color: #d4edda;
            color: #155724;
        }

        .status.rejected {
            background-color: #f8d7da;
            color: #721c24;
        }

        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #666;
        }

        .footer a {
            color: #2c5aa0;
            text-decoration: none;
        }

        .urgent {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }

        @media (max-width: 600px) {
            .detail-grid {
                grid-template-columns: 1fr;
                gap: 5px;
            }

            .content {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>MetroExecuCare</h1>
            <p>Executive Health Checkup Management System</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>MetroExecuCare System</strong> | Metrobank</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>For support, contact your Human Resource department or system administrator.</p>
        </div>
    </div>
</body>
</html>`;
  },

  /**
   * New request notification template (for HR Personnel)
   */
  newRequestNotification(requestData, executive, hrPersonnel) {
    const dueDate = new Date(requestData.due_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const content = `
<h2 style="color: #2c5aa0; margin-bottom: 20px;">🔔 New Executive Checkup Request</h2>

<p>Dear ${hrPersonnel.first_name} ${hrPersonnel.last_name},</p>

<p>A new executive checkup request has been submitted and requires Human Resource review and processing.</p>

<div class="info-box">
    <h3>Request Details</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestData.request_number}</strong></span>

        <span class="detail-label">Executive:</span>
        <span class="detail-value">${executive.first_name} ${executive.last_name}</span>

        <span class="detail-label">Employee ID:</span>
        <span class="detail-value">${executive.employee_id}</span>

        <span class="detail-label">Department:</span>
        <span class="detail-value">${executive.department}</span>

        <span class="detail-label">Request Type:</span>
        <span class="detail-value">${requestData.request_type}</span>

        <span class="detail-label">Due Date:</span>
        <span class="detail-value">${dueDate}</span>

        <span class="detail-label">Status:</span>
        <span class="detail-value"><span class="status pending">Pending Human Resource Review</span></span>
    </div>
</div>

<div class="urgent">
    <strong>⏰ Action Required:</strong> This request needs to be reviewed and assigned to an Human Resource personnel within 2 business days.
</div>

<p>Please log into the MetroExecuCare system to:</p>
<ul>
    <li>Review the executive's request details</li>
    <li>Claim/assign the request for processing</li>
    <li>Begin the approval workflow</li>
</ul>

<a href="${process.env.FRONTEND_URL}/requests/${requestData.id}" class="action-button">
    View Request Details
</a>

<p><strong>Important:</strong> All requests must be processed within 15 working days to ensure timely healthcare access for our executives.</p>`;

    return this.getBaseTemplate(content, 'New Request - MetroExecuCare');
  },

  /**
   * Request assignment notification template (for assigned HR)
   */
  requestAssignmentNotification(requestData, executive, assignedHR) {
    const content = `
<h2 style="color: #2c5aa0; margin-bottom: 20px;">📋 Request Assigned to You</h2>

<p>Dear ${assignedHR.first_name} ${assignedHR.last_name},</p>

<p>Request <strong>${requestData.request_number}</strong> has been assigned to you for processing.</p>

<div class="info-box">
    <h3>Assignment Details</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestData.request_number}</strong></span>

        <span class="detail-label">Executive:</span>
        <span class="detail-value">${executive.first_name} ${executive.last_name}</span>

        <span class="detail-label">Contact:</span>
        <span class="detail-value">${executive.email}</span>

        <span class="detail-label">Request Type:</span>
        <span class="detail-value">${requestData.request_type}</span>

        <span class="detail-label">Priority:</span>
        <span class="detail-value">Standard (15 working days)</span>
    </div>
</div>

<p>As the assigned Human Resource personnel, you are responsible for:</p>
<ul>
    <li>Reviewing the executive's submitted documents</li>
    <li>Processing the request through initial Human Resource validation</li>
    <li>Forwarding to Benefits Officer for approval</li>
    <li>Generating final approval letters upon completion</li>
</ul>

<a href="${process.env.FRONTEND_URL}/requests/${requestData.id}" class="action-button">
    Start Processing Request
</a>`;

    return this.getBaseTemplate(content, 'Request Assignment - MetroExecuCare');
  },

  /**
   * Approval request notification template (for Benefits Officer / Welfare Head)
   */
  approvalRequestNotification(requestData, executive, approver, stage) {
    const stageInfo = {
      'hr_review': {
        title: 'Human Resource Approval Required',
        role: 'Human Resource Personnel',
        description: 'provide final approval for this executive checkup request'
      },
      'benefits_review': {
        title: 'Benefits Officer Approval Required',
        role: 'Benefits Officer',
        description: 'review and approve the benefits allocation for this executive checkup request'
      },
      'welfare_review': {
        title: 'Employee Welfare Division Head Approval Required',
        role: 'Employee Welfare Division Head',
        description: 'provide final approval for this executive checkup request'
      }
    };

    const info = stageInfo[stage];

    const content = `
<h2 style="color: #2c5aa0; margin-bottom: 20px;">✅ ${info.title}</h2>

<p>Dear ${approver.first_name} ${approver.last_name},</p>

<p>Request <strong>${requestData.request_number}</strong> has reached your approval stage and requires your review.</p>

<div class="info-box">
    <h3>Request Information</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestData.request_number}</strong></span>

        <span class="detail-label">Executive:</span>
        <span class="detail-value">${executive.first_name} ${executive.last_name}</span>

        <span class="detail-label">Department:</span>
        <span class="detail-value">${executive.department}</span>

        <span class="detail-label">Position:</span>
        <span class="detail-value">${executive.position}</span>

        <span class="detail-label">Request Type:</span>
        <span class="detail-value">${requestData.request_type}</span>

    </div>
</div>

<div class="urgent">
    <strong>🔍 Your Action:</strong> Please ${info.description}.
</div>

<p>You can:</p>
<ul>
    <li><strong>Approve:</strong> Move the request to the next stage</li>
    <li><strong>Reject:</strong> Decline the request with comments</li>
    <li><strong>Request More Info:</strong> Ask for additional documentation</li>
</ul>

<a href="${process.env.FRONTEND_URL}/requests/${requestData.id}" class="action-button">
    Review & Approve Request
</a>`;

    return this.getBaseTemplate(content, `Approval Required - MetroExecuCare`);
  },

  /**
   * Status update notification template (for Executive)
   */
  statusUpdateNotification(requestData, executive, status, comments, approver) {
    const statusInfo = {
      'accepted': {
        icon: '✅',
        color: '#28a745',
        title: 'Request Accepted',
        message: 'Great news! Your executive checkup request has been accepted and will now be processed further. Keep an eye out for upcoming notifications.'
      },
      'rejected': {
        icon: '❌',
        color: '#dc3545',
        title: 'Request Rejected',
        message: 'Unfortunately, your executive checkup request has been rejected.'
      },
      'pending': {
        icon: '⏳',
        color: '#ffc107',
        title: 'Request Under Review',
        message: 'Your request is currently being reviewed by our team.'
      },
      'completed': {
        icon: '🎉',
        color: '#28a745',
        title: 'Request Completed',
        message: 'Your executive checkup request has been fully processed and completed.'
      }
    };

    const info = statusInfo[status];

    const content = `
<h2 style="color: ${info.color}; margin-bottom: 20px;">${info.icon} ${info.title}</h2>

<p>Dear ${executive.first_name} ${executive.last_name},</p>

<p>${info.message}</p>

<div class="info-box">
    <h3>Request Status Update</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestData.request_number}</strong></span>

        <span class="detail-label">New Status:</span>
        <span class="detail-value"><span class="status ${status}">${status.toUpperCase()}</span></span>

        <span class="detail-label">Updated By:</span>
        <span class="detail-value">${approver ? `${approver.first_name} ${approver.last_name} (${approver.role || approver.position || 'HR Personnel'})` : 'System Administrator'}</span>

        <span class="detail-label">Date:</span>
        <span class="detail-value">${new Date().toLocaleDateString()}</span>
    </div>
</div>

${comments ? `
<div class="info-box">
    <h3>Comments from ${approver ? `${approver.first_name} ${approver.last_name}` : 'System Administrator'}</h3>
    <p>${comments}</p>
</div>
` : ''}

${status === 'approved' ? `
<p><strong>Next Steps:</strong></p>
<ul>
    <li>Your request will proceed to the next approval stage</li>
    <li>You will receive additional notifications as the process continues</li>
    <li>Final approval letters will be sent once all approvals are complete</li>
</ul>
` : ''}

${status === 'rejected' ? `
<div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <strong>What happens next:</strong>
    <ul>
        <li>You may submit a new request addressing the rejection reasons</li>
        <li>Contact your Human Resource representative for clarification if needed</li>
        <li>Review the comments above for specific improvement areas</li>
    </ul>
</div>
` : ''}

<a href="${process.env.FRONTEND_URL}/requests/${requestData.id}" class="action-button">
    View Request Details
</a>`;

    return this.getBaseTemplate(content, `Request ${info.title} - MetroExecuCare`);
  },

  /**
   * Final approval notification template (for Executive)
   */
  finalApprovalNotification(requestData, executive) {
    const content = `
<h2 style="color: #28a745; margin-bottom: 20px;">🎉 Request Fully Approved!</h2>

<p>Dear ${executive.first_name} ${executive.last_name},</p>

<p><strong>Congratulations!</strong> Your executive checkup request has received all required approvals and is now complete.</p>

<div class="info-box">
    <h3>Final Approval Details</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestData.request_number}</strong></span>

        <span class="detail-label">Final Status:</span>
        <span class="detail-value"><span class="status approved">FULLY APPROVED</span></span>

        <span class="detail-label">Completion Date:</span>
        <span class="detail-value">${new Date().toLocaleDateString()}</span>

        <span class="detail-label">Processing Time:</span>
        <span class="detail-value">Completed within required timeframe</span>
    </div>
</div>

<div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <h3 style="margin-bottom: 10px;">📄 Your Approval Letters Are Ready</h3>
    <p>Your official approval letters have been generated and are available for download:</p>
    <ul>
        <li><strong>Request Letter:</strong> Your initial request letter</li>
        <li><strong>Approval Letter:</strong>  For proceeding with your checkup with all required signatures</li>
    </ul>
</div>

<p><strong>Next Steps:</strong></p>
<ol>
    <li>Download your approval letters from the system</li>
    <li>Contact your preferred healthcare provider</li>
    <li>Schedule your executive checkup appointment</li>
    <li>Present the approval letters during your visit</li>
</ol>

<a href="${process.env.FRONTEND_URL}/requests/${requestData.id}" class="action-button">
    Download Your Approval Letters
</a>

<div class="info-box">
    <h3>Important Reminders</h3>
    <ul>
        <li>Your approval is valid for 6 months from the issue date</li>
        <li>Please bring a valid ID and the approval letters to your checkup</li>
        <li>Contact Human Resource if you have any questions about your coverage</li>
        <li>Submit your medical reports as required by company policy</li>
    </ul>
</div>

<p>Thank you for using the MetroExecuCare system. We wish you good health!</p>`;

    return this.getBaseTemplate(content, 'Request Approved - Download Your Letters');
  }
};

module.exports = EmailTemplates;