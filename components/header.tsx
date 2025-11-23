'use client';
import Link from "next/link";
import {
  Menu,
  X,
  Calendar,
  Users,
  School,
  User as UserIcon,
  BarChart3,
  Plus,
  Ticket,
  LucideProps
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from '@/contexts/AuthContext'; // Use the existing AuthContext
import { ForwardRefExoticComponent, RefAttributes } from 'react';

type UserRole = 'public' | 'student' | 'organizer' | 'admin';

interface NavItem {
  href: string;
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

const navConfig: Record<UserRole, NavItem[]> = {
  public: [
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: School },
  ],
  student: [
    { href: "/dashboard/student", label: "Dashboard", icon: UserIcon },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/dashboard/student/my-events", label: "My Events", icon: Ticket },
  ],
  organizer: [
    { href: "/dashboard/organizer", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/organizer/create-event", label: "Create Event", icon: Plus },
    { href: "/dashboard/organizer/events", label: "My Events", icon: Calendar },
    { href: "/dashboard/organizer/attendees", label: "Participants", icon: Users },
  ],
  admin: [
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: School },
  ]
};

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading, isAuthenticated } = useAuth(); // Use the existing AuthContext

  // Hide header in admin dashboard
  if (pathname?.startsWith('/dashboard/admin')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // Get role from user profile, default to 'public' if not authenticated
  const role: UserRole = user?.profile?.user_type || 'public';
  const navItems = navConfig[role];
  const isOrganizerDashboard = role === 'organizer' && pathname?.startsWith('/dashboard/organizer');
  const visibleNavItems = isOrganizerDashboard ? [] : navItems;
  const dashboardShortcutHrefByRole: Record<UserRole, string> = {
    public: '/dashboard',
    student: '/dashboard/student',
    organizer: '/dashboard/organizer',
    admin: '/dashboard/admin',
  };
  const dashboardShortcutHref = dashboardShortcutHrefByRole[role] || '/dashboard';
  const hasDashboardNavItem = visibleNavItems.some((item) => item.label === 'Dashboard');
  const shouldShowDashboardShortcut = isAuthenticated && !hasDashboardNavItem;

  if (loading) {
    return (
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex justify-between items-center px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Calendar className="h-6 w-6" />
            Evex
          </Link>
          <div className="animate-pulse bg-muted h-6 w-20 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-7xl flex justify-between items-center px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Calendar className="h-6 w-6" />
          Evex
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {visibleNavItems.map((item: NavItem) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="text-sm hover:text-primary transition-colors">
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground capitalize">{role}</span>
              {shouldShowDashboardShortcut && (
                <Link 
                  href={dashboardShortcutHref} 
                  className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="text-sm"
              >
                Logout
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
          >
            <nav className="px-4 py-4 space-y-4">
              {/* Mobile Theme Toggle */}
              <div className="flex justify-center py-2">
                <ThemeToggle />
              </div>

              {visibleNavItems.map((item: NavItem) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Mobile Auth Buttons */}
              <div className="pt-2 border-t space-y-2">
                {!isAuthenticated ? (
                  <>
                    <Link 
                      href="/login" 
                      className="block text-sm hover:text-primary text-center transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 text-center transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground capitalize text-center">Role: {role}</div>
                    {shouldShowDashboardShortcut && (
                      <Link 
                        href={dashboardShortcutHref} 
                        className="flex items-center gap-2 text-sm hover:text-primary justify-center transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserIcon className="h-4 w-4" />
                        Dashboard
                      </Link>
                    )}
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleLogout} 
                        variant="outline" 
                        size="sm"
                        className="text-sm"
                      >
                        Logout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}