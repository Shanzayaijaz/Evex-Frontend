// app/dashboard/admin/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Building2,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  Eye,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { adminAPI } from '@/utils/api';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    total_events: number;
    published_events: number;
    total_registrations: number;
    total_users: number;
    student_count: number;
    organizer_count: number;
    admin_count: number;
    recent_events: number;
    recent_registrations: number;
  };
  university_stats: Array<{ name: string; event_count: number; student_count: number }>;
  category_stats: Array<{ name: string; event_count: number }>;
  popular_events: Array<{ title: string; registration_count: number }>;
}

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = analytics ? [
    {
      label: "Total Users",
      value: analytics.overview.total_users.toString(),
      icon: Users,
      change: `+${analytics.overview.recent_registrations}`,
      trend: "up",
      description: `${analytics.overview.student_count} students, ${analytics.overview.organizer_count} organizers`
    },
    {
      label: "Published Events",
      value: analytics.overview.published_events.toString(),
      icon: Calendar,
      change: `+${analytics.overview.recent_events}`,
      trend: "up",
      description: `${analytics.overview.total_events} total events`
    },
    {
      label: "Universities",
      value: analytics.university_stats.length.toString(),
      icon: Building2,
      change: "",
      trend: "up",
      description: "Partner universities"
    },
    {
      label: "Total Registrations",
      value: analytics.overview.total_registrations.toString(),
      icon: Activity,
      change: `+${analytics.overview.recent_registrations}`,
      trend: "up",
      description: "Event registrations"
    },
  ] : [];

  const universityTotals = analytics?.university_stats?.reduce(
    (acc, uni) => {
      acc.events += uni.event_count || 0;
      return acc;
    },
    { events: 0 }
  );

  const maxEvents = Math.max(...(analytics?.university_stats?.map(u => u.event_count) || [0]));

  const quickActions = [
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users, color: "blue" },
    { label: "Event Management", href: "/dashboard/admin/events", icon: Calendar, color: "blue" },
    { label: "Universities", href: "/dashboard/admin/universities", icon: Building2, color: "blue" },
  ];

  if (loading) {
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          System overview and management console
        </p>
      </div>

      {/* Stats Grid */}
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
                    {stat.change && (
                      <>
                        <TrendingUp className={`h-3 w-3 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                          }`} />
                        <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {stat.change}
                        </span>
                      </>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {stat.description}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            <CardDescription>
              Frequently used administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start gap-3 h-14"
                asChild
              >
                <Link href={action.href}>
                  <action.icon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{action.label}</span>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Popular Events */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Popular Events</CardTitle>
            <CardDescription>
              Most registered events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.popular_events && analytics.popular_events.length > 0 ? (
                analytics.popular_events.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {event.registration_count} registrations
                      </p>
                    </div>
                    <Badge variant="secondary">
                      #{index + 1}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                  No events yet
                </p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/admin/events">
                <Eye className="h-4 w-4 mr-2" />
                View All Events
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* University Stats */}
      {analytics?.university_stats && analytics.university_stats.length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>University Statistics</CardTitle>
            <CardDescription>
              Events distribution by university (total {universityTotals?.events ?? 0} events)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">University</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400 w-1/3">Events Hosted</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.university_stats.map((uni, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{uni.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-3">
                          <span className="font-medium text-slate-900 dark:text-white">{uni.event_count}</span>
                          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${maxEvents > 0 ? (uni.event_count / maxEvents) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
