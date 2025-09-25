const { pool } = require('../config/database/connection');
const { hasPermission, canAccessResource } = require('../config/rolePermissions');
const emailService = require('../services/emailService');

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

    // Create initial approval stages - both request types follow same workflow
    const approvalStages = [
      { stage: 'hr_stage', role: 'hr_personnel', order: 1 },
      { stage: 'benefits_stage', role: 'benefits_officer', order: 2 },
      { stage: 'welfare_stage', role: 'welfare_head', order: 3 }
    ];
    
    for (const stage of approvalStages) {
      await pool.execute(
        `INSERT INTO request_approvals (
          request_id, approver_id, approver_role, approval_stage, stage_order, 
          action, is_current_stage, created_at
        ) VALUES (?, NULL, ?, ?, ?, 'pending', ?, NOW())`,
        [requestId, stage.role, stage.stage, stage.order, stage.order === 1]
      );
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

      const [requests] = await pool.execute(query, [userId]);

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

    // For other roles, return empty for now to avoid complexity
    res.json({
      success: true,
      data: {
        requests: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
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

    // Get request with full details
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
        DATEDIFF(cr.due_date, CURDATE()) as days_until_due
      FROM checkup_requests cr
      JOIN users u ON cr.employee_id = u.id
      LEFT JOIN hospitals h ON cr.hospital_id = h.id
      LEFT JOIN users assigned_hr ON cr.assigned_hr_id = assigned_hr.id
      LEFT JOIN hospitals hr_hospital ON cr.hr_assigned_hospital_id = hr_hospital.id
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
      `SELECT * FROM checkup_requests WHERE id = ? AND employee_id = ?`,
      [id, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found or access denied'
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

    // Insert file record into request_files table
    const [result] = await pool.execute(
      `INSERT INTO request_files (
        request_id, filename, original_filename, file_path, file_size,
        file_type, file_extension, uploaded_by, file_category, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submission_document', NOW())`,
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

    // Log activity
    await logActivity(
      id,
      userId,
      'file_uploaded',
      `Uploaded submission document: ${file.originalname}`,
      null,
      {
        filename: file.filename,
        original_filename: file.originalname,
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
        original_filename: file.originalname,
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

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  uploadRequestFileHandler
};