const validator = require('validator');

// Validate registration request
const validateRegister = (req, res, next) => {
  const { employee_id, email, password, first_name, last_name, middle_name, role, department, position, contact_number } = req.body;
  const errors = [];

 // Role validation
  const allowedRoles = ['executive', 'hr_personnel', 'benefits_officer', 'welfare_head', 'admin'];
  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Role must be one of: ${allowedRoles.join(', ')}`
    });
  }

  req.body = {
    ...req.body,
    role: role.trim()
  };

  // Required fields
  if (!employee_id || typeof employee_id !== 'string' || employee_id.trim().length < 2) {
    errors.push('Employee ID must be at least 2 characters long');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (middle_name && (typeof middle_name !== 'string' || middle_name.trim().length < 1)) {
    errors.push('Middle name must be at least 1 character long if provided');
  }
  if (!role || !['executive', 'hr_personnel', 'benefits_officer', 'welfare_head', 'admin'].includes(role)) {
    errors.push('Role must be one of the following: executive, hr personnel, benefits officer, welfare head, admin');
  }

  // Optional fields validation
  if (department && (typeof department !== 'string' || department.trim().length < 2)) {
    errors.push('Department must be at least 2 characters long if provided');
  }

  if (position && (typeof position !== 'string' || position.trim().length < 2)) {
    errors.push('Position must be at least 2 characters long if provided');
  }

  if (contact_number && !validator.isMobilePhone(contact_number, 'any')) {
    errors.push('Valid phone number is required if provided');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Sanitize inputs
  req.body.employee_id = validator.escape(employee_id.trim());
  req.body.email = validator.normalizeEmail(email);
  req.body.first_name = validator.escape(first_name.trim());
  req.body.last_name = validator.escape(last_name.trim());
  if (middle_name) req.body.middle_name = validator.escape(middle_name.trim());
  req.body.role = role.trim();
  if (department) req.body.department = validator.escape(department.trim());
  if (position) req.body.position = validator.escape(position.trim());
  if (contact_number) req.body.contact_number = contact_number.trim();
  

  next();
};

// Validate login request
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 1) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  req.body.email = validator.normalizeEmail(email);
  next();
};

// Validate profile update request
const validateUpdateProfile = (req, res, next) => {
  const { first_name, last_name, email, department, position, contact_number } = req.body;
  const errors = [];

  // Required fields
  if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  // Optional fields
  if (department && (typeof department !== 'string' || department.trim().length < 2)) {
    errors.push('Department must be at least 2 characters long if provided');
  }

  if (position && (typeof position !== 'string' || position.trim().length < 2)) {
    errors.push('Position must be at least 2 characters long if provided');
  }

  if (contact_number && !validator.isMobilePhone(contact_number, 'any')) {
    errors.push('Valid phone number is required if provided');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Sanitize inputs
  req.body.email = validator.normalizeEmail(email);
  req.body.first_name = validator.escape(first_name.trim());
  req.body.last_name = validator.escape(last_name.trim());
  if (department) req.body.department = validator.escape(department.trim());
  if (position) req.body.position = validator.escape(position.trim());
  if (contact_number) req.body.contact_number = contact_number.trim();

  next();
};

// Validate change password request
const validateChangePassword = (req, res, next) => {
  const { current_password, new_password } = req.body;
  const errors = [];

  if (!current_password) {
    errors.push('Current password is required');
  }

  if (!new_password || new_password.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  if (current_password === new_password) {
    errors.push('New password must be different from current password');
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

// Sanitize object - keep only allowed fields
const sanitizeObject = (obj, allowedFields) => {
  const sanitized = {};
  allowedFields.forEach(field => {
    if (obj[field] !== undefined) {
      sanitized[field] = obj[field];
    }
  });
  // Always include password and role if present in original object
  if (obj.password) sanitized.password = obj.password;
  if (obj.role) sanitized.role = obj.role;
  return sanitized;
};

// Validate registration data (for authController)
const validateRegistration = (data) => {
  const errors = [];

  // Required fields
  if (!data.employee_id || data.employee_id.trim().length < 2) {
    errors.push('Employee ID must be at least 2 characters');
  }

  if (!data.email || !validator.isEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.first_name || data.first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!data.last_name || data.last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  if (!data.role || !['executive', 'hr_personnel', 'benefits_officer', 'welfare_head', 'admin'].includes(data.role)) {
    errors.push('Valid role is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate profile update (for authController)
const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.first_name && data.first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (data.last_name && data.last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  if (data.email && !validator.isEmail(data.email)) {
    errors.push('Valid email required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate password change (for authController)
const validatePasswordChange = (data) => {
  const errors = [];

  if (!data.current_password) {
    errors.push('Current password is required');
  }

  if (!data.new_password || data.new_password.length < 6) {
    errors.push('New password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate refresh token (for authController)
const validateRefreshToken = (data) => {
  const errors = [];

  if (!data.refreshToken) {
    errors.push('Refresh token is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateRegistration,
  validateProfileUpdate,
  validatePasswordChange,
  validateRefreshToken,
  sanitizeObject
};