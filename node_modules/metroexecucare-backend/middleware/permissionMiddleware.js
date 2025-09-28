const { 
  hasPermission, 
  hasAnyPermission, 
  canAccessResource,
  getWorkflowPermissions 
} = require('../config/rolePermissions');

/**
 * Middleware to check if user has specific permission
 * @param {string} permission - Required permission
 * @returns {function} - Express middleware function
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const userRole = req.user.role;
      
      if (!hasPermission(userRole, permission)) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${permission}`,
          error: 'INSUFFICIENT_PERMISSIONS',
          required_permission: permission,
          user_role: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 * @param {array} permissions - Array of permissions (user needs at least one)
 * @returns {function} - Express middleware function
 */
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const userRole = req.user.role;
      
      if (!hasAnyPermission(userRole, permissions)) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required one of: ${permissions.join(', ')}`,
          error: 'INSUFFICIENT_PERMISSIONS',
          required_permissions: permissions,
          user_role: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware to check resource-specific access
 * @param {string} resourceType - Type of resource (request, file, user)
 * @param {string} action - Action to perform
 * @param {function} resourceGetter - Function to get resource from request
 * @returns {function} - Express middleware function
 */
const requireResourceAccess = (resourceType, action, resourceGetter) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      // Get the resource using the provided getter function
      const resource = await resourceGetter(req);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`,
          error: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check if user can access this specific resource
      const hasAccess = canAccessResource(req.user, resourceType, resource, action);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${action} this ${resourceType}`,
          error: 'RESOURCE_ACCESS_DENIED',
          resource_type: resourceType,
          action: action
        });
      }

      // Attach resource to request for use in controller
      req[resourceType] = resource;
      next();
    } catch (error) {
      console.error('Resource access check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Resource access check failed',
        error: 'RESOURCE_ACCESS_ERROR'
      });
    }
  };
};

/**
 * Middleware for workflow stage permissions
 * @param {string} stage - Workflow stage (hr, benefits, welfare)
 * @returns {function} - Express middleware function
 */
const requireWorkflowStage = (stage) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const userRole = req.user.role;
      const workflowPermissions = getWorkflowPermissions(userRole);
      
      let hasStagePermission = false;
      
      switch (stage) {
        case 'hr':
          hasStagePermission = workflowPermissions.canApproveAtHRStage;
          break;
        case 'benefits':
          hasStagePermission = workflowPermissions.canApproveAtBenefitsStage;
          break;
        case 'welfare':
          hasStagePermission = workflowPermissions.canApproveAtWelfareStage;
          break;
        case 'process':
          hasStagePermission = workflowPermissions.canProcessRequests;
          break;
        case 'assign':
          hasStagePermission = workflowPermissions.canAssignRequests;
          break;
        default:
          hasStagePermission = false;
      }

      if (!hasStagePermission) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to perform actions at ${stage} stage`,
          error: 'WORKFLOW_STAGE_ACCESS_DENIED',
          stage: stage,
          user_role: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Workflow stage check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Workflow stage check failed',
        error: 'WORKFLOW_STAGE_ERROR'
      });
    }
  };
};

/**
 * Middleware to check if user owns the resource
 * @param {function} ownershipChecker - Function to check ownership
 * @returns {function} - Express middleware function
 */
const requireOwnership = (ownershipChecker) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const isOwner = await ownershipChecker(req.user, req.params, req.query);
      
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own resources',
          error: 'OWNERSHIP_REQUIRED'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Ownership check failed',
        error: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware to attach user permissions to request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const attachUserPermissions = (req, res, next) => {
  try {
    if (req.user) {
      const userRole = req.user.role;
      req.userPermissions = {
        role: userRole,
        workflow: getWorkflowPermissions(userRole),
        // Add more permission categories as needed
      };
    }
    
    next();
  } catch (error) {
    console.error('Error attaching user permissions:', error.message);
    next(); // Continue without permissions if there's an error
  }
};

// Specific permission middleware for common use cases
const canCreateRequests = requirePermission('request:create');
const canViewAllRequests = requirePermission('request:view:all');
const canProcessRequests = requireWorkflowStage('process');
const canAssignRequests = requireWorkflowStage('assign');
const canApproveAtHR = requireWorkflowStage('hr');
const canApproveAtBenefits = requireWorkflowStage('benefits');
const canApproveAtWelfare = requireWorkflowStage('welfare');
const canManageUsers = requirePermission('user:update:all');
const canManageSystem = requirePermission('system:settings:update');
const canViewReports = requirePermission('system:reports:view');

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireResourceAccess,
  requireWorkflowStage,
  requireOwnership,
  attachUserPermissions,
  // Specific middleware exports
  canCreateRequests,
  canViewAllRequests,
  canProcessRequests,
  canAssignRequests,
  canApproveAtHR,
  canApproveAtBenefits,
  canApproveAtWelfare,
  canManageUsers,
  canManageSystem,
  canViewReports
};