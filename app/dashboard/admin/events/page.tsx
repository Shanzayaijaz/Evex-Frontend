// app/dashboard/admin/events/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit
} from "lucide-react";
import { useState, useEffect } from "react";
import { adminAPI } from '@/utils/api';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  description: string;
  date_time: string;
  status: string;
  organizer_name?: string;
  university_name?: string;
  category_name?: string;
  registered_count?: number;
  participant_limit?: number;
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [universities, setUniversities] = useState<{ id: number, name: string }[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
    fetchUniversities();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedUniversity, selectedStatus]);

  const fetchUniversities = async () => {
    try {
      const response = await adminAPI.getUniversities();
      setUniversities(response.data);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const params: any = {};
      if (selectedUniversity !== 'all') {
        params.university = selectedUniversity;
      }
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const response = await adminAPI.getEvents(params);
      let eventList: Event[] = [];
      if (Array.isArray(response.data)) {
        eventList = response.data;
      } else if (response.data?.results) {
        eventList = response.data.results;
      }
      setEvents(eventList);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await adminAPI.deleteEvent(id);
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await adminAPI.updateEvent(id, { status: newStatus });
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update event status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.university_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: events.length,
    published: events.filter(e => e.status === 'published').length,
    draft: events.filter(e => e.status === 'draft').length,
    cancelled: events.filter(e => e.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Event Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Moderate and manage all events across universities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Published</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Draft</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.draft}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search events..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <select
              className="w-full md:w-1/3 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
            >
              <option value="all">All Universities</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <select
              className="w-full md:w-1/3 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Review and manage event submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{event.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                      {event.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {event.category_name && (
                        <Badge variant="outline">{event.category_name}</Badge>
                      )}
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      {event.university_name && (
                        <Badge variant="secondary">{event.university_name}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(event.date_time).toLocaleDateString()} • {event.registered_count || 0} / {event.participant_limit || '∞'} registered
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600"
                      onClick={() => handleStatusChange(event.id, 'published')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Publish
                    </Button>
                  )}
                  {event.status === 'published' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 border-orange-600"
                      onClick={() => handleStatusChange(event.id, 'draft')}
                    >
                      Unpublish
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? "Try adjusting your search." : "No events in the system."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
