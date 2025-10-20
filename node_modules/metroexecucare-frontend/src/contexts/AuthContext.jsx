import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '@/services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (token) {
        // Validate token format before using it
        if (!token || token.split('.').length !== 3) {
          console.warn('Invalid JWT token format, clearing token');
          localStorage.removeItem('authToken');
          apiService.clearAuthToken();
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Set the token in API service before making requests
        apiService.setAuthToken(token);

        try {
          // Verify token with backend
          const response = await apiService.getProfile();

          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            apiService.clearAuthToken();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token is invalid or network error, clear it
          localStorage.removeItem('authToken');
          apiService.clearAuthToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(credentials);

      if (response.success) {
        // Important: Clear any stale state before setting new user
        // This ensures components don't mix data from previous user
        setUser(null);
        setIsAuthenticated(false);

        // Small delay to ensure state clears
        await new Promise(resolve => setTimeout(resolve, 50));

        // Now set the new user
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    apiService.clearAuthToken();
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    // Don't force navigation here - let the component handle it
    // This prevents losing URL parameters when navigating back to login
  };

  // Force logout for testing/debugging
  const forceLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    apiService.clearAuthToken();
    localStorage.clear(); // Clear all localStorage
    sessionStorage.clear();
    // Don't force navigation here - let the component handle it
    // This prevents losing URL parameters when navigating back to login
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    forceLogout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};