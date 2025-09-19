/**
 * Role-based permissions configuration for MetroExecuCare system
 */

// Define all possible permissions in the system
const PERMISSIONS = {
  // Request Management
  REQUEST_CREATE: 'request:create',
  REQUEST_VIEW_OWN: 'request:view:own',
  REQUEST_VIEW_ALL: 'request:view:all',
  REQUEST_VIEW_ASSIGNED: 'request:view:assigned',
  REQUEST_UPDATE_OWN: 'request:update:own',
  REQUEST_UPDATE_ALL: 'request:update:all',
  REQUEST_DELETE_OWN: 'request:delete:own',
  REQUEST_DELETE_ALL: 'request:delete:all',
  
  // Request Processing
  REQUEST_ASSIGN: 'request:assign',
  REQUEST_CLAIM: 'request:claim',
  REQUEST_PROCESS: 'request:process',
  REQUEST_APPROVE_HR: 'request:approve:hr',
  REQUEST_APPROVE_BENEFITS: 'request:approve:benefits',
  REQUEST_APPROVE_WELFARE: 'request:approve:welfare',
  REQUEST_REJECT: 'request:reject',
  REQUEST_REASSIGN: 'request:reassign',
  
  // Hospital Management
  HOSPITAL_VIEW: 'hospital:view',
  HOSPITAL_CREATE: 'hospital:create',
  HOSPITAL_UPDATE: 'hospital:update',
  HOSPITAL_DELETE: 'hospital:delete',
  HOSPITAL_ASSIGN: 'hospital:assign',
  
  // File Management
  FILE_UPLOAD: 'file:upload',
  FILE_DOWNLOAD_OWN: 'file:download:own',
  FILE_DOWNLOAD_ALL: 'file:download:all',
  FILE_DELETE_OWN: 'file:delete:own',
  FILE_DELETE_ALL: 'file:delete:all',
  
  // Letter Generation
  LETTER_GENERATE: 'letter:generate',
  LETTER_SEND: 'letter:send',
  LETTER_VIEW: 'letter:view',
  
  // User Management
  USER_VIEW_OWN: 'user:view:own',
  USER_VIEW_ALL: 'user:view:all',
  USER_CREATE: 'user:create',
  USER_UPDATE_OWN: 'user:update:own',
  USER_UPDATE_ALL: 'user:update:all',
  USER_DELETE: 'user:delete',
  USER_ACTIVATE: 'user:activate',
  
  // System Management
  SYSTEM_SETTINGS_VIEW: 'system:settings:view',
  SYSTEM_SETTINGS_UPDATE: 'system:settings:update',
  SYSTEM_LOGS_VIEW: 'system:logs:view',
  SYSTEM_REPORTS_VIEW: 'system:reports:view',
  
  // FAQ Management
  FAQ_VIEW: 'faq:view',
  FAQ_CREATE: 'faq:create',
  FAQ_UPDATE: 'faq:update',
  FAQ_DELETE: 'faq:delete',
  
  // Notification Management
  NOTIFICATION_VIEW_OWN: 'notification:view:own',
  NOTIFICATION_VIEW_ALL: 'notification:view:all',
  NOTIFICATION_CREATE: 'notification:create',
  NOTIFICATION_SEND: 'notification:send'
};

// Define role-based permissions
const ROLE_PERMISSIONS = {
  executive: [
    // Request Management - Executive can create and manage their own requests
    PERMISSIONS.REQUEST_CREATE,
    PERMISSIONS.REQUEST_VIEW_OWN,
    PERMISSIONS.REQUEST_UPDATE_OWN,
    PERMISSIONS.REQUEST_DELETE_OWN,
    
    // File Management - Can upload and download their own files
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_DOWNLOAD_OWN,
    PERMISSIONS.FILE_DELETE_OWN,
    
    // Hospital Viewing
    PERMISSIONS.HOSPITAL_VIEW,
    
    // User Profile Management
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    
    // FAQ and Notifications
    PERMISSIONS.FAQ_VIEW,
    PERMISSIONS.NOTIFICATION_VIEW_OWN,
    
    // Letter Viewing (their own)
    PERMISSIONS.LETTER_VIEW
  ]
};

// Build other roles by extending previous roles
ROLE_PERMISSIONS.hr_personnel = [
  // All executive permissions
  ...ROLE_PERMISSIONS.executive,
  
  // Request Management - HR can view and process assigned requests
  PERMISSIONS.REQUEST_VIEW_ASSIGNED,
  PERMISSIONS.REQUEST_CLAIM,
  PERMISSIONS.REQUEST_PROCESS,
  PERMISSIONS.REQUEST_ASSIGN,
  PERMISSIONS.REQUEST_APPROVE_HR,
  PERMISSIONS.REQUEST_REASSIGN,
  
  // Hospital Management - HR can assign hospitals
  PERMISSIONS.HOSPITAL_ASSIGN,
  PERMISSIONS.HOSPITAL_CREATE,
  PERMISSIONS.HOSPITAL_UPDATE,
  
  // File Management - Can manage files for assigned requests
  PERMISSIONS.FILE_DOWNLOAD_ALL,
  
  // Letter Generation
  PERMISSIONS.LETTER_GENERATE,
  PERMISSIONS.LETTER_SEND,
  
  // User Management - Limited user viewing
  PERMISSIONS.USER_VIEW_ALL,
  
  // Notifications
  PERMISSIONS.NOTIFICATION_CREATE,
  PERMISSIONS.NOTIFICATION_SEND,
  
  // Basic reports
  PERMISSIONS.SYSTEM_REPORTS_VIEW
];

ROLE_PERMISSIONS.benefits_officer = [
  // All HR personnel permissions
  ...ROLE_PERMISSIONS.hr_personnel,
  
  // Request Management - Benefits officer can approve at benefits stage
  PERMISSIONS.REQUEST_VIEW_ALL,
  PERMISSIONS.REQUEST_APPROVE_BENEFITS,
  PERMISSIONS.REQUEST_REJECT,
  
  // Enhanced file management
  PERMISSIONS.FILE_DELETE_ALL,
  
  // System access
  PERMISSIONS.SYSTEM_LOGS_VIEW
];

ROLE_PERMISSIONS.welfare_head = [
  // All benefits officer permissions
  ...ROLE_PERMISSIONS.benefits_officer,
  
  // Request Management - Final approval authority
  PERMISSIONS.REQUEST_APPROVE_WELFARE,
  PERMISSIONS.REQUEST_UPDATE_ALL,
  
  // Hospital Management - Full access
  PERMISSIONS.HOSPITAL_DELETE,
  
  // User Management - Enhanced access
  PERMISSIONS.USER_UPDATE_ALL,
  PERMISSIONS.USER_ACTIVATE,
  
  // FAQ Management
  PERMISSIONS.FAQ_CREATE,
  PERMISSIONS.FAQ_UPDATE,
  PERMISSIONS.FAQ_DELETE,
  
  // System Settings
  PERMISSIONS.SYSTEM_SETTINGS_VIEW,
  
  // Notification Management
  PERMISSIONS.NOTIFICATION_VIEW_ALL
];

ROLE_PERMISSIONS.admin = [
  // All permissions - System administrator
  ...Object.values(PERMISSIONS)
];

/**
 * Check if a user has a specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if user has permission
 */
const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions ? rolePermissions.includes(permission) : false;
};

/**
 * Check if a user has any of the specified permissions
 * @param {string} userRole - User's role
 * @param {array} permissions - Array of permissions to check
 * @returns {boolean} - True if user has at least one permission
 */
const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if a user has all of the specified permissions
 * @param {string} userRole - User's role
 * @param {array} permissions - Array of permissions to check
 * @returns {boolean} - True if user has all permissions
 */
const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a role
 * @param {string} userRole - User's role
 * @returns {array} - Array of permissions for the role
 */
const getRolePermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Check if a user can access a specific resource
 * @param {object} user - User object
 * @param {string} resourceType - Type of resource (request, file, etc.)
 * @param {object} resource - Resource object
 * @param {string} action - Action to perform
 * @returns {boolean} - True if user can access resource
 */
const canAccessResource = (user, resourceType, resource, action) => {
  const userRole = user.role;
  const userId = user.id;
  
  switch (resourceType) {
    case 'request':
      // Executives can only access their own requests
      if (userRole === 'executive') {
        return resource.employee_id === userId && 
               hasPermission(userRole, `request:${action}:own`);
      }
      
      // HR personnel can access assigned requests
      if (userRole === 'hr_personnel') {
        return resource.assigned_hr_id === userId || 
               hasPermission(userRole, `request:${action}:all`);
      }
      
      // Benefits officers and welfare heads can access all requests
      if (['benefits_officer', 'welfare_head', 'admin'].includes(userRole)) {
        return hasPermission(userRole, `request:${action}:all`);
      }
      
      return false;
    
    case 'file':
      // Similar logic for files
      if (userRole === 'executive') {
        return resource.request?.employee_id === userId && 
               hasPermission(userRole, `file:${action}:own`);
      }
      
      return hasPermission(userRole, `file:${action}:all`);
    
    case 'user':
      // Users can access their own profile
      if (resource.id === userId) {
        return hasPermission(userRole, `user:${action}:own`);
      }
      
      // Check if user can access other users
      return hasPermission(userRole, `user:${action}:all`);
    
    default:
      return false;
  }
};

/**
 * Get workflow permissions for approval process
 * @param {string} userRole - User's role
 * @returns {object} - Object containing workflow permissions
 */
const getWorkflowPermissions = (userRole) => {
  return {
    canAssignRequests: hasPermission(userRole, PERMISSIONS.REQUEST_ASSIGN),
    canProcessRequests: hasPermission(userRole, PERMISSIONS.REQUEST_PROCESS),
    canApproveAtHRStage: hasPermission(userRole, PERMISSIONS.REQUEST_APPROVE_HR),
    canApproveAtBenefitsStage: hasPermission(userRole, PERMISSIONS.REQUEST_APPROVE_BENEFITS),
    canApproveAtWelfareStage: hasPermission(userRole, PERMISSIONS.REQUEST_APPROVE_WELFARE),
    canRejectRequests: hasPermission(userRole, PERMISSIONS.REQUEST_REJECT),
    canReassignRequests: hasPermission(userRole, PERMISSIONS.REQUEST_REASSIGN),
    canGenerateLetters: hasPermission(userRole, PERMISSIONS.LETTER_GENERATE),
    canSendLetters: hasPermission(userRole, PERMISSIONS.LETTER_SEND)
  };
};

/**
 * Define role hierarchy for escalation purposes
 */
const ROLE_HIERARCHY = {
  executive: 1,
  hr_personnel: 2,
  benefits_officer: 3,
  welfare_head: 4,
  admin: 5
};

/**
 * Check if user role has higher or equal hierarchy level
 * @param {string} userRole - User's role
 * @param {string} targetRole - Target role to compare
 * @returns {boolean} - True if user role has higher or equal level
 */
const hasHigherOrEqualRole = (userRole, targetRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
};

/**
 * Get next approval role in the workflow
 * @param {string} currentRole - Current approver role
 * @returns {string|null} - Next role in approval chain or null if final
 */
const getNextApprovalRole = (currentRole) => {
  const approvalChain = {
    hr_personnel: 'benefits_officer',
    benefits_officer: 'welfare_head',
    welfare_head: null // Final approval
  };
  
  return approvalChain[currentRole] || null;
};

/**
 * Validate role assignment
 * @param {string} assignerRole - Role of person assigning
 * @param {string} targetRole - Role being assigned
 * @returns {boolean} - True if assignment is valid
 */
const canAssignRole = (assignerRole, targetRole) => {
  // Only admin can assign admin role
  if (targetRole === 'admin') {
    return assignerRole === 'admin';
  }
  
  // Admin can assign any role
  if (assignerRole === 'admin') {
    return true;
  }
  
  // Welfare head can assign roles below them
  if (assignerRole === 'welfare_head') {
    return ['executive', 'hr_personnel', 'benefits_officer'].includes(targetRole);
  }
  
  // Benefits officer can assign HR personnel and executive
  if (assignerRole === 'benefits_officer') {
    return ['executive', 'hr_personnel'].includes(targetRole);
  }
  
  return false;
};

/**
 * Get approval workflow stages for a request type
 * @param {string} requestType - Type of request
 * @returns {array} - Array of approval stages
 */

const getApprovalWorkflow = (requestType) => {
  const workflows = {
    annual_checkup: [
      { stage: 'hr_stage', role: 'hr_personnel', order: 1 },
      { stage: 'benefits_stage', role: 'benefits_officer', order: 2 },
      { stage: 'welfare_stage', role: 'welfare_head', order: 3 }
    ],
    special_request: [
      { stage: 'hr_stage', role: 'hr_personnel', order: 1 },
      { stage: 'benefits_stage', role: 'benefits_officer', order: 2 },
      { stage: 'welfare_stage', role: 'welfare_head', order: 3 }
    ],
    letter_of_approval: [
      { stage: 'hr_stage', role: 'hr_personnel', order: 1 },
      { stage: 'benefits_stage', role: 'benefits_officer', order: 2 }
    ],
    letter_of_authorization: [
      { stage: 'hr_stage', role: 'hr_personnel', order: 1 },
      { stage: 'welfare_stage', role: 'welfare_head', order: 2 }
    ]
  };
  
  return workflows[requestType] || workflows.annual_checkup;
};

/**
 * Check if user can approve at current workflow stage
 * @param {string} userRole - User's role
 * @param {string} currentStage - Current workflow stage
 * @returns {boolean} - True if user can approve at this stage
 */
const canApproveAtStage = (userRole, currentStage) => {
  const stagePermissions = {
    hr_stage: PERMISSIONS.REQUEST_APPROVE_HR,
    benefits_stage: PERMISSIONS.REQUEST_APPROVE_BENEFITS,
    welfare_stage: PERMISSIONS.REQUEST_APPROVE_WELFARE
  };
  
  const requiredPermission = stagePermissions[currentStage];
  return requiredPermission ? hasPermission(userRole, requiredPermission) : false;
};

/**
 * Get user's dashboard permissions
 * @param {string} userRole - User's role
 * @returns {object} - Dashboard permissions
 */
const getDashboardPermissions = (userRole) => {
  return {
    canViewAllRequests: hasPermission(userRole, PERMISSIONS.REQUEST_VIEW_ALL),
    canViewAssignedRequests: hasPermission(userRole, PERMISSIONS.REQUEST_VIEW_ASSIGNED),
    canViewOwnRequests: hasPermission(userRole, PERMISSIONS.REQUEST_VIEW_OWN),
    canCreateRequests: hasPermission(userRole, PERMISSIONS.REQUEST_CREATE),
    canProcessRequests: hasPermission(userRole, PERMISSIONS.REQUEST_PROCESS),
    canManageUsers: hasPermission(userRole, PERMISSIONS.USER_UPDATE_ALL),
    canManageHospitals: hasPermission(userRole, PERMISSIONS.HOSPITAL_UPDATE),
    canViewReports: hasPermission(userRole, PERMISSIONS.SYSTEM_REPORTS_VIEW),
    canManageSystem: hasPermission(userRole, PERMISSIONS.SYSTEM_SETTINGS_UPDATE)
  };
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessResource,
  getWorkflowPermissions,
  hasHigherOrEqualRole,
  getNextApprovalRole,
  canAssignRole,
  getApprovalWorkflow,
  canApproveAtStage,
  getDashboardPermissions
};