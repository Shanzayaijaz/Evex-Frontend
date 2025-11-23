// app/dashboard/student/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, eventsAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  upcomingEvents: number;
  eventsAttended: number;
  registrationRate: string;
  hoursEngaged: number;
}

interface RecentActivity {
  id: number;
  event_id: number;
  event_title: string;
  event_date: string;
  action: 'registered' | 'cancelled' | 'waitlisted' | 'promoted';
  timestamp: string;
  user_name: string;
}

import { useRefresh } from '@/contexts/RefreshContext';

export default function StudentDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { refreshKey } = useRefresh();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingEvents: 0,
    eventsAttended: 0,
    registrationRate: "0%",
    hoursEngaged: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!loading && isAuthenticated && user?.profile?.user_type !== 'student') {
      router.push('/dashboard');
      return;
    }
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [loading, isAuthenticated, user, router, refreshKey]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard overview which includes recent activities and stats
      const overviewResponse = await userAPI.getDashboardOverview();
      
      if (overviewResponse.data) {
        const { recent_activities, stats: overviewStats } = overviewResponse.data;
        
        // Set recent activities
        setRecentActivities(recent_activities || []);
        
        // Set stats from API
        setStats({
          upcomingEvents: overviewStats?.upcoming_events || 0,
          eventsAttended: overviewStats?.events_attended || 0,
          registrationRate: overviewStats?.attendance_rate || "0%",
          hoursEngaged: (overviewStats?.events_attended || 0) * 3 // Assuming 3 hours per event
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to old method if new endpoint fails
      try {
        const registrationsResponse = await userAPI.getRegistrations();
        let registrations: any[] = [];
        
        if (Array.isArray(registrationsResponse.data)) {
          registrations = registrationsResponse.data;
        } else if (registrationsResponse.data?.results) {
          registrations = registrationsResponse.data.results;
        }
        
        const now = new Date();
        const upcoming = registrations.filter(reg => {
          if (!reg.event || reg.status !== 'registered') return false;
          const eventDate = new Date(reg.event.date_time);
          return eventDate > now;
        }).length;
        
        const attended = registrations.filter(reg => 
          reg.status === 'attended'
        ).length;

        const totalEvents = registrations.length;
        const rate = totalEvents > 0 ? Math.round((attended / totalEvents) * 100) : 0;

        setStats({
          upcomingEvents: upcoming,
          eventsAttended: attended,
          registrationRate: `${rate}%`,
          hoursEngaged: attended * 3
        });
      } catch (fallbackError) {
        console.error('Error in fallback fetch:', fallbackError);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const statsConfig = [
    { label: "Upcoming Events", value: stats.upcomingEvents.toString(), icon: Calendar, description: "Events you're attending" },
    { label: "Events Attended", value: stats.eventsAttended.toString(), icon: Users, description: "Total events participated" },
    { label: "Attendance Rate", value: stats.registrationRate, icon: TrendingUp, description: "Of registered events" },
    { label: "Hours Engaged", value: stats.hoursEngaged.toString(), icon: Clock, description: "This semester" },
  ];

  if (loading || loadingData) {
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

  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.username || 'Student';
  const universityName = user?.profile?.university_name || '';

  const getActivityBadgeStyle = (action: string) => {
    switch (action) {
      case 'registered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'promoted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getActivityLabel = (action: string) => {
    switch (action) {
      case 'registered': return 'Registered';
      case 'cancelled': return 'Cancelled';
      case 'waitlisted': return 'Waitlisted';
      case 'promoted': return 'Promoted';
      default: return action;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, {userName}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {universityName ? `Here's what's happening with your events at ${universityName}.` : "Here's what's happening with your events."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stat.description}
                  </p>
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
        {/* Recent Activity */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent event registrations and cancellations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity: RecentActivity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {activity.event_title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getActivityBadgeStyle(activity.action)}`}>
                    {getActivityLabel(activity.action)}
                  </span>
                </div>
              )) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                  No recent activity found.
                </p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/student/my-events">
                View All Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start gap-3" asChild>
              <Link href="/events">
                <Calendar className="h-4 w-4" />
                Browse Events
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/dashboard/student/my-events">
                <Users className="h-4 w-4" />
                My Events
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link href="/dashboard/student/profile">
                <Users className="h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
