const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixLegacyRequests() {
  let connection;
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'metroexecucare_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔗 Connected to database');

    // Find requests that are missing hr_final_stage records
    const [requestsWithoutFinalStage] = await connection.execute(`
      SELECT DISTINCT cr.id, cr.assigned_hr_id, cr.request_number
      FROM checkup_requests cr
      WHERE cr.id NOT IN (
        SELECT DISTINCT request_id
        FROM request_approvals
        WHERE approval_stage = 'hr_final_stage'
      )
      AND cr.current_status NOT IN ('rejected', 'pending')
      ORDER BY cr.id
    `);

    console.log(`📋 Found ${requestsWithoutFinalStage.length} requests missing hr_final_stage records`);

    if (requestsWithoutFinalStage.length === 0) {
      console.log('✅ All requests already have hr_final_stage records');
      return;
    }

    // Add missing hr_final_stage records
    let addedCount = 0;
    for (const request of requestsWithoutFinalStage) {
      try {
        await connection.execute(`
          INSERT INTO request_approvals (
            request_id,
            approval_stage,
            approver_role,
            action,
            is_current_stage,
            stage_order,
            created_at
          ) VALUES (?, 'hr_final_stage', 'hr_personnel', 'pending', FALSE, 4, NOW())
        `, [request.id]);

        console.log(`✅ Added hr_final_stage for request ${request.request_number} (ID: ${request.id})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Failed to add hr_final_stage for request ${request.id}:`, error.message);
      }
    }

    console.log(`🎉 Successfully added hr_final_stage records for ${addedCount} requests`);

    // Verify the fix
    const [verification] = await connection.execute(`
      SELECT
        COUNT(DISTINCT cr.id) as total_active_requests,
        COUNT(DISTINCT ra.request_id) as requests_with_hr_final_stage
      FROM checkup_requests cr
      LEFT JOIN request_approvals ra ON cr.id = ra.request_id AND ra.approval_stage = 'hr_final_stage'
      WHERE cr.current_status NOT IN ('rejected')
    `);

    console.log('📊 Verification:', verification[0]);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration
fixLegacyRequests();