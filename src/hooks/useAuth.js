import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    const result = await AuthService.login(username, password);
    if (result.success) {
      setIsLoggedIn(true);
    }
    return result;
  };

  const logout = async () => {
    await AuthService.logout();
    setIsLoggedIn(false);
  };

  return {
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
}