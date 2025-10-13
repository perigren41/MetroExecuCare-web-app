/**
 * Email Templates for MetroExecuCare Notifications
 * Professional HTML email templates for all notification types
 */

const EmailTemplates = {
  /**
   * Helper function to format role names for display
   */
  formatRoleName(role) {
    const roleNames = {
      'hr_personnel': 'Human Resource Personnel',
      'benefits_officer': 'Benefits Officer',
      'welfare_head': 'Division Head',
      'admin': 'System Administrator',
      'executive': 'Executive'
    };
    return roleNames[role] || role;
  },

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
            background: linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%);
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
            background: linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%);
            border-left: 4px solid #3F6EC0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
            box-shadow: 0 2px 4px rgba(63, 110, 192, 0.1);
        }

        .info-box h3 {
            background: linear-gradient(90deg, #3F6EC0 0%, #5D3EA4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: bold;
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
            background: linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%);
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 8px rgba(63, 110, 192, 0.3);
        }

        .action-button:hover {
            background: linear-gradient(90deg, #2A5A9A 0%, #003A7F 29%, #4D2E84 57%, #693088 79%);
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(63, 110, 192, 0.4);
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
            background: linear-gradient(90deg, #3F6EC0 0%, #5D3EA4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
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
        <span class="detail-value">${executive.employee_number || executive.employee_id}</span>

        <span class="detail-label">Department:</span>
        <span class="detail-value">${executive.department}</span>

        <span class="detail-label">Request Type:</span>
        <span class="detail-value">${requestData.request_type === 'letter_of_approval' ? 'Letter of Approval' : requestData.request_type === 'letter_of_authorization' ? 'Letter of Authorization' : requestData.request_type}</span>

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

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
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
        <span class="detail-value">${requestData.request_type === 'letter_of_approval' ? 'Letter of Approval' : requestData.request_type === 'letter_of_authorization' ? 'Letter of Authorization' : requestData.request_type}</span>

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

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
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
        <span class="detail-value">${requestData.request_type === 'letter_of_approval' ? 'Letter of Approval' : requestData.request_type === 'letter_of_authorization' ? 'Letter of Authorization' : requestData.request_type}</span>

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

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
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
        <span class="detail-value">${approver ? `${approver.first_name} ${approver.last_name} (${this.formatRoleName(approver.role)})` : 'System Administrator'}</span>

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

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
    View Request Details
</a>`;

    return this.getBaseTemplate(content, `Request ${info.title} - MetroExecuCare`);
  },

  /**
   * Executive final approval notification with download links (after HR final verification)
   */
  executiveFinalApprovalNotification(requestData, executive, approvedFiles, hrPersonnel) {
    const approvalDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Handle hrPersonnel being undefined, array, or object
    let approverName = 'HR Personnel';
    if (hrPersonnel) {
      if (Array.isArray(hrPersonnel) && hrPersonnel.length > 0) {
        approverName = `${hrPersonnel[0].first_name} ${hrPersonnel[0].last_name}`;
      } else if (hrPersonnel.first_name) {
        approverName = `${hrPersonnel.first_name} ${hrPersonnel.last_name}`;
      }
    }

    const content = `
<h2 style="color: #28a745; margin-bottom: 20px;">🎉 Executive Clearance Complete - Request Approved!</h2>

<p>Dear ${executive.first_name} ${executive.last_name},</p>

<p><strong>Congratulations!</strong> Your executive checkup request has completed the final HR clearance review and is now fully approved.</p>

<div class="info-box">
    <h3>Executive Clearance Approval</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestData.request_number}</strong></span>

        <span class="detail-label">Request Type:</span>
        <span class="detail-value">${requestData.request_type === 'letter_of_approval' ? 'Letter of Approval' : 'Letter of Authorization'}</span>

        <span class="detail-label">Final Status:</span>
        <span class="detail-value"><span class="status approved">EXECUTIVE CLEARANCE COMPLETE</span></span>

        <span class="detail-label">Approval Date:</span>
        <span class="detail-value">${approvalDate}</span>

        <span class="detail-label">Approved By:</span>
        <span class="detail-value">${approverName} - Executive Clearance Review</span>
    </div>
</div>

<div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-bottom: 15px; color: #155724;">📄 Download Your Approved Documents</h3>
    <p style="margin-bottom: 15px;">Your official documents are now ready for download. Click the buttons below to download:</p>

    <div style="margin: 15px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/requests/${requestData.id}/download-latest-file"
           class="action-button"
           style="display: inline-block; margin-right: 15px; margin-bottom: 10px; background: linear-gradient(90deg, #28a745 0%, #20c997 100%); color: #ffffff !important; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);">
            📋 Download Approved File
        </a>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/requests/${requestData.id}/download-request-letter"
           class="action-button"
           style="display: inline-block; margin-bottom: 10px; background: linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%); color: #ffffff !important; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 8px rgba(63, 110, 192, 0.3);">
            📄 Download Request Letter
        </a>
    </div>

    <p style="font-size: 12px; margin-top: 15px; opacity: 0.8;">
        <strong>Note:</strong> If the download buttons don't work, you can access your documents by logging into the MetroExecuCare system.
    </p>
</div>

<div class="info-box">
    <h3>Important Information</h3>
    <ul>
        <li><strong>Hospital Information:</strong> ${requestData.hospital_name || 'As specified in your request'}</li>
        <li><strong>Checkup Date:</strong> ${requestData.approved_date ? new Date(requestData.approved_date).toLocaleDateString() : 'As arranged'}</li>
        <li><strong>Letter Purpose:</strong> ${requestData.letter_purpose}</li>
        <li><strong>Validity Period:</strong> 6 months from approval date</li>
    </ul>
</div>

<p><strong>Next Steps:</strong></p>
<ol>
    <li>Download your approved documents using the buttons above</li>
    <li>Contact your preferred healthcare provider or assigned hospital</li>
    <li>Present the approval documents during your visit</li>
    <li>Submit medical reports as required by company policy</li>
</ol>

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
    View Full Request Details
</a>

<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <strong>⚠️ Important Reminders:</strong>
    <ul>
        <li>Please bring a valid ID and the approval documents to your checkup</li>
        <li>Your approval is valid for 6 months from the issue date</li>
        <li>Contact ${hrPersonnel ? `${hrPersonnel.first_name} ${hrPersonnel.last_name} at ${hrPersonnel.email}` : 'your Human Resource representative'} if you have any questions about your coverage</li>
        <li>Keep copies of all documents for your records</li>
    </ul>
</div>

<p>Thank you for using the MetroExecuCare system. We wish you good health!</p>`;

    return this.getBaseTemplate(content, 'Executive Request Approved - Download Your Documents');
  },

  /**
   * Executive final rejection notification (after HR final verification)
   */
  executiveFinalRejectionNotification(requestData, executive, rejectionReason, rejectedBy, hrPersonnel) {
    const rejectionDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const content = `
<h2 style="color: #dc3545; margin-bottom: 20px;">❌ Executive Request Rejected - Final Review</h2>

<p>Dear ${executive.first_name} ${executive.last_name},</p>

<p>We regret to inform you that your executive checkup request has been rejected during the final HR clearance review.</p>

<div class="info-box">
    <h3>Rejection Details</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestData.request_number}</strong></span>

        <span class="detail-label">Request Type:</span>
        <span class="detail-value">${requestData.request_type === 'letter_of_approval' ? 'Letter of Approval' : 'Letter of Authorization'}</span>

        <span class="detail-label">Status:</span>
        <span class="detail-value"><span class="status rejected">REJECTED</span></span>

        <span class="detail-label">Rejection Date:</span>
        <span class="detail-value">${rejectionDate}</span>

        <span class="detail-label">Rejected By:</span>
        <span class="detail-value">${rejectedBy ? `${rejectedBy.first_name} ${rejectedBy.last_name}` : 'HR Personnel'} - Executive Clearance Review</span>
    </div>
</div>

${rejectionReason ? `
<div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <h3 style="color: #721c24; margin-bottom: 10px;">Reason for Rejection</h3>
    <p>${rejectionReason}</p>
</div>
` : ''}

<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0;">
    <strong>What happens next:</strong>
    <ul>
        <li>Review the rejection reason carefully</li>
        <li>You may submit a new request addressing the issues mentioned</li>
        <li>Contact your Human Resource representative for clarification if needed</li>
        <li>Ensure all required documentation is complete before resubmitting</li>
    </ul>
</div>

<p><strong>To submit a new request:</strong></p>
<ol>
    <li>Log into the MetroExecuCare system</li>
    <li>Create a new executive checkup request</li>
    <li>Address the rejection reasons mentioned above</li>
    <li>Ensure all required documents are properly attached</li>
</ol>

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
    Submit New Request
</a>

<div class="info-box">
    <h3>Need Help?</h3>
    <p>If you have questions about this rejection or need assistance with your next submission:</p>
    <ul>
        <li>Contact your Human Resource department</li>
        <li>Review the company's executive health checkup policy</li>
        <li>Speak with your assigned HR representative</li>
    </ul>
</div>

<p>We apologize for any inconvenience and look forward to processing your revised request.</p>`;

    return this.getBaseTemplate(content, 'Executive Request Rejected - Action Required');
  },

  /**
   * Final approval notification template (for Executive) - ORIGINAL
   */
  finalApprovalNotification(requestData, executive, hrPersonnel) {
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

<div style="margin: 15px 0;">
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/requests/${requestData.id}/download-latest-file"
       class="action-button"
       style="display: inline-block; margin-right: 15px; margin-bottom: 10px; background: linear-gradient(90deg, #28a745 0%, #20c997 100%); color: #ffffff !important; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);">
        📋 Download Approved Letter
    </a>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/requests/${requestData.id}/download-executive-file"
       class="action-button"
       style="display: inline-block; margin-bottom: 10px; background: linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%); color: #ffffff !important; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 8px rgba(63, 110, 192, 0.3);">
        📄 Download Original Request
    </a>
</div>

<div class="info-box">
    <h3>Important Reminders</h3>
    <ul>
        <li>Your approval is valid for 6 months from the issue date</li>
        <li>Please bring a valid ID and the approval letters to your checkup</li>
        <li>Contact ${hrPersonnel ? `${hrPersonnel.first_name} ${hrPersonnel.last_name} at ${hrPersonnel.email}` : 'your Human Resource representative'} if you have any questions about your coverage</li>
        <li>Submit your medical reports as required by company policy</li>
    </ul>
</div>

<p>Thank you for using the MetroExecuCare system. We wish you good health!</p>`;

    return this.getBaseTemplate(content, 'Request Approved - Download Your Letters');
  },

  /**
   * HR Final Verification Task Notification
   */
  hrFinalVerificationNotification(requestData, executive, hrPersonnel, welfareHead) {
    const content = `
<h2 style="color: #2c5aa0; margin-bottom: 20px;">📋 Final Document Verification Required</h2>

<p>Dear ${hrPersonnel.first_name} ${hrPersonnel.last_name},</p>

<p>Request <strong>${requestData.request_number}</strong> has been approved by the <strong>Division Head</strong> and is now ready for your final document verification and clearance.</p>

<div class="info-box">
    <h3>Request Information</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestData.request_number}</strong></span>

        <span class="detail-label">Executive:</span>
        <span class="detail-value">${executive.first_name} ${executive.last_name}</span>

        <span class="detail-label">Department:</span>
        <span class="detail-value">${executive.department}</span>

        <span class="detail-label">Request Type:</span>
        <span class="detail-value">${requestData.request_type === 'letter_of_approval' ? 'Letter of Approval' : 'Letter of Authorization'}</span>

        <span class="detail-label">Approved By:</span>
        <span class="detail-value">${welfareHead ? `${welfareHead.first_name} ${welfareHead.last_name}` : 'Division Head'}</span>
    </div>
</div>

<div class="urgent">
    <strong>✅ Final Step:</strong> This request has completed all approval stages. Please verify all documents and send the final approval letter to the executive.
</div>

<p><strong>Your responsibilities for final verification:</strong></p>
<ul>
    <li>Review all uploaded documents for completeness</li>
    <li>Verify all approval signatures are in place</li>
    <li>Generate and attach the final approval letter</li>
    <li>Complete the request and notify the executive</li>
</ul>

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
    Complete Final Verification
</a>

<p><strong>Note:</strong> The executive is waiting for your final clearance to proceed with their scheduled checkup.</p>`;

    return this.getBaseTemplate(content, 'Final Verification Required - MetroExecuCare');
  },

  /**
   * File Request Notification - Approver requests additional files from executive
   * @param {Object} data - { to, executiveName, requesterName, requesterRole, requestNumber, requestType, message }
   */
  fileRequestNotification(data) {
    const { executiveName, requesterName, requesterRole, requestNumber, requestType, message } = data;

    const content = `
<h2 style="color: #2c5aa0; margin-bottom: 20px;">📎 Additional Files Requested</h2>

<p>Dear ${executiveName},</p>

<p>The <strong>${requesterRole}</strong> reviewing your checkup request has requested additional files to complete their review.</p>

<div class="info-box">
    <h3>Request Information</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestNumber}</strong></span>

        <span class="detail-label">Request Type:</span>
        <span class="detail-value">${requestType === 'letter_of_approval' ? 'Letter of Approval' : 'Letter of Authorization'}</span>

        <span class="detail-label">Requested By:</span>
        <span class="detail-value">${requesterName} (${requesterRole})</span>
    </div>
</div>

<div class="info-box" style="border-left-color: #f59e0b;">
    <h3 style="color: #f59e0b;">📝 Message from ${requesterRole}</h3>
    <p style="margin: 10px 0; font-style: italic; color: #666;">"${message}"</p>
</div>

<div class="urgent">
    <strong>⚠️ Action Required:</strong> Please upload the requested files as soon as possible to avoid delays in processing your request.
</div>

<p><strong>How to upload the requested files:</strong></p>
<ol>
    <li>Log in to MetroExecuCare</li>
    <li>Go to your LOA Status Tracker</li>
    <li>Click "View Full Details" on your request</li>
    <li>Upload the requested files in the file request section</li>
</ol>

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
    Upload Files Now
</a>

<p><strong>Note:</strong> Your request review will resume once the requested files are uploaded.</p>`;

    return this.getBaseTemplate(content, 'Additional Files Requested - MetroExecuCare');
  },

  /**
   * File Uploaded Notification - Executive uploaded requested files
   * @param {Object} data - { to, requesterName, executiveName, requestNumber }
   */
  fileUploadedNotification(data) {
    const { requesterName, executiveName, requestNumber } = data;

    const content = `
<h2 style="color: #2c5aa0; margin-bottom: 20px;">✅ Requested Files Uploaded</h2>

<p>Dear ${requesterName},</p>

<p><strong>${executiveName}</strong> has uploaded the files you requested for their checkup request.</p>

<div class="info-box">
    <h3>Request Information</h3>
    <div class="detail-grid">
        <span class="detail-label">Request Number:</span>
        <span class="detail-value"><strong>${requestNumber}</strong></span>

        <span class="detail-label">Executive:</span>
        <span class="detail-value">${executiveName}</span>

        <span class="detail-label">Status:</span>
        <span class="detail-value">Files Uploaded</span>
    </div>
</div>

<div class="urgent">
    <strong>📋 Next Steps:</strong> Please review the uploaded files and continue processing the request.
</div>

<p><strong>To review the files:</strong></p>
<ol>
    <li>Log in to MetroExecuCare</li>
    <li>Navigate to Pending Requests</li>
    <li>Open request ${requestNumber}</li>
    <li>Review the newly uploaded files</li>
    <li>Continue with the approval process</li>
</ol>

<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="action-button">
    Review Files Now
</a>

<p><strong>Note:</strong> All requested files have been uploaded. You can now proceed with your review.</p>`;

    return this.getBaseTemplate(content, 'Files Uploaded - MetroExecuCare');
  }
};

module.exports = EmailTemplates;