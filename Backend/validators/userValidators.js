const validator = require('validator');

// Validate update user request
const validateUpdateUser = (req, res, next) => {
  const { 
    first_name, 
    last_name, 
    email, 
    role, 
    department, 
    position, 
    phone 
  } = req.body;
  const errors = [];

  // Required fields validation
  if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  // Optional fields validation
  if (role && !['executive', 'hr_personnel', 'benefits_officer', 'welfare_head', 'admin'].includes(role)) {
    errors.push('Invalid role specified');
  }

  if (department && (typeof department !== 'string' || department.trim().length < 2)) {
    errors.push('Department must be at least 2 characters long if provided');
  }

  if (position && (typeof position !== 'string' || position.trim().length < 2)) {
    errors.push('Position must be at least 2 characters long if provided');
  }

  if (phone && !validator.isMobilePhone(phone, 'any')) {
    errors.push('Valid phone number is required if provided');
  }

  // Sanitize inputs
  if (first_name) req.body.first_name = validator.escape(first_name.trim());
  if (last_name) req.body.last_name = validator.escape(last_name.trim());
  if (email) req.body.email = validator.normalizeEmail(email);
  if (department) req.body.department = validator.escape(department.trim());
  if (position) req.body.position = validator.escape(position.trim());
  if (phone) req.body.phone = phone.trim();

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Validate update user status request
const validateUpdateUserStatus = (req, res, next) => {
  const { status } = req.body;
  const errors = [];

  if (!status) {
    errors.push('Status is required');
  } else if (!['active', 'inactive', 'suspended'].includes(status)) {
    errors.push('Status must be one of: active, inactive, suspended');
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

// Validate user ID parameter
const validateUserId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !validator.isInt(id, { min: 1 })) {
    return res.status(400).json({
      success: false,
      error: 'Valid user ID is required'
    });
  }

  next();
};

module.exports = {
  validateUpdateUser,
  validateUpdateUserStatus,
  validateUserId
};