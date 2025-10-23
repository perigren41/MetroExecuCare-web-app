-- Seed FAQs with original static data from FAQPage.jsx
-- This restores the comprehensive process flow documentation

-- Getting Started Category
INSERT INTO faqs (question, answer, category, display_order, created_by, is_active) VALUES
(
    'How do I submit an executive checkup request?',
    'To submit a request, log in to your account and navigate to your dashboard. Click on ''Submit New Request'' button, fill out the required information including request type (Letter of Approval or Letter of Authorization), hospital preference, and upload any necessary supporting documents. Once completed, click ''Submit Request'' to send it for Human Resource review.',
    'getting_started',
    1,
    1,
    1
),
(
    'What types of checkup requests can I submit?',
    'MetroExecuCare supports two types of executive checkup requests:

1. Letter of Approval - For standard executive checkup procedures at accredited hospitals
2. Letter of Authorization - For specific medical procedures requiring special authorization

Both types follow the same 5-stage approval workflow and require proper documentation and hospital assignment.',
    'getting_started',
    2,
    1,
    1
),
(
    'What documents do I need to upload with my request?',
    'Required Documents:

For Letter of Approval:
- The filled-out Letter of Approval template (available in the submission form)
- Supporting medical documents if needed (prescriptions, referrals, etc.)

For Letter of Authorization:
- The filled-out Letter of Authorization template (available in the submission form)
- Supporting medical documents if needed (medical certificates, test results, etc.)

Upload Guidelines:
- Documents must be in PDF format only
- Maximum file size: 10MB per file
- You can upload multiple documents by using the upload button multiple times
- Each upload adds one file to your submission

Important: Ensure all necessary documents are complete and uploaded before submitting your request. Reviewers will evaluate based solely on the initially submitted materials. Incomplete documentation may result in rejection.',
    'getting_started',
    3,
    1,
    1
);

-- Approval Workflow Category
INSERT INTO faqs (question, answer, category, display_order, created_by, is_active) VALUES
(
    'What are the different stages of the approval process?',
    'The MetroExecuCare system follows a comprehensive 5-stage approval workflow:

1. Request Submission - You submit your checkup request with supporting documents
2. Human Resource Review - HR Personnel review and assign the appropriate hospital
3. Benefits Officer Review - Benefits Officer validates and approves benefits allocation
4. Division Head Review - Division Head provides final policy approval
5. Final Human Resource Verification - HR performs final document verification before sending to you

Each stage ensures thorough review and proper authorization of your request.',
    'approval_workflow',
    1,
    1,
    1
),
(
    'How long does the approval process typically take?',
    'The approval timeline varies depending on the complexity of your request and current workload. Typically:

- Human Resource initial review: 1-2 business days
- Benefits Officer review: 1-2 business days
- Division Head review: 1-2 business days
- Final HR verification: 1 business day

Total processing time is usually 4-7 business days. You''ll receive email notifications at each stage, and you can track your request''s progress in real-time through the Request Status Tracker.',
    'approval_workflow',
    2,
    1,
    1
),
(
    'Can I edit or cancel my request after submission?',
    'Once submitted, requests still be edited as long as a Human Resource Personnel has not claimed your request yet.

Important Notes:
- There is no edit functionality after submission
- Reviewers must approve or reject requests based on the initially submitted documents
- Reviewers can request additional documents if necessary in the website.
- If your request is rejected at any stage, you will receive feedback explaining the reason
- After rejection, you can submit a new request with corrected information and complete documentation

Best Practice: Ensure all information and documents are complete and accurate before submitting your request to avoid rejection.',
    'approval_workflow',
    3,
    1,
    1
);

-- Request Tracking Category
INSERT INTO faqs (question, answer, category, display_order, created_by, is_active) VALUES
(
    'How do I track the status of my request?',
    'You can track your request status in multiple ways:

1. Dashboard Status Cards - Your dashboard displays the current status of all your requests with color-coded indicators
2. Request Status Tracker - Click on any request card to view detailed progress through all 5 stages
3. Email Notifications - You''ll receive automatic email updates whenever your request moves to a new stage

The status tracker shows you exactly which stage your request is in and what action is being taken.',
    'request_tracking',
    1,
    1,
    1
),
(
    'Why was my request rejected and what should I do?',
    'Requests may be rejected at any stage for various reasons:

Common Rejection Reasons:
- Incomplete or missing documentation
- Non-compliance with benefits policy
- Ineligibility for requested checkup type
- Issues with hospital assignment or availability

What to Do:
1. Check your email for detailed rejection feedback from the reviewer
2. Review the comments provided in your request details
3. Address the issues mentioned in the rejection
4. Submit a new request with corrected information and proper documentation

You''ll receive guidance from Human Resource if you need clarification on the rejection.',
    'request_tracking',
    2,
    1,
    1
);

-- After Approval Category
INSERT INTO faqs (question, answer, category, display_order, created_by, is_active) VALUES
(
    'What happens after my request is approved?',
    'After final approval and HR verification (Stage 5), you will:

1. Receive Email Notification - You''ll get a comprehensive email with all approved documents
2. Download Documents - Access your Letter of Approval/Authorization and other documents from your dashboard
3. Hospital Coordination - The assigned hospital will be notified(if accredited) and you can schedule your checkup
4. Request Completion - Your request status changes to ''Completed''

All approved documents include download links and can be accessed anytime from your account.',
    'after_approval',
    1,
    1,
    1
),
(
    'How do I download my approved checkup documents?',
    'Once your request reaches ''Completed'' status:

1. Via Email - Click the download links in your final approval email
2. Via Dashboard - Go to your dashboard, click on the completed request card, and use the ''Download'' buttons for each document

All documents are securely stored and accessible anytime. Downloaded files include:
- Letter of Approval/Authorization
- Hospital assignment details
- Any additional supporting documents

Documents are in PDF format and can be presented to the assigned hospital for your checkup.',
    'after_approval',
    2,
    1,
    1
);

-- Display summary
SELECT
    category,
    COUNT(*) as total_faqs,
    GROUP_CONCAT(SUBSTRING(question, 1, 50) ORDER BY display_order SEPARATOR ' | ') as questions
FROM faqs
GROUP BY category
ORDER BY
    CASE category
        WHEN 'getting_started' THEN 1
        WHEN 'approval_workflow' THEN 2
        WHEN 'request_tracking' THEN 3
        WHEN 'after_approval' THEN 4
        ELSE 5
    END;