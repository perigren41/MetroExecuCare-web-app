const validator = require('validator');

// Validate create request
const validateCreateRequest = (req, res, next) => {
  const {
    request_type,
    hospital_id,
    hospital_name,
    hospital_address,
    hospital_contact,
    preferred_date,
    alternative_date,
    special_tests,
    additional_notes,
    letter_purpose,
    medical_requirements,
    priority_level
  } = req.body;

  const errors = [];

  // Required field validation
  if (!request_type) {
    errors.push('Request type is required');
  } else if (!['letter_of_approval', 'letter_of_authorization'].includes(request_type)) {
    errors.push('Invalid request type (must be letter_of_approval or letter_of_authorization)');
  }

  // Letter purpose is required for all requests
  if (!letter_purpose || letter_purpose.trim().length < 5) {
    errors.push('Letter purpose is required and must be at least 5 characters');
  }

  // No hospital validation needed for executives - HR will fill this information later
  // Executives only need to provide request type and letter purpose

  if (preferred_date && !validator.isDate(preferred_date)) {
    errors.push('Valid preferred date is required if provided');
  }

  if (alternative_date && !validator.isDate(alternative_date)) {
    errors.push('Valid alternative date is required if provided');
  }

  // Validate dates are not in the past
  if (preferred_date) {
    const prefDate = new Date(preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (prefDate < today) {
      errors.push('Preferred date cannot be in the past');
    }
  }

  if (alternative_date) {
    const altDate = new Date(alternative_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (altDate < today) {
      errors.push('Alternative date cannot be in the past');
    }
  }

  // Validate special tests array if provided
  if (special_tests) {
    if (!Array.isArray(special_tests)) {
      errors.push('Special tests must be an array');
    } else {
      for (let i = 0; i < special_tests.length; i++) {
        const test = special_tests[i];
        if (typeof test !== 'string' || test.trim().length < 2) {
          errors.push(`Special test at index ${i} must be a valid string with at least 2 characters`);
        }
      }
    }
  }

  if (priority_level && !['normal', 'urgent'].includes(priority_level)) {
    errors.push('Priority level must be either "normal" or "urgent"');
  }

  // Validate text length limits
  if (additional_notes && additional_notes.length > 1000) {
    errors.push('Additional notes cannot exceed 1000 characters');
  }

  if (letter_purpose && letter_purpose.length > 500) {
    errors.push('Letter purpose cannot exceed 500 characters');
  }

  if (medical_requirements && medical_requirements.length > 1000) {
    errors.push('Medical requirements cannot exceed 1000 characters');
  }

  // Sanitize inputs (hospital info will be sanitized by HR during processing)

  if (additional_notes) {
    req.body.additional_notes = validator.escape(additional_notes.trim());
  }

  if (letter_purpose) {
    req.body.letter_purpose = validator.escape(letter_purpose.trim());
  }

  if (medical_requirements) {
    req.body.medical_requirements = validator.escape(medical_requirements.trim());
  }

  // Clean special tests array
  if (special_tests && Array.isArray(special_tests)) {
    req.body.special_tests = special_tests.map(test => validator.escape(test.trim()));
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Validate request ID parameter
const validateRequestId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !validator.isInt(id, { min: 1 })) {
    return res.status(400).json({
      success: false,
      error: 'Valid request ID is required'
    });
  }

  next();
};

// Validate query parameters for request listing
const validateRequestQuery = (req, res, next) => {
  const { page, limit, status, request_type, priority, assigned_to_me, sort, order } = req.query;
  const errors = [];

  if (page && !validator.isInt(page, { min: 1 })) {
    errors.push('Page must be a positive integer');
  }

  if (limit && !validator.isInt(limit, { min: 1, max: 100 })) {
    errors.push('Limit must be between 1 and 100');
  }

  // Handle comma-separated status values
  if (status) {
    const validStatuses = [
      'pending', 'assigned_to_hr', 'hr_processing', 'benefits_review',
      'welfare_review', 'hr_final_verification', 'approved', 'rejected',
      'letter_generated', 'letter_sent', 'completed'
    ];

    const statusList = status.split(',').map(s => s.trim());
    const invalidStatuses = statusList.filter(s => !validStatuses.includes(s));

    if (invalidStatuses.length > 0) {
      errors.push(`Invalid status filter(s): ${invalidStatuses.join(', ')}`);
    }
  }

  if (request_type && !['letter_of_approval', 'letter_of_authorization'].includes(request_type)) {
    errors.push('Invalid request type filter');
  }

  if (priority && !['normal', 'urgent'].includes(priority)) {
    errors.push('Invalid priority filter');
  }

  if (assigned_to_me && !['true', 'false'].includes(assigned_to_me)) {
    errors.push('assigned_to_me must be "true" or "false"');
  }

  // Validate sort parameter
  if (sort) {
    const validSortFields = [
      'id', 'request_number', 'request_type', 'current_status', 'priority_level',
      'created_at', 'updated_at', 'due_date', 'preferred_date', 'first_name', 'last_name'
    ];

    if (!validSortFields.includes(sort)) {
      errors.push(`Invalid sort field. Allowed values: ${validSortFields.join(', ')}`);
    }
  }

  // Validate order parameter
  if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
    errors.push('Order must be "asc" or "desc"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Query validation failed',
      details: errors
    });
  }

  next();
};

// Validate HR processing request (hospital information)
const validateHRProcessing = (req, res, next) => {
  const { 
    hospital_id, 
    hospital_name, 
    hospital_address, 
    hospital_contact,
    hr_assigned_hospital_id,
    approved_date, 
    comments, 
    conditions 
  } = req.body;
  const errors = [];

  // Hospital validation is now done in the controller based on request type
  // This validator focuses on format validation

  if (hospital_id && !validator.isInt(hospital_id.toString(), { min: 1 })) {
    errors.push('Valid hospital ID is required if provided');
  }

  if (hospital_name && hospital_name.trim().length < 2) {
    errors.push('Hospital name must be at least 2 characters if provided');
  }

  if (hospital_address && hospital_address.trim().length < 10) {
    errors.push('Hospital address must be at least 10 characters if provided');
  }

  // Validate hospital contact number - allow Philippine landlines and mobile numbers
  // Format examples: (02) 1234-5678, 02-12345678, 0917-123-4567, +639171234567, 09171234567
  if (hospital_contact) {
    const contactStr = hospital_contact.trim();
    // Remove common phone number formatting characters for validation
    const cleaned = contactStr.replace(/[\s\-\(\)]/g, '');

    // Check if it's a valid Philippine phone number format
    // Mobile: starts with 09 or +639, 11 digits (09171234567) or 13 digits (+639171234567)
    // Landline: starts with 02 or other area codes, 7-10 digits
    const isValidFormat = /^(\+?63|0)[0-9]{9,11}$/.test(cleaned);

    if (!isValidFormat || cleaned.length < 7) {
      errors.push('Valid hospital contact number is required if provided');
    }
  }

  if (hr_assigned_hospital_id && !validator.isInt(hr_assigned_hospital_id.toString(), { min: 1 })) {
    errors.push('Valid HR assigned hospital ID is required if provided');
  }

  if (approved_date && !validator.isDate(approved_date)) {
    errors.push('Valid approved date is required if provided');
  }

  if (approved_date) {
    const appDate = new Date(approved_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appDate < today) {
      errors.push('Approved date cannot be in the past');
    }
  }

  if (conditions && conditions.length > 500) {
    errors.push('Conditions cannot exceed 500 characters');
  }

  if (comments && comments.length > 1000) {
    errors.push('Comments cannot exceed 1000 characters');
  }

  // Sanitize inputs
  if (hospital_name) {
    req.body.hospital_name = validator.escape(hospital_name.trim());
  }
  
  if (hospital_address) {
    req.body.hospital_address = validator.escape(hospital_address.trim());
  }

  if (comments) {
    req.body.comments = validator.escape(comments.trim());
  }

  if (conditions) {
    req.body.conditions = validator.escape(conditions.trim());
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'HR processing validation failed',
      details: errors
    });
  }

  next();
};

// Validate update request status (for workflow actions)
const validateRequestStatusUpdate = (req, res, next) => {
  const { action, comments, assigned_hospital_id, approved_date, conditions } = req.body;
  const errors = [];

  if (!action) {
    errors.push('Action is required');
  } else if (!['assign', 'claim', 'approve', 'reject', 'reassign', 'complete'].includes(action)) {
    errors.push('Invalid action specified');
  }

  if (action === 'reject' && (!comments || comments.trim().length < 10)) {
    errors.push('Rejection reason (comments) is required and must be at least 10 characters');
  }

  if (assigned_hospital_id && !validator.isInt(assigned_hospital_id.toString(), { min: 1 })) {
    errors.push('Valid assigned hospital ID is required if provided');
  }

  if (approved_date && !validator.isDate(approved_date)) {
    errors.push('Valid approved date is required if provided');
  }

  // Validate approved date is not in the past (but allow today)
  if (approved_date) {
    const appDate = new Date(approved_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appDate < today) {
      errors.push('Approved date cannot be in the past');
    }
  }

  if (conditions && conditions.length > 500) {
    errors.push('Conditions cannot exceed 500 characters');
  }

  if (comments && comments.length > 1000) {
    errors.push('Comments cannot exceed 1000 characters');
  }

  // Sanitize inputs
  if (comments) {
    req.body.comments = validator.escape(comments.trim());
  }

  if (conditions) {
    req.body.conditions = validator.escape(conditions.trim());
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Status update validation failed',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateCreateRequest,
  validateRequestId,
  validateRequestQuery,
  validateHRProcessing,
  validateRequestStatusUpdate
};