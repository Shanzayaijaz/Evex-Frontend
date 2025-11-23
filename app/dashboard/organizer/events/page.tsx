'use client';

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { organizerAPI } from "@/utils/api";

interface OrganizerEvent {
  id: number;
  title: string;
  date_time: string;
  venue_name?: string | null;
  registered_count: number;
  participant_limit: number;
  status: string;
  category_name?: string | null;
}

const statusStyles: Record<string, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  draft: "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

type ApiError = {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;
    if (apiError.response?.data?.error) {
      return apiError.response.data.error;
    }
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
};

export default function MyEvents() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizerAPI.getEvents();
      setEvents(response.data || []);
    } catch (err) {
      console.error("Unable to load organizer events", err);
      setError(getErrorMessage(err) || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((event) => event.status === "published").length;
    const drafts = events.filter((event) => event.status === "draft").length;
    const totalRegistrations = events.reduce((sum, event) => sum + event.registered_count, 0);
    return { total, published, drafts, totalRegistrations };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Events</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage and track all the events you have created.
          </p>
        </div>
        <Button className="gap-2" asChild>
          <a href="/dashboard/organizer/create-event">
            <Plus className="h-4 w-4" />
            Create Event
          </a>
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Published</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Drafts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.drafts}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Registrations</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalRegistrations}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" className="gap-2" onClick={fetchEvents} disabled={loading}>
                <Filter className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading events...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const percent =
              event.participant_limit > 0
                ? Math.min(100, Math.round((event.registered_count / event.participant_limit) * 100))
                : 0;
            return (
              <Card key={event.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(event.date_time).toLocaleString()}
                      </CardDescription>
                      <p className="text-sm text-slate-500 mt-1">
                        {event.venue_name || "Venue to be announced"}
                      </p>
                    </div>
                    <Badge className={statusStyles[event.status] || "bg-slate-100 text-slate-700"}>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.registered_count}/{event.participant_limit} registered
                      </span>
                    </div>
                    {event.category_name && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Category:</span>
                        <span>{event.category_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <a href={`/dashboard/organizer/events/${event.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={`/dashboard/organizer/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}