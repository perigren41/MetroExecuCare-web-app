/**
 * Real Email Notification Test Script
 * Tests all 8 email notification workflows using REAL database users
 * This will send ACTUAL emails to real email addresses
 *
 * Run: node tests/test-real-email-notifications.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const emailService = require('../services/emailService');

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function getRealUsers() {
  console.log('\n📊 Fetching real users from database...\n');

  const [hrUsers] = await pool.execute(
    `SELECT id, email, first_name, last_name, role
     FROM users
     WHERE role = 'hr_personnel'
     LIMIT 1`
  );

  const [boUsers] = await pool.execute(
    `SELECT id, email, first_name, last_name, role
     FROM users
     WHERE role = 'benefits_officer'
     LIMIT 1`
  );

  const [whUsers] = await pool.execute(
    `SELECT id, email, first_name, last_name, role
     FROM users
     WHERE role = 'welfare_head'
     LIMIT 1`
  );

  const [executives] = await pool.execute(
    `SELECT id, email, first_name, last_name, role
     FROM users
     WHERE role = 'executive'
     LIMIT 1`
  );

  console.log('✅ HR Personnel:', hrUsers[0] ? `${hrUsers[0].first_name} ${hrUsers[0].last_name} (${hrUsers[0].email})` : 'NONE FOUND');
  console.log('✅ Benefits Officer:', boUsers[0] ? `${boUsers[0].first_name} ${boUsers[0].last_name} (${boUsers[0].email})` : 'NONE FOUND');
  console.log('✅ Welfare Head:', whUsers[0] ? `${whUsers[0].first_name} ${whUsers[0].last_name} (${whUsers[0].email})` : 'NONE FOUND');
  console.log('✅ Executive:', executives[0] ? `${executives[0].first_name} ${executives[0].last_name} (${executives[0].email})` : 'NONE FOUND');

  return {
    hr: hrUsers[0],
    bo: boUsers[0],
    wh: whUsers[0],
    executive: executives[0]
  };
}

async function getRealRequest() {
  console.log('\n📊 Fetching real checkup request from database...\n');

  const [requests] = await pool.execute(
    `SELECT cr.*, u.first_name, u.last_name, u.email as employee_email
     FROM checkup_requests cr
     JOIN users u ON cr.employee_id = u.id
     ORDER BY cr.created_at DESC
     LIMIT 1`
  );

  if (requests[0]) {
    console.log('✅ Request:', requests[0].request_number);
    console.log('   Employee:', `${requests[0].first_name} ${requests[0].last_name}`);
    console.log('   Hospital:', requests[0].hospital_name);
    console.log('   Status:', requests[0].current_status);
  } else {
    console.log('❌ No requests found in database');
  }

  return requests[0];
}

async function runRealEmailTests() {
  try {
    console.log('\n🚀 Starting REAL Email Notification Tests...');
    console.log('⚠️  WARNING: This will send ACTUAL emails to real email addresses!\n');

    // Fetch real users and requests
    const users = await getRealUsers();
    const realRequest = await getRealRequest();

    // Check if we have all required users
    if (!users.hr || !users.bo || !users.wh || !users.executive) {
      console.error('\n❌ Missing required users. Please ensure you have active users for all roles:');
      console.error('   - hr_personnel');
      console.error('   - benefits_officer');
      console.error('   - welfare_head');
      console.error('   - executive');
      return;
    }

    if (!realRequest) {
      console.error('\n❌ No checkup requests found in database. Please create at least one request first.');
      return;
    }

    console.log('\n\n🧪 ============================================');
    console.log('🧪 REAL EMAIL NOTIFICATION TEST SUITE');
    console.log('🧪 ============================================\n');

    // Test 1: New Request Notification to HR Personnel
    console.log('📧 Test 1: New Request Notification to HR Personnel');
    console.log('──────────────────────────────────────────────────');
    try {
      await emailService.sendNewRequestNotification(realRequest, users.executive, [users.hr]);
      console.log('✅ Test 1 PASSED: New request notification sent to', users.hr.email);
    } catch (error) {
      console.error('❌ Test 1 FAILED:', error.message);
    }
    console.log('');

    // Test 2: Request Assignment Notification
    console.log('📧 Test 2: Request Assignment Notification to HR');
    console.log('──────────────────────────────────────────────────');
    try {
      await emailService.sendRequestAssignmentNotification(realRequest, users.executive, users.hr);
      console.log('✅ Test 2 PASSED: Assignment notification sent to', users.hr.email);
    } catch (error) {
      console.error('❌ Test 2 FAILED:', error.message);
    }
    console.log('');

    // Test 3: Status Update Notification
    console.log('📧 Test 3: Status Update Notification to Executive');
    console.log('──────────────────────────────────────────────────');
    try {
      await emailService.sendStatusUpdateNotification(
        realRequest,
        { ...users.executive, email: realRequest.employee_email },
        'pending'
      );
      console.log('✅ Test 3 PASSED: Status update sent to', realRequest.employee_email);
    } catch (error) {
      console.error('❌ Test 3 FAILED:', error.message);
    }
    console.log('');

    // Test 4: Approval Request to Benefits Officer
    console.log('📧 Test 4: Approval Request Notification to Benefits Officer');
    console.log('──────────────────────────────────────────────────');
    try {
      await emailService.sendApprovalRequestNotification(
        realRequest,
        users.executive,
        users.bo,
        'benefits_review'
      );
      console.log('✅ Test 4 PASSED: Approval request sent to', users.bo.email);
    } catch (error) {
      console.error('❌ Test 4 FAILED:', error.message);
    }
    console.log('');

    // Test 5: Approval Request to Welfare Head
    console.log('📧 Test 5: Approval Request Notification to Welfare Head');
    console.log('──────────────────────────────────────────────────');
    try {
      await emailService.sendApprovalRequestNotification(
        realRequest,
        users.executive,
        users.wh,
        'welfare_review'
      );
      console.log('✅ Test 5 PASSED: Approval request sent to', users.wh.email);
    } catch (error) {
      console.error('❌ Test 5 FAILED:', error.message);
    }
    console.log('');

    // Test 6: HR Final Verification
    console.log('📧 Test 6: HR Final Verification Notification');
    console.log('──────────────────────────────────────────────────');
    try {
      await emailService.sendHRFinalVerificationNotification(
        realRequest,
        { ...users.executive, email: realRequest.employee_email },
        users.hr,
        users.wh
      );
      console.log('✅ Test 6 PASSED: HR final verification sent to', users.hr.email);
    } catch (error) {
      console.error('❌ Test 6 FAILED:', error.message);
    }
    console.log('');

    // Test 7: Executive Final Approval (with files)
    console.log('📧 Test 7: Executive Final Approval Notification');
    console.log('──────────────────────────────────────────────────');
    try {
      // Get real files if they exist
      const [files] = await pool.execute(
        `SELECT id, file_name, file_path
         FROM request_files
         WHERE request_id = ?
         LIMIT 3`,
        [realRequest.id]
      );

      const approvedFiles = files.length > 0 ? files : [
        { id: 1, file_name: 'letter_of_approval.pdf', file_path: '/uploads/sample.pdf' }
      ];

      await emailService.sendExecutiveFinalApprovalNotification(
        realRequest,
        { ...users.executive, email: realRequest.employee_email },
        approvedFiles,
        [users.hr]
      );
      console.log('✅ Test 7 PASSED: Final approval sent to', realRequest.employee_email);
    } catch (error) {
      console.error('❌ Test 7 FAILED:', error.message);
    }
    console.log('');

    // Test 8: Executive Final Rejection
    console.log('📧 Test 8: Executive Final Rejection Notification');
    console.log('──────────────────────────────────────────────────');
    try {
      await emailService.sendExecutiveFinalRejectionNotification(
        realRequest,
        { ...users.executive, email: realRequest.employee_email },
        users.hr,
        'Incomplete documentation - please resubmit with all required forms'
      );
      console.log('✅ Test 8 PASSED: Rejection notification sent to', realRequest.employee_email);
    } catch (error) {
      console.error('❌ Test 8 FAILED:', error.message);
    }
    console.log('');

    console.log('\n🧪 ============================================');
    console.log('🧪 TEST SUITE COMPLETED');
    console.log('🧪 ============================================\n');
    console.log('📝 Please check the following email inboxes:');
    console.log(`   ✉️  HR: ${users.hr.email}`);
    console.log(`   ✉️  Benefits Officer: ${users.bo.email}`);
    console.log(`   ✉️  Welfare Head: ${users.wh.email}`);
    console.log(`   ✉️  Executive/Employee: ${realRequest.employee_email}`);
    console.log('\n📧 If Gmail is properly configured, all emails should have been sent!');

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    console.error(error.stack);
  } finally {
    // Close database connection
    await pool.end();
    console.log('\n👋 Database connection closed');
  }
}

// Check if Gmail is configured
if (!process.env.GMAIL_USER_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
  console.error('\n❌ ERROR: Gmail is not configured!');
  console.error('Please set the following environment variables in .env:');
  console.error('   - GMAIL_USER_EMAIL');
  console.error('   - GMAIL_APP_PASSWORD');
  console.error('\nEmails will be logged to console instead of being sent.\n');
}

// Run the tests
runRealEmailTests();
