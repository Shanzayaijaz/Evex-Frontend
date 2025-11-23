"use client";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from './theme-provider';
import { RefreshProvider } from '@/contexts/RefreshContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RefreshProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </RefreshProvider>
    </ThemeProvider>
  );
}