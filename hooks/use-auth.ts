'use client';

import { useState, useEffect } from 'react';

type UserRole = 'public' | 'student' | 'organizer' | 'admin';

interface AuthState {
  user: any | null;
  role: UserRole;
}

// Mock auth hook - replace with real auth later
export function useAuth(): AuthState {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    role: 'public'
  });

  // For development - you can change this to test different roles
  useEffect(() => {
    // Mock: Change these values to test different scenarios
    const mockUser = null; // set to { id: '1', name: 'Test User' } for logged in
    const mockRole = 'public'; // change to 'student', 'organizer', 'admin'
    
    setAuth({
      user: mockUser,
      role: mockRole
    });
  }, []);

  return auth;
}