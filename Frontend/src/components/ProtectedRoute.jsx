import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requireAuth = true
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to="/loginpage"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0 && user) {
    const userRole = user.role?.toLowerCase();
    const hasRequiredRole = requiredRoles.some(role =>
      role.toLowerCase() === userRole
    );

    if (!hasRequiredRole) {
      // Redirect based on user's actual role
      if (userRole === 'admin') {
        return <Navigate to="/admin-users-page" replace />;
      } else if (userRole === 'executive') {
        return <Navigate to="/executive-employee-dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // Render the protected component
  return children;
};

// Convenience components for specific roles
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const ExecutiveRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['executive']}>
    {children}
  </ProtectedRoute>
);

export const HRRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['hr_personnel', 'hr_manager']}>
    {children}
  </ProtectedRoute>
);

export const ApproverRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['benefits_officer', 'welfare_head']}>
    {children}
  </ProtectedRoute>
);