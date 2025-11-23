'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { organizerAPI } from "@/utils/api";

interface OrganizerDashboardData {
  overview: {
    total_events: number;
    published_events: number;
    draft_events: number;
    total_registrations: number;
    recent_registrations: number;
  };
  upcoming_events: Array<{
    id: number;
    title: string;
    date_time: string;
    registered_count: number;
    participant_limit: number;
    status: string;
  }>;
  full_events_count: number;
}

const quickActions = [
  { label: "Create New Event", href: "/dashboard/organizer/create-event", icon: Plus },
  { label: "Manage Events", href: "/dashboard/organizer/events", icon: Calendar },
  { label: "View Registrations", href: "/dashboard/organizer/registrations", icon: Users },
  { label: "Event Analytics", href: "/dashboard/organizer/analytics", icon: BarChart3 },
];

export default function OrganizerOverview() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<OrganizerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.profile?.user_type !== "organizer")) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.profile?.user_type === "organizer") {
      fetchDashboard();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizerAPI.getDashboard();
      setDashboard(response.data);
    } catch (err: any) {
      console.error("Failed to load organizer dashboard", err);
      setError(err.response?.data?.error || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboard
    ? [
        {
          label: "Total Events",
          value: dashboard.overview.total_events.toString(),
          icon: Calendar,
          change: `${dashboard.overview.published_events} published`,
          trend: "up",
          description: `${dashboard.overview.draft_events} drafts in progress`,
        },
        {
          label: "Registrations",
          value: dashboard.overview.total_registrations.toString(),
          icon: Users,
          change: `+${dashboard.overview.recent_registrations} last 7 days`,
          trend: "up",
          description: `Need seats in ${dashboard.full_events_count} events`,
        },
        {
          label: "Upcoming Events",
          value: dashboard.upcoming_events.length.toString(),
          icon: Clock,
          change: "Next 5 events",
          trend: "up",
          description: "Stay on top of reminders",
        },
        {
          label: "Waitlist Alerts",
          value: dashboard.full_events_count.toString(),
          icon: CheckCircle,
          change: "Promote from waitlist",
          trend: dashboard.full_events_count > 0 ? "up" : "down",
          description: "Full events this week",
        },
      ]
    : [];

  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Organizer Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your events and track performance
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <stat.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for event management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                variant="outline"
                className="w-full justify-start gap-3 h-14"
                asChild
              >
                <a href={action.href}>
                  <action.icon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{action.label}</span>
                </a>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your next 5 published events</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.upcoming_events?.length ? (
              <div className="space-y-4">
                {dashboard.upcoming_events.map((event) => {
                  const percent =
                    event.participant_limit > 0
                      ? Math.min(
                          100,
                          Math.round((event.registered_count / event.participant_limit) * 100)
                        )
                      : 0;
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                          <span>{new Date(event.date_time).toLocaleDateString()}</span>
                          <span>
                            {event.registered_count}/{event.participant_limit} registered
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {percent >= 90 ? "Almost Full" : "Open"}
                      </Badge>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full" asChild>
                  <a href="/dashboard/organizer/events">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Events
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-6">
                No upcoming events found. Create one to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}