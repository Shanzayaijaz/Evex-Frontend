'use client';
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Bell,
  Clock,
  TrendingUp,
  AlertCircle,
  Mail,
  Calendar,
} from "lucide-react";
import { organizerAPI } from "@/utils/api";
import Link from "next/link";

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  event_id: number | null;
  event_title: string | null;
  user_name: string;
  user_email: string;
}

interface WaitlistEntry {
  event_id: number;
  event_title: string;
  user_id: number;
  user_name: string;
  user_email: string;
  position: number;
  university: string | null;
  contact_number: string;
}

interface AnalyticsData {
  stats: {
    total_registrations: number;
    total_cancellations: number;
    total_attended: number;
    recent_registrations: number;
    recent_cancellations: number;
  };
  notifications: Notification[];
  waitlist: WaitlistEntry[];
}

const notificationTypeStyles: Record<string, string> = {
  registration_confirmation: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  event_cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  waitlist_promotion: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  event_reminder: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  event_updated: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'registrations' | 'cancellations' | 'waitlist'>('all');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizerAPI.getAnalytics();
      setData(response.data);
    } catch (err: unknown) {
      console.error("Error fetching analytics:", err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/30">
          <CardContent className="p-6">
            <p className="text-red-800 dark:text-red-200">{error || "Failed to load analytics"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredNotifications = data.notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'registrations') return notif.notification_type === 'registration_confirmation';
    if (filter === 'cancellations') return notif.notification_type === 'event_cancelled';
    return false;
  });

  const registrationNotifications = data.notifications.filter(
    n => n.notification_type === 'registration_confirmation'
  );
  const cancellationNotifications = data.notifications.filter(
    n => n.notification_type === 'event_cancelled'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics & Notifications</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View event performance, registrations, cancellations, and waitlist information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Registrations</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.stats.total_registrations}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{data.stats.recent_registrations} this week
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cancellations</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.stats.total_cancellations}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  +{data.stats.recent_cancellations} this week
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Attended</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.stats.total_attended}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Completed events
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Notifications</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.notifications.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Recent activity
                </p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Waitlist Members</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.waitlist.length}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Full events
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Registration and cancellation activity</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'registrations' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('registrations')}
                >
                  Registrations
                </Button>
                <Button
                  variant={filter === 'cancellations' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('cancellations')}
                >
                  Cancellations
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No notifications found
                </p>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border ${
                      notif.is_read
                        ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={
                              notificationTypeStyles[notif.notification_type] ||
                              'bg-slate-100 text-slate-700'
                            }
                          >
                            {notif.notification_type.replace('_', ' ')}
                          </Badge>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {notif.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notif.message}
                        </p>
                        {notif.event_title && (
                          <Link
                            href={`/dashboard/organizer/events/${notif.event_id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                          >
                            {notif.event_title}
                          </Link>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {notif.user_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notif.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Waitlist */}
        <Card>
          <CardHeader>
            <CardTitle>Waitlist Members</CardTitle>
            <CardDescription>Users waiting for full events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.waitlist.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No waitlist entries. All events have available spots.
                </p>
              ) : (
                data.waitlist.map((entry, index) => (
                  <div
                    key={`${entry.event_id}-${entry.user_id}-${index}`}
                    className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            Position #{entry.position}
                          </Badge>
                          <Link
                            href={`/dashboard/organizer/events/${entry.event_id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {entry.event_title}
                          </Link>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {entry.user_name}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {entry.user_email}
                          </span>
                          {entry.university && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {entry.university}
                            </span>
                          )}
                          {entry.contact_number && (
                            <span>{entry.contact_number}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
