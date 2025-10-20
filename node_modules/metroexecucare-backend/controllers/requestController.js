const { pool } = require('../config/database/connection');
const { hasPermission, canAccessResource } = require('../config/rolePermissions');
const emailService = require('../services/emailService');
const path = require('path');
const fs = require('fs');

// Helper function to generate unique request number
const generateRequestNumber = () => {
  const prefix = 'REQ';
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${year}${timestamp}${random}`;
};

// Helper function to calculate due date (15 working days)
const calculateDueDate = (startDate = new Date()) => {
  const date = new Date(startDate);
  let workingDays = 0;
  
  while (workingDays < 15) {
    date.setDate(date.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      workingDays++;
    }
  }
  
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

// Helper function to get HR personnel for notifications
const getHRPersonnel = async () => {
  try {
    const [hrPersonnel] = await pool.execute(
      `SELECT id, first_name, last_name, email, employee_id, department, position
       FROM users
       WHERE role = 'hr_personnel' AND is_active = 1`
    );
    return hrPersonnel;
  } catch (error) {
    console.error('Error getting HR personnel:', error);
    return [];
  }
};

// POST /api/requests - Submit new checkup request
const createRequest = async (req, res) => {
  try {
    const {
      request_type,
      preferred_date,
      letter_purpose,
      priority_level = 'normal'
    } = req.body;

    const employee_id = req.user.id;

    // Validate required fields
    if (!request_type || !['letter_of_approval', 'letter_of_authorization'].includes(request_type)) {
      return res.status(400).json({
        success: false,
        error: 'Valid request type is required (letter_of_approval or letter_of_authorization)'
      });
    }

    if (!letter_purpose || letter_purpose.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Letter purpose is required and must be at least 10 characters'
      });
    }

    // Generate unique request number
    const request_number = generateRequestNumber();
    
    // Calculate due date (15 working days from now)
    const due_date = calculateDueDate();

    // Insert request into database (hospital fields will be filled by HR)
    const [result] = await pool.execute(
      `INSERT INTO checkup_requests (
        request_number, employee_id, request_type, preferred_date, 
        letter_purpose, priority_level, due_date, current_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        request_number, employee_id, request_type, preferred_date || null,
        letter_purpose, priority_level, due_date
      ]
    );

    const requestId = result.insertId;

    // Create initial approval stages - 5-stage workflow with HR final verification
    const approvalStages = [
      { stage: 'hr_stage', role: 'hr_personnel', order: 1 },
      { stage: 'benefits_stage', role: 'benefits_officer', order: 2 },
      { stage: 'welfare_stage', role: 'welfare_head', order: 3 },
      { stage: 'hr_final_stage', role: 'hr_personnel', order: 4 } // HR Final Document Verification
    ];
    
    for (const stage of approvalStages) {
      try {
        console.log(`Creating approval stage: ${stage.stage} for request ${requestId}`);

        // Fix column name: approver_role not required_role, and add stage_order
        await pool.execute(
          `INSERT INTO request_approvals (
            request_id, approval_stage, approver_role, action, is_current_stage, stage_order
          ) VALUES (?, ?, ?, 'pending', ?, ?)`,
          [requestId, stage.stage, stage.role, stage.order === 1, stage.order]
        );
        console.log(`✅ Successfully created stage: ${stage.stage}`);
      } catch (stageError) {
        console.error(`❌ Error creating approval stage ${stage.stage}:`, stageError);
        console.error(`❌ Error details:`, {
          message: stageError.message,
          code: stageError.code,
          errno: stageError.errno,
          sql: stageError.sql
        });
        throw stageError;
      }
    }

    // Log activity
    await logActivity(requestId, employee_id, 'request_created', 
      `Annual Executive Checkup ${request_type.replace('_', ' ').toUpperCase()} request submitted`, null, {
        request_number,
        request_type,
        priority_level,
        hospital_type: request_type === 'letter_of_approval' ? 'accredited' : 'non-accredited'
      });

    // Get complete request data for response
    const [requests] = await pool.execute(
      `SELECT cr.*, u.first_name, u.last_name, u.email, u.department, u.position
       FROM checkup_requests cr
       JOIN users u ON cr.employee_id = u.id
       WHERE cr.id = ?`,
      [requestId]
    );

    const requestData = requests[0];
    const executive = {
      id: req.user.id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      employee_id: req.user.employee_id,
      department: req.user.department,
      position: req.user.position
    };

    // Send email notifications to HR personnel (async, don't wait)
    try {
      const hrPersonnel = await getHRPersonnel();
      if (hrPersonnel.length > 0) {
        emailService.sendNewRequestNotification(requestData, executive, hrPersonnel)
          .then(() => console.log(`📧 New request notifications sent for ${request_number}`))
          .catch(error => console.error('Email notification error:', error.message));
      }
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError.message);
      // Don't fail the request creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: {
        request: requestData
      }
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/requests - List requests with filtering and pagination
const getRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Debug: getRequests called - userId =', userId, 'userRole =', userRole);

    // Simplified query for executives only (main use case)
    if (userRole === 'executive') {
      // Simple query without problematic LIMIT/OFFSET parameters
      const query = `
        SELECT
          cr.id,
          cr.request_number,
          cr.request_type,
          cr.current_status,
          cr.priority_level,
          cr.created_at,
          cr.updated_at,
          cr.due_date,
          cr.preferred_date,
          cr.letter_purpose,
          u.first_name,
          u.last_name,
          u.email,
          u.employee_id as employee_number,
          u.department,
          u.position,
          h.name as selected_hospital_name
        FROM checkup_requests cr
        JOIN users u ON cr.employee_id = u.id
        LEFT JOIN hospitals h ON cr.hospital_id = h.id
        WHERE cr.employee_id = ?
        ORDER BY cr.created_at DESC
      `;

      console.log('Debug: Executing query with userId =', userId);

      const [requests] = await pool.query(query, [userId]);

      console.log('Debug: Query executed successfully, found', requests.length, 'requests');

      // Format response with default values for pagination
      const formattedRequests = requests.map(request => ({
        ...request,
        is_overdue: false,
        is_urgent: request.priority_level === 'urgent',
        days_until_due: 0,
        file_count: 0
      }));

      res.json({
        success: true,
        data: {
          requests: formattedRequests,
          pagination: {
            page: 1,
            limit: formattedRequests.length,
            total: formattedRequests.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      });
      return;
    }

    // Handle HR roles and other users - use the exact same query structure as executives
    const { status, limit = 50, sort = 'created_at', order = 'desc', assigned_hr_id, claimed_by_me } = req.query;

    // Build WHERE conditions
    let whereConditions = [];
    let queryParams = [];
    let needsApprovalJoin = false;

    // Apply role-based filtering
    if (!['hr_personnel', 'benefits_officer', 'welfare_head'].includes(userRole)) {
      // Non-HR roles see only their own requests
      whereConditions.push('cr.employee_id = ?');
      queryParams.push(userId);
    }

    // Apply assigned HR filter if provided (for HR dashboard)
    if (assigned_hr_id) {
      whereConditions.push('cr.assigned_hr_id = ?');
      queryParams.push(assigned_hr_id);
    }

    // Apply "claimed by me" filter for Benefits Officer and Welfare Head
    if (claimed_by_me === 'true') {
      needsApprovalJoin = true;
      if (userRole === 'benefits_officer') {
        whereConditions.push('ra.approval_stage = ? AND ra.approver_id = ?');
        queryParams.push('benefits_stage', userId);
      } else if (userRole === 'welfare_head') {
        whereConditions.push('ra.approval_stage = ? AND ra.approver_id = ?');
        queryParams.push('welfare_stage', userId);
      } else if (userRole === 'hr_personnel') {
        // For HR, use the assigned_hr_id field
        whereConditions.push('cr.assigned_hr_id = ?');
        queryParams.push(userId);
      }
    }

    // Apply status filter if provided
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      const placeholders = statuses.map(() => '?').join(',');
      whereConditions.push(`cr.current_status IN (${placeholders})`);
      queryParams.push(...statuses);
    }

    // Build the complete query using the same structure as the executive query
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Add ordering with proper field mapping
    const sortFieldMapping = {
      'id': 'cr.id',
      'request_number': 'cr.request_number',
      'request_type': 'cr.request_type',
      'current_status': 'cr.current_status',
      'priority_level': 'cr.priority_level',
      'created_at': 'cr.created_at',
      'updated_at': 'cr.updated_at',
      'due_date': 'cr.due_date',
      'preferred_date': 'cr.preferred_date',
      'first_name': 'u.first_name',
      'last_name': 'u.last_name'
    };

    const validSortField = sortFieldMapping[sort] || 'cr.created_at';
    const validOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

    // Add limit to params if provided
    const limitClause = (limit && !isNaN(parseInt(limit))) ? 'LIMIT ?' : '';
    if (limitClause) {
      queryParams.push(parseInt(limit));
    }

    // Build JOIN clause - add request_approvals if needed
    const joinClause = needsApprovalJoin
      ? 'LEFT JOIN request_approvals ra ON cr.id = ra.request_id'
      : '';

    const query = `
      SELECT
        cr.id,
        cr.request_number,
        cr.request_type,
        cr.current_status,
        cr.priority_level,
        cr.created_at,
        cr.updated_at,
        cr.due_date,
        cr.preferred_date,
        cr.letter_purpose,
        cr.assigned_hr_id,
        cr.assigned_at,
        u.first_name,
        u.last_name,
        u.email,
        u.employee_id as employee_number,
        u.department,
        u.position,
        h.name as selected_hospital_name
      FROM checkup_requests cr
      JOIN users u ON cr.employee_id = u.id
      LEFT JOIN hospitals h ON cr.hospital_id = h.id
      ${joinClause}
      ${whereClause}
      ORDER BY ${validSortField} ${validOrder}
      ${limitClause}
    `;

    console.log('Debug: Executing query for role:', userRole, 'with params:', queryParams);

    const [requests] = await pool.query(query, queryParams);

    console.log('Debug: Query executed successfully, found', requests.length, 'requests');

    // Format response
    const formattedRequests = requests.map(request => ({
      ...request,
      employee: {
        id: request.employee_id,
        first_name: request.first_name,
        last_name: request.last_name,
        email: request.email,
        employee_number: request.employee_number,
        department: request.department,
        position: request.position
      },
      is_overdue: false,
      is_urgent: request.priority_level === 'urgent',
      days_until_due: 0,
      file_count: 0
    }));

    res.json({
      success: true,
      data: {
        requests: formattedRequests,
        pagination: {
          page: 1,
          limit: formattedRequests.length,
          total: formattedRequests.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/requests/:id - Get specific request details
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get request with full details including assigned approvers
    const [requests] = await pool.execute(`
      SELECT
        cr.*,
        u.first_name, u.last_name, u.email, u.employee_id as employee_number,
        u.department, u.position, u.contact_number,
        h.name as selected_hospital_name, h.address as selected_hospital_address,
        h.contact_number as selected_hospital_contact,
        assigned_hr.first_name as assigned_hr_first_name,
        assigned_hr.last_name as assigned_hr_last_name,
        assigned_hr.email as assigned_hr_email,
        hr_hospital.name as hr_assigned_hospital_name,
        hr_hospital.address as hr_assigned_hospital_address,
        hr_hospital.contact_number as hr_assigned_hospital_contact,
        bo_approver.id as assigned_bo_id,
        bo_approver.first_name as assigned_bo_first_name,
        bo_approver.last_name as assigned_bo_last_name,
        bo_approver.email as assigned_bo_email,
        wh_approver.id as assigned_wh_id,
        wh_approver.first_name as assigned_wh_first_name,
        wh_approver.last_name as assigned_wh_last_name,
        wh_approver.email as assigned_wh_email,
        DATEDIFF(cr.due_date, CURDATE()) as days_until_due
      FROM checkup_requests cr
      JOIN users u ON cr.employee_id = u.id
      LEFT JOIN hospitals h ON cr.hospital_id = h.id
      LEFT JOIN users assigned_hr ON cr.assigned_hr_id = assigned_hr.id
      LEFT JOIN hospitals hr_hospital ON cr.hr_assigned_hospital_id = hr_hospital.id
      LEFT JOIN request_approvals ra_bo ON cr.id = ra_bo.request_id AND ra_bo.approval_stage = 'benefits_stage'
      LEFT JOIN users bo_approver ON ra_bo.approver_id = bo_approver.id
      LEFT JOIN request_approvals ra_wh ON cr.id = ra_wh.request_id AND ra_wh.approval_stage = 'welfare_stage'
      LEFT JOIN users wh_approver ON ra_wh.approver_id = wh_approver.id
      WHERE cr.id = ?
    `, [id]);

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Check access permissions
    const hasAccess = canAccessResource(req.user, 'request', request, 'view');
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get approval history
    const [approvals] = await pool.execute(`
      SELECT 
        ra.*,
        u.first_name as approver_first_name,
        u.last_name as approver_last_name,
        u.email as approver_email,
        h.name as approved_hospital_name
      FROM request_approvals ra
      JOIN users u ON ra.approver_id = u.id
      LEFT JOIN hospitals h ON ra.approved_hospital_id = h.id
      WHERE ra.request_id = ?
      ORDER BY ra.stage_order ASC
    `, [id]);

    // Get files
    const [files] = await pool.execute(`
      SELECT 
        rf.*,
        uploader.first_name as uploader_first_name,
        uploader.last_name as uploader_last_name,
        generator.first_name as generator_first_name,
        generator.last_name as generator_last_name
      FROM request_files rf
      LEFT JOIN users uploader ON rf.uploaded_by = uploader.id
      LEFT JOIN users generator ON rf.generated_by = generator.id
      WHERE rf.request_id = ? AND rf.is_active = 1
      ORDER BY rf.created_at DESC
    `, [id]);

    // Get activity logs (limited based on role)
    let activityQuery = `
      SELECT 
        al.*,
        u.first_name, u.last_name, u.email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.request_id = ?
    `;

    if (userRole === 'executive') {
      // Executives see limited activity logs
      activityQuery += ` AND al.action IN (
        'request_created', 'request_assigned', 'hr_approved', 'benefits_approved', 
        'welfare_approved', 'request_approved', 'request_rejected', 'letter_generated', 
        'letter_sent', 'request_completed'
      )`;
    }

    activityQuery += ' ORDER BY al.created_at DESC LIMIT 50';

    const [activities] = await pool.execute(activityQuery, [id]);

    // Format response
    const response = {
      ...request,
      is_overdue: request.days_until_due < 0,
      is_urgent: request.priority_level === 'urgent' || request.days_until_due <= 3,
      approvals: approvals.map(approval => ({
        ...approval,
        old_values: approval.old_values ? JSON.parse(approval.old_values) : null,
        new_values: approval.new_values ? JSON.parse(approval.new_values) : null
      })),
      files: files,
      activities: activities.map(activity => ({
        ...activity,
        old_values: activity.old_values && typeof activity.old_values === 'string' ? JSON.parse(activity.old_values) : activity.old_values,
        new_values: activity.new_values && typeof activity.new_values === 'string' ? JSON.parse(activity.new_values) : activity.new_values
      }))
    };

    res.json({
      success: true,
      data: { request: response }
    });

  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};


// Helper function to log activities
const logActivity = async (requestId, userId, action, description, oldValues = null, newValues = null, fileId = null) => {
  try {
    await pool.execute(
      `INSERT INTO activity_logs (
        request_id, user_id, action, description, old_values, new_values, 
        file_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        requestId, userId, action, description,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        fileId
      ]
    );
  } catch (error) {
    console.error('Log activity error:', error);
    // Don't throw error as this is supplementary functionality
  }
};

// POST /api/requests/:id/upload-file - Upload file for a request
const uploadRequestFileHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if request exists and user has access
    const [requests] = await pool.execute(
      `SELECT * FROM checkup_requests WHERE id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Check permissions based on role and request status
    const userRole = req.user.role;
    let hasPermission = false;

    if (userRole === 'executive' && request.employee_id === userId) {
      // Executives can upload to their own requests
      hasPermission = true;
    } else if (userRole === 'hr_personnel' && request.assigned_hr_id === userId) {
      // HR can upload to requests assigned to them (initial processing and final verification)
      hasPermission = true;
    } else if (userRole === 'benefits_officer' && ['benefits_review', 'welfare_review'].includes(request.current_status)) {
      // Benefits Officers can upload during benefits or welfare review stages
      hasPermission = true;
    } else if (userRole === 'welfare_head' && request.current_status === 'welfare_review') {
      // Welfare Heads can upload during welfare review stage
      hasPermission = true;
    } else if (['admin'].includes(userRole)) {
      // Admin can upload to any request
      hasPermission = true;
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to upload files to this request'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop().toLowerCase();

    console.log('📁 File upload details:', {
      requestId: id,
      userId: userId,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path
    });

    // Insert file record into request_files table
    const [result] = await pool.execute(
      `INSERT INTO request_files (
        request_id, file_name, original_file_name, file_path, file_size,
        file_type, file_extension, uploaded_by, file_category, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'supporting_document', NOW())`,
      [
        id,
        file.filename,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
        fileExtension,
        userId
      ]
    );

    const fileId = result.insertId;

    console.log('✅ File successfully saved to database with ID:', fileId);

    // Log activity
    await logActivity(
      id,
      userId,
      'file_uploaded',
      `Uploaded submission document: ${file.originalname}`,
      null,
      {
        filename: file.filename,
        original_file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype
      },
      fileId
    );

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        file_id: fileId,
        filename: file.filename,
        original_file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype
      }
    });

  } catch (error) {
    console.error('Upload request file error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/requests/:id/files/:fileId/download - Download a specific file
const downloadRequestFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if request exists and user has access
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Check access permissions
    const hasAccess = canAccessResource(req.user, 'request', request, 'view');
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get file details
    const [files] = await pool.execute(
      'SELECT * FROM request_files WHERE id = ? AND request_id = ? AND is_active = 1',
      [fileId, id]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const file = files[0];
    // Construct the correct file path using file_name, not file_path
    // file_path contains the full path at upload time, but we need to build it from file_name
    let filePath = path.join(__dirname, '..', 'uploads', 'request-files', file.file_name);

    // Check if file exists on disk
    const fs = require('fs');

    // If file doesn't exist, try sanitized version (for backwards compatibility with old files that had spaces)
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found at original path: ${filePath}`);

      // Try sanitized filename (spaces and special characters replaced with underscores)
      const sanitizedFileName = file.file_name
        .replace(/\s+/g, '_')  // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9_.-]/g, '_')  // Replace special characters
        .replace(/_+/g, '_');  // Replace multiple underscores with single

      const sanitizedPath = path.join(__dirname, '..', 'uploads', 'request-files', sanitizedFileName);
      console.log(`🔍 Trying sanitized path: ${sanitizedPath}`);

      if (fs.existsSync(sanitizedPath)) {
        console.log(`✅ File found at sanitized path!`);
        filePath = sanitizedPath;
      } else {
        console.error(`❌ File not found at either path:
          Original: ${filePath}
          Sanitized: ${sanitizedPath}`);
        return res.status(404).json({
          success: false,
          error: 'File not found on disk'
        });
      }
    } else {
      console.log(`✅ File found at original path: ${filePath}`);
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_file_name}"`);
    res.setHeader('Content-Type', file.file_type);
    res.setHeader('Content-Length', file.file_size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// DELETE /api/requests/:id/files/:fileId - Delete a specific file
const deleteRequestFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if request exists and user has access
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Don't allow deletion of files from approved or rejected requests to preserve records
    if (['approved', 'rejected'].includes(request.current_status)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete files from approved or rejected requests'
      });
    }

    // Check if user can delete files (only file uploader or admin)
    const [files] = await pool.execute(
      'SELECT * FROM request_files WHERE id = ? AND request_id = ? AND is_active = 1',
      [fileId, id]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const file = files[0];

    // Only allow file uploader or admin to delete
    if (file.uploaded_by !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You can only delete files you uploaded'
      });
    }

    // Delete the physical file from filesystem
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const filePath = path.join(__dirname, '../uploads/request-files', file.file_name);
      await fs.unlink(filePath);
      console.log(`📂 Physical file deleted: ${filePath}`);
    } catch (fileError) {
      console.warn(`⚠️ Could not delete physical file: ${fileError.message}`);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the database record (hard delete for storage optimization)
    await pool.execute(
      'DELETE FROM request_files WHERE id = ?',
      [fileId]
    );

    // Log activity
    await logActivity(id, userId, 'file_deleted',
      `File "${file.original_file_name}" was permanently deleted`,
      { file_id: fileId, filename: file.original_file_name, filepath: file.file_name },
      { deleted: true }
    );

    console.log(`🗑️ File permanently deleted: ${file.original_file_name} by user ${userId}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Download latest approved file (most recent staff file)
const downloadLatestFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get request to verify access
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Get the Welfare Head's (Division Head's) final approval file
    // This is the official approval letter from the last stage of the workflow
    const [files] = await pool.execute(`
      SELECT rf.*, u.role as uploader_role
      FROM request_files rf
      LEFT JOIN users u ON rf.uploaded_by = u.id
      WHERE rf.request_id = ?
        AND u.role = 'welfare_head'
      ORDER BY rf.created_at DESC
      LIMIT 1
    `, [id]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No approved files found for this request'
      });
    }

    const latestFile = files[0];
    const filePath = path.join(__dirname, '..', 'uploads', 'request-files', latestFile.file_name);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${latestFile.original_file_name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    console.log(`📥 Latest file downloaded: ${latestFile.original_file_name} by user ${userId}`);

  } catch (error) {
    console.error('Download latest file error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Download executive original file(s) - Returns ZIP if multiple files, single file if only one
const downloadExecutiveFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const archiver = require('archiver');

    // Get request to verify access
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const request = requests[0];

    // Get ALL executive files (all files uploaded by the request creator before submission)
    const [files] = await pool.execute(`
      SELECT rf.*
      FROM request_files rf
      WHERE rf.request_id = ?
        AND rf.uploaded_by = ?
      ORDER BY rf.created_at ASC
    `, [id, request.employee_id]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No executive files found for this request'
      });
    }

    // If only one file, send it directly
    if (files.length === 1) {
      const executiveFile = files[0];
      const filePath = path.join(__dirname, '..', 'uploads', 'request-files', executiveFile.file_name);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found on server'
        });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${executiveFile.original_file_name}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      console.log(`📥 Executive file downloaded: ${executiveFile.original_file_name} by user ${userId}`);
      return;
    }

    // Multiple files - create a ZIP archive
    const zipFilename = `Original_Request_${request.request_number || id}.zip`;
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle archiver errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({
        success: false,
        error: 'Error creating archive'
      });
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add each file to the archive
    for (const file of files) {
      const filePath = path.join(__dirname, '..', 'uploads', 'request-files', file.file_name);

      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file.original_file_name });
      } else {
        console.warn(`⚠️ File not found: ${filePath}`);
      }
    }

    // Finalize the archive
    await archive.finalize();

    console.log(`📥 Executive files (${files.length}) downloaded as ZIP by user ${userId}`);

  } catch (error) {
    console.error('Download executive file error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/requests/user/:userId/history - Get user's request history
const getUserRequestHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;

    // Permission check: Only admin or the user themselves can view history
    if (requestingUserRole !== 'admin' && requestingUserId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own request history.'
      });
    }

    // Get the user's role to determine what type of history to fetch
    const [userInfo] = await pool.execute(`
      SELECT role FROM users WHERE id = ?
    `, [userId]);

    if (userInfo.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userRole = userInfo[0].role;
    let requests;

    // Different query based on user role
    if (userRole === 'executive') {
      // For executives: fetch requests they submitted
      [requests] = await pool.execute(`
        SELECT
          cr.id,
          cr.request_number,
          cr.request_type,
          cr.current_status,
          cr.priority_level,
          cr.created_at,
          cr.updated_at,
          cr.completed_at,
          cr.rejected_at,
          cr.rejection_reason,
          cr.due_date,
          cr.assigned_at,
          h.name as hospital_name,
          h.address as hospital_address,
          h.city as hospital_city,
          hr_user.first_name as hr_first_name,
          hr_user.last_name as hr_last_name,
          hr_user.employee_id as hr_employee_id,
          (SELECT COUNT(*) FROM request_files WHERE request_id = cr.id AND uploaded_by = 'executive') as executive_files_count,
          (SELECT COUNT(*) FROM request_files WHERE request_id = cr.id AND uploaded_by = 'hr') as hr_files_count,
          (SELECT COUNT(*) FROM request_approvals WHERE request_id = cr.id AND action = 'approved') as approvals_count,
          (SELECT COUNT(*) FROM request_approvals WHERE request_id = cr.id AND action = 'rejected') as rejections_count
        FROM checkup_requests cr
        LEFT JOIN hospitals h ON cr.hospital_id = h.id
        LEFT JOIN users hr_user ON cr.assigned_hr_id = hr_user.id
        WHERE cr.employee_id = ?
        ORDER BY cr.created_at DESC
      `, [userId]);
    } else if (userRole === 'hr_personnel') {
      // For HR: fetch requests they were assigned to or claimed
      [requests] = await pool.execute(`
        SELECT
          cr.id,
          cr.request_number,
          cr.request_type,
          cr.current_status,
          cr.priority_level,
          cr.created_at,
          cr.updated_at,
          cr.completed_at,
          cr.rejected_at,
          cr.rejection_reason,
          cr.due_date,
          cr.assigned_at,
          h.name as hospital_name,
          exec_user.first_name as employee_first_name,
          exec_user.last_name as employee_last_name,
          exec_user.employee_id as employee_id,
          (SELECT COUNT(*) FROM request_files WHERE request_id = cr.id AND uploaded_by = 'executive') as executive_files_count,
          (SELECT COUNT(*) FROM request_files WHERE request_id = cr.id AND uploaded_by = 'hr') as hr_files_count,
          (SELECT COUNT(*) FROM request_approvals WHERE request_id = cr.id AND action = 'approved') as approvals_count,
          (SELECT COUNT(*) FROM request_approvals WHERE request_id = cr.id AND action = 'rejected') as rejections_count
        FROM checkup_requests cr
        LEFT JOIN hospitals h ON cr.hospital_id = h.id
        LEFT JOIN users exec_user ON cr.employee_id = exec_user.id
        WHERE cr.assigned_hr_id = ?
        ORDER BY cr.created_at DESC
      `, [userId]);
    } else if (userRole === 'benefits_officer' || userRole === 'welfare_head') {
      // For Benefits/Welfare: fetch requests they approved or rejected
      const approvalStage = userRole === 'benefits_officer' ? 'benefits_stage' : 'welfare_stage';

      [requests] = await pool.execute(`
        SELECT DISTINCT
          cr.id,
          cr.request_number,
          cr.request_type,
          cr.current_status,
          cr.priority_level,
          cr.created_at,
          cr.updated_at,
          cr.completed_at,
          cr.rejected_at,
          cr.rejection_reason,
          cr.due_date,
          h.name as hospital_name,
          exec_user.first_name as employee_first_name,
          exec_user.last_name as employee_last_name,
          exec_user.employee_id as employee_id,
          hr_user.first_name as hr_first_name,
          hr_user.last_name as hr_last_name,
          ra.action as my_action,
          ra.action_date as my_action_date,
          ra.comments as my_comments,
          (SELECT COUNT(*) FROM request_files WHERE request_id = cr.id AND uploaded_by = 'executive') as executive_files_count,
          (SELECT COUNT(*) FROM request_files WHERE request_id = cr.id AND uploaded_by = 'hr') as hr_files_count
        FROM checkup_requests cr
        LEFT JOIN hospitals h ON cr.hospital_id = h.id
        LEFT JOIN users exec_user ON cr.employee_id = exec_user.id
        LEFT JOIN users hr_user ON cr.assigned_hr_id = hr_user.id
        INNER JOIN request_approvals ra ON cr.id = ra.request_id
        WHERE ra.approver_id = ? AND ra.approval_stage = ?
        ORDER BY cr.created_at DESC
      `, [userId, approvalStage]);
    } else {
      // For other roles (admin, etc): fetch requests they submitted
      [requests] = await pool.execute(`
        SELECT
          cr.id,
          cr.request_number,
          cr.request_type,
          cr.current_status,
          cr.priority_level,
          cr.created_at,
          cr.updated_at,
          cr.completed_at,
          cr.rejected_at,
          cr.rejection_reason,
          cr.due_date,
          h.name as hospital_name,
          (SELECT COUNT(*) FROM request_files WHERE request_id = cr.id) as total_files
        FROM checkup_requests cr
        LEFT JOIN hospitals h ON cr.hospital_id = h.id
        WHERE cr.employee_id = ?
        ORDER BY cr.created_at DESC
      `, [userId]);
    }

    // Get approval timeline for each request
    const requestsWithTimeline = await Promise.all(requests.map(async (request) => {
      const [approvals] = await pool.execute(`
        SELECT
          ra.approval_stage,
          ra.approver_role,
          ra.action,
          ra.action_date,
          ra.comments,
          ra.stage_order,
          u.first_name,
          u.last_name,
          u.employee_id
        FROM request_approvals ra
        LEFT JOIN users u ON ra.approver_id = u.id
        WHERE ra.request_id = ?
        ORDER BY ra.stage_order ASC, ra.action_date ASC
      `, [request.id]);

      return {
        ...request,
        approval_timeline: approvals
      };
    }));

    // Calculate summary statistics
    const stats = {
      total_requests: requests.length,
      pending: requests.filter(r => ['pending', 'assigned_to_hr', 'hr_processing'].includes(r.current_status)).length,
      under_review: requests.filter(r => ['benefits_review', 'welfare_review', 'hr_final_verification'].includes(r.current_status)).length,
      approved: requests.filter(r => r.current_status === 'approved').length,
      completed: requests.filter(r => r.current_status === 'completed').length,
      rejected: requests.filter(r => r.current_status === 'rejected').length,
      urgent: requests.filter(r => r.priority_level === 'urgent').length,
      overdue: requests.filter(r => {
        if (['completed', 'rejected'].includes(r.current_status)) return false;
        const dueDate = new Date(r.due_date);
        const today = new Date();
        return dueDate < today;
      }).length
    };

    res.json({
      success: true,
      data: {
        requests: requestsWithTimeline,
        stats,
        userRole: userRole // Include user role so frontend knows how to display
      }
    });

  } catch (error) {
    console.error('Get user request history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user request history'
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  uploadRequestFileHandler,
  downloadRequestFile,
  downloadLatestFile,
  downloadExecutiveFile,
  deleteRequestFile,
  getUserRequestHistory
};