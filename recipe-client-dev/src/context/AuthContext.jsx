import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/mongodbClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          const { user, error } = await authAPI.getProfile(savedToken);
          if (!error && user) {
            setUser(user);
            setToken(savedToken);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign up function
  const signUp = async (email, password, fullName) => {
    try {
      setError(null);
      const { user, token, error } = await authAPI.signUp(email, password, fullName);
      
      if (error) {
        setError(error);
        return { user: null, error };
      }

      localStorage.setItem('token', token);
      setUser(user);
      setToken(token);
      return { user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setError(null);
      const { user, token, error } = await authAPI.signIn(email, password);
      
      if (error) {
        setError(error);
        return { user: null, error };
      }

      localStorage.setItem('token', token);
      setUser(user);
      setToken(token);
      return { user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setError(null);
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      if (!token) throw new Error('Not authenticated');
      
      setError(null);
      const { user, error } = await authAPI.updateProfile(token, updates);
      
      if (error) {
        setError(error);
        return { user: null, error };
      }

      setUser(user);
      return { user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    }
  };

  // Get user profile function
  const getUserProfile = async (userId) => {
    try {
      if (!token) throw new Error('Not authenticated');
      
      const { user, error } = await authAPI.getProfile(token);
      
      if (error) {
        return { user: null, error };
      }

      return { user, error: null };
    } catch (err) {
      return { user: null, error: err.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
