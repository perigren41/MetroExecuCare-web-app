const express = require('express');
const router = express.Router();
const EmailTemplates = require('../templates/email/emailTemplates');

// Test data for email templates
const mockRequestData = {
    id: 1,
    request_number: 'REQ20241228001',
    request_type: 'letter_of_approval',
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    letter_purpose: 'Annual executive health checkup for cardiovascular and general wellness assessment',
    hospital_name: 'Makati Medical Center',
    approved_date: '2024-12-28',
    created_at: new Date()
};

const mockExecutive = {
    first_name: 'Juan Carlos',
    last_name: 'Santos',
    email: 'juan.santos@metrobank.com.ph',
    employee_number: 'EMP2024001',
    employee_id: 'EMP2024001',
    department: 'Executive Management',
    position: 'Senior Vice President',
    contact_number: '+63 917 123 4567'
};

const mockHRPersonnel = {
    first_name: 'Maria',
    last_name: 'Rodriguez',
    email: 'maria.rodriguez@metrobank.com.ph',
    employee_id: 'HR2024001',
    department: 'Human Resources',
    position: 'HR Manager'
};

const mockApprover = {
    first_name: 'Roberto',
    last_name: 'Cruz',
    email: 'roberto.cruz@metrobank.com.ph',
    role: 'Benefits Officer',
    position: 'Benefits Officer'
};

const mockApprovedFiles = [
    { filename: 'approval_letter_final.pdf', path: '/uploads/approval_letter_final.pdf' },
    { filename: 'executive_request_original.pdf', path: '/uploads/executive_request_original.pdf' }
];

// GET /api/test/email-templates - Test all email templates
router.get('/email-templates', (req, res) => {
    try {
        const templates = {
            newRequestNotification: EmailTemplates.newRequestNotification(mockRequestData, mockExecutive, mockHRPersonnel),
            requestAssignmentNotification: EmailTemplates.requestAssignmentNotification(mockRequestData, mockExecutive, mockHRPersonnel),
            approvalRequestNotification: EmailTemplates.approvalRequestNotification(mockRequestData, mockExecutive, mockApprover, 'benefits_review'),
            statusUpdateNotification: EmailTemplates.statusUpdateNotification(mockRequestData, mockExecutive, 'accepted', 'Request has been approved for processing', mockApprover),
            executiveFinalApprovalNotification: EmailTemplates.executiveFinalApprovalNotification(mockRequestData, mockExecutive, mockApprovedFiles, mockHRPersonnel),
            executiveFinalRejectionNotification: EmailTemplates.executiveFinalRejectionNotification(mockRequestData, mockExecutive, 'Incomplete documentation provided', mockHRPersonnel, mockHRPersonnel),
            finalApprovalNotification: EmailTemplates.finalApprovalNotification(mockRequestData, mockExecutive, mockHRPersonnel),
            hrFinalVerificationNotification: EmailTemplates.hrFinalVerificationNotification(mockRequestData, mockExecutive, mockHRPersonnel, mockApprover),
            fileRequestNotification: EmailTemplates.fileRequestNotification({
                executiveName: `${mockExecutive.first_name} ${mockExecutive.last_name}`,
                requesterName: `${mockApprover.first_name} ${mockApprover.last_name}`,
                requesterRole: EmailTemplates.formatRoleName(mockApprover.role),
                requestNumber: mockRequestData.request_number,
                requestType: mockRequestData.request_type,
                message: 'Please upload a copy of your recent medical certificate and blood test results from the last 6 months.'
            }),
            fileUploadedNotification: EmailTemplates.fileUploadedNotification({
                requesterName: `${mockApprover.first_name} ${mockApprover.last_name}`,
                executiveName: `${mockExecutive.first_name} ${mockExecutive.last_name}`,
                requestNumber: mockRequestData.request_number
            })
        };

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MetroExecuCare Email Templates Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .template-section { margin-bottom: 40px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .template-title { background: linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%); color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; font-size: 18px; font-weight: bold; }
        .template-preview { border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .template-iframe { width: 100%; height: 600px; border: none; }
        .navigation { position: fixed; top: 20px; right: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; }
        .navigation a { display: block; margin: 5px 0; color: #3F6EC0; text-decoration: none; padding: 5px 10px; border-radius: 3px; }
        .navigation a:hover { background: #f0f8ff; }
        .info-box { background: #e8f4fd; border-left: 4px solid #3F6EC0; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    </style>
</head>
<body>
    <div class="navigation">
        <strong>🧪 Email Templates Test</strong>
        <a href="#new-request">New Request</a>
        <a href="#assignment">Assignment</a>
        <a href="#approval-request">Approval Request</a>
        <a href="#status-update">Status Update</a>
        <a href="#final-approval">Final Approval</a>
        <a href="#final-rejection">Final Rejection</a>
        <a href="#original-approval">Original Approval</a>
        <a href="#hr-verification">HR Verification</a>
        <a href="#file-request">File Request</a>
        <a href="#file-uploaded">File Uploaded</a>
    </div>

    <div class="container">
        <h1 style="text-align: center; color: #3F6EC0; margin-bottom: 10px;">📧 MetroExecuCare Email Templates Test</h1>
        <p style="text-align: center; color: #666; margin-bottom: 40px;">Testing all email templates with mock data to verify design and functionality</p>

        <div class="info-box">
            <strong>📋 Test Information:</strong>
            <ul>
                <li><strong>Request Number:</strong> ${mockRequestData.request_number}</li>
                <li><strong>Executive:</strong> ${mockExecutive.first_name} ${mockExecutive.last_name}</li>
                <li><strong>Request Type:</strong> ${mockRequestData.request_type === 'letter_of_approval' ? 'Letter of Approval' : 'Letter of Authorization'}</li>
                <li><strong>Test Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
        </div>

        <div id="new-request" class="template-section">
            <div class="template-title">1. 🔔 New Request Notification (to HR Personnel)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.newRequestNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="assignment" class="template-section">
            <div class="template-title">2. 📋 Request Assignment Notification (to assigned HR)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.requestAssignmentNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="approval-request" class="template-section">
            <div class="template-title">3. ✅ Approval Request Notification (to Benefits Officer/Welfare Head)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.approvalRequestNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="status-update" class="template-section">
            <div class="template-title">4. 📝 Status Update Notification (to Executive)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.statusUpdateNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="final-approval" class="template-section">
            <div class="template-title">5. 🎉 Executive Final Approval Notification (with downloads)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.executiveFinalApprovalNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="final-rejection" class="template-section">
            <div class="template-title">6. ❌ Executive Final Rejection Notification</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.executiveFinalRejectionNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="original-approval" class="template-section">
            <div class="template-title">7. 🎊 Final Approval Notification (Original)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.finalApprovalNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="hr-verification" class="template-section">
            <div class="template-title">8. 📋 HR Final Verification Task (to HR Personnel)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.hrFinalVerificationNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="file-request" class="template-section">
            <div class="template-title">9. 📎 Additional Files Requested (to Executive)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.fileRequestNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div id="file-uploaded" class="template-section">
            <div class="template-title">10. ✅ Requested Files Uploaded (to Approver)</div>
            <div class="template-preview">
                <iframe class="template-iframe" srcdoc="${templates.fileUploadedNotification.replace(/"/g, '&quot;')}"></iframe>
            </div>
        </div>

        <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #3F6EC0;">✅ Email Templates Test Complete</h3>
            <p style="color: #666;">All 10 templates have been generated successfully with mock data.</p>
            <p style="color: #666; font-size: 12px;">Generated at: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('Email template test error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate email templates',
            details: error.message
        });
    }
});

// GET /api/test/email-templates/:templateName - Test specific template
router.get('/email-templates/:templateName', (req, res) => {
    try {
        const { templateName } = req.params;
        let template;

        switch (templateName) {
            case 'new-request':
                template = EmailTemplates.newRequestNotification(mockRequestData, mockExecutive, mockHRPersonnel);
                break;
            case 'assignment':
                template = EmailTemplates.requestAssignmentNotification(mockRequestData, mockExecutive, mockHRPersonnel);
                break;
            case 'approval-request':
                template = EmailTemplates.approvalRequestNotification(mockRequestData, mockExecutive, mockApprover, 'benefits_review');
                break;
            case 'status-update':
                template = EmailTemplates.statusUpdateNotification(mockRequestData, mockExecutive, 'approved', 'Request has been approved for processing', mockApprover);
                break;
            case 'final-approval':
                template = EmailTemplates.executiveFinalApprovalNotification(mockRequestData, mockExecutive, mockApprovedFiles, mockHRPersonnel);
                break;
            case 'final-rejection':
                template = EmailTemplates.executiveFinalRejectionNotification(mockRequestData, mockExecutive, 'Incomplete documentation provided', mockHRPersonnel, mockHRPersonnel);
                break;
            case 'original-approval':
                template = EmailTemplates.finalApprovalNotification(mockRequestData, mockExecutive, mockHRPersonnel);
                break;
            default:
                return res.status(404).json({
                    success: false,
                    error: 'Template not found',
                    available: ['new-request', 'assignment', 'approval-request', 'status-update', 'final-approval', 'final-rejection', 'original-approval']
                });
        }

        res.send(template);
    } catch (error) {
        console.error('Email template test error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate email template',
            details: error.message
        });
    }
});

module.exports = router;