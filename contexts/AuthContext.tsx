'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, userAPI } from '@/utils/api';
import api from '@/utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    id: number;
    user: number;
    user_type: 'student' | 'organizer' | 'admin';
    university_name?: string;
    contact_number?: string;
    department?: string;
    is_verified?: boolean;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<string>; // Returns user_type for redirect
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Try to get current user with profile
        try {
          const currentUserResponse = await userAPI.getCurrentUser();
          if (currentUserResponse.data) {
            const userData = currentUserResponse.data.user;
            const profileData = currentUserResponse.data.profile;
            
            setUser({
              id: userData.id,
              username: userData.username,
              email: userData.email || '',
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              profile: profileData
            });
          }
        } catch (meError) {
          // Fallback to getProfile if /me/ endpoint doesn't exist
          const profileResponse = await userAPI.getProfile();
          let profileData: any = null;
          
          if (Array.isArray(profileResponse.data) && profileResponse.data.length > 0) {
            profileData = profileResponse.data[0];
          } else if (profileResponse.data) {
            profileData = profileResponse.data;
          }

          if (profileData) {
            setUser({
              id: profileData.user,
              username: profileData.user?.toString() || 'user',
              email: '',
              first_name: '',
              last_name: '',
              profile: profileData
            });
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<string> => {
    try {
      const response = await authAPI.login({ username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Get current user with profile
      try {
        const currentUserResponse = await userAPI.getCurrentUser();
        if (currentUserResponse.data) {
          const userData = currentUserResponse.data.user;
          const profileData = currentUserResponse.data.profile;
          
          setUser({
            id: userData.id,
            username: userData.username || username,
            email: userData.email || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            profile: profileData
          });
          
          // Return user_type for redirect
          return profileData.user_type || 'student';
        }
      } catch (meError) {
        // Fallback to getProfile if /me/ endpoint doesn't exist
        const profileResponse = await userAPI.getProfile();
        let profileData: any = null;
        
        if (Array.isArray(profileResponse.data) && profileResponse.data.length > 0) {
          profileData = profileResponse.data[0];
        } else if (profileResponse.data) {
          profileData = profileResponse.data;
        }

        if (profileData) {
          setUser({
            id: profileData.user,
            username: username,
            email: '',
            first_name: '',
            last_name: '',
            profile: profileData
          });
          
          return profileData.user_type || 'student';
        }
      }
      
      return 'student'; // Default fallback
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};