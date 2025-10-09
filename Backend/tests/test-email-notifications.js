/**
 * Email Notification Test Script
 * Run this to test all email notification workflows
 *
 * Usage: node tests/test-email-notifications.js
 */

const emailService = require('../services/emailService');

// Mock data for testing
const mockExecutive = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'executive.test@example.com',
  employee_id: 'EXE001',
  department: 'Sales',
  position: 'Senior Executive'
};

const mockHR = {
  id: 2,
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'hr.test@example.com',
  employee_id: 'HR001',
  department: 'Human Resources',
  position: 'HR Personnel'
};

const mockBenefitsOfficer = {
  id: 3,
  first_name: 'Mike',
  last_name: 'Johnson',
  email: 'benefits.test@example.com',
  employee_id: 'BO001',
  department: 'Benefits',
  position: 'Benefits Officer'
};

const mockWelfareHead = {
  id: 4,
  first_name: 'Sarah',
  last_name: 'Williams',
  email: 'welfare.test@example.com',
  employee_id: 'WH001',
  department: 'Employee Welfare',
  position: 'Welfare Head'
};

const mockRequest = {
  id: 1,
  request_number: 'LOA-2025-001',
  request_type: 'letter_of_approval',
  preferred_date: '2025-02-15',
  letter_purpose: 'Annual executive health checkup at Metro Hospital',
  priority_level: 'normal',
  due_date: '2025-02-28',
  current_status: 'pending',
  created_at: new Date()
};

async function testEmailNotifications() {
  console.log('\n🧪 ============================================');
  console.log('🧪 EMAIL NOTIFICATION TEST SUITE');
  console.log('🧪 ============================================\n');

  try {
    // Test 1: New Request Notification
    console.log('📧 Test 1: New Request Notification to HR Personnel');
    console.log('─'.repeat(50));
    try {
      await emailService.sendNewRequestNotification(mockRequest, mockExecutive, [mockHR]);
      console.log('✅ Test 1 PASSED: New request notification sent\n');
    } catch (error) {
      console.error('❌ Test 1 FAILED:', error.message);
      console.error('   Details:', error);
      console.log('');
    }

    // Test 2: Request Assignment Notification
    console.log('📧 Test 2: Request Assignment Notification');
    console.log('─'.repeat(50));
    try {
      await emailService.sendRequestAssignmentNotification(mockRequest, mockExecutive, mockHR);
      console.log('✅ Test 2 PASSED: Assignment notification sent\n');
    } catch (error) {
      console.error('❌ Test 2 FAILED:', error.message);
      console.error('   Details:', error);
      console.log('');
    }

    // Test 3: Status Update Notification (Under Review)
    console.log('📧 Test 3: Status Update Notification (Request Under Review)');
    console.log('─'.repeat(50));
    try {
      await emailService.sendStatusUpdateNotification(
        mockRequest,
        mockExecutive,
        'pending',
        'Your request has been claimed by Jane Smith and is now being processed.',
        mockHR
      );
      console.log('✅ Test 3 PASSED: Status update notification sent\n');
    } catch (error) {
      console.error('❌ Test 3 FAILED:', error.message);
      console.error('   Details:', error);
      console.log('');
    }

    // Test 4: Approval Request Notification (Benefits Officer)
    console.log('📧 Test 4: Approval Request Notification to Benefits Officer');
    console.log('─'.repeat(50));
    try {
      await emailService.sendApprovalRequestNotification(
        mockRequest,
        mockExecutive,
        mockBenefitsOfficer,
        'benefits_review'
      );
      console.log('✅ Test 4 PASSED: Approval request to BO sent\n');
    } catch (error) {
      console.error('❌ Test 4 FAILED:', error.message);
      console.error('   Details:', error);
      console.log('');
    }

    // Test 5: Approval Request Notification (Welfare Head)
    console.log('📧 Test 5: Approval Request Notification to Welfare Head');
    console.log('─'.repeat(50));
    try {
      await emailService.sendApprovalRequestNotification(
        mockRequest,
        mockExecutive,
        mockWelfareHead,
        'welfare_review'
      );
      console.log('✅ Test 5 PASSED: Approval request to WH sent\n');
    } catch (error) {
      console.error('❌ Test 5 FAILED:', error.message);
      console.error('   Details:', error);
      console.log('');
    }

    // Test 6: HR Final Verification Notification
    console.log('📧 Test 6: HR Final Verification Notification');
    console.log('─'.repeat(50));
    try {
      await emailService.sendHRFinalVerificationNotification(
        mockRequest,
        mockExecutive,
        mockHR,  // Pass single HR object, not array
        mockWelfareHead
      );
      console.log('✅ Test 6 PASSED: HR final verification notification sent\n');
    } catch (error) {
      console.error('❌ Test 6 FAILED:', error.message);
      console.error('   Details:', error);
      console.log('');
    }

    // Test 7: Executive Final Approval Notification
    console.log('📧 Test 7: Executive Final Approval Notification (with download links)');
    console.log('─'.repeat(50));
    try {
      const mockFiles = [
        { id: 1, file_name: 'letter_of_approval.pdf', file_path: '/uploads/loa-001.pdf' }
      ];
      // sendExecutiveFinalApprovalNotification expects: (requestData, executive, approvedFiles, hrPersonnel)
      // hrPersonnel is optional, so we can omit it for testing
      await emailService.sendExecutiveFinalApprovalNotification(mockRequest, mockExecutive, mockFiles, [mockHR]);
      console.log('✅ Test 7 PASSED: Final approval notification sent\n');
    } catch (error) {
      console.error('❌ Test 7 FAILED:', error.message);
      console.error('   Details:', error);
      console.log('');
    }

    // Test 8: Executive Final Rejection Notification
    console.log('📧 Test 8: Executive Final Rejection Notification');
    console.log('─'.repeat(50));
    try {
      await emailService.sendExecutiveFinalRejectionNotification(
        mockRequest,
        mockExecutive,
        'Incomplete documentation',
        mockHR
      );
      console.log('✅ Test 8 PASSED: Rejection notification sent\n');
    } catch (error) {
      console.error('❌ Test 8 FAILED:', error.message);
      console.error('   Details:', error);
      console.log('');
    }

    console.log('\n🧪 ============================================');
    console.log('🧪 TEST SUITE COMPLETED');
    console.log('🧪 ============================================\n');
    console.log('📝 Note: Check the backend console for detailed email logs');
    console.log('📝 If Gmail is configured, check the recipient email inboxes');
    console.log('📝 If Gmail is NOT configured, emails are logged to console only\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR during email testing:', error);
  }

  // Exit after tests complete
  process.exit(0);
}

// Run tests
console.log('\n🚀 Starting Email Notification Tests...\n');
setTimeout(() => {
  testEmailNotifications();
}, 1000); // Wait 1 second for database connection to establish
