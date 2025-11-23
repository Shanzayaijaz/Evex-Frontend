'use client';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  Calendar,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Sparkles,
  Plus,
  Megaphone,
  Ticket,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function OrganizerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();

  const organizerNavigation = [
    { name: "Overview", href: "/dashboard/organizer", icon: Home },
    { name: "My Events", href: "/dashboard/organizer/events", icon: Calendar },
    { name: "Create Event", href: "/dashboard/organizer/create-event", icon: Plus },
    { name: "Registrations & Attendees", href: "/dashboard/organizer/registrations", icon: CheckCircle },
    { name: "Analytics", href: "/dashboard/organizer/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/organizer/settings", icon: Settings },
  ];

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.profile?.user_type !== "organizer")) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.profile?.user_type !== "organizer") {
    return null;
  }

  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || "Organizer";
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "O";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
        <div className="flex flex-col h-full">
          <Link href="/" className="flex items-center gap-2 p-6 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Evex
              </span>
              <div className="flex items-center gap-1 mt-1">
                <Ticket className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Organizer Panel
                </span>
              </div>
            </div>
          </Link>

          <nav className="flex-1 p-4 space-y-2">
            {organizerNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user.profile?.user_type}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 mt-2 text-slate-600 dark:text-slate-400"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
