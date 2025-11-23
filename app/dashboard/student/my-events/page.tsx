// app/dashboard/student/my-events/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, eventsAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useRefresh } from '@/contexts/RefreshContext';
import Link from 'next/link';

type EventStatus = 'registered' | 'attended' | 'cancelled';

interface Event {
  id: number;
  registration_id: number;
  title: string;
  date_time: string;
  description: string;
  status: EventStatus;
  category_name: string;
  venue_name: string;
  university_name: string;
  registered_at: string;
  registered_count?: number;
  participant_limit?: number;
}

export default function MyEventsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<EventStatus | 'all'>('all');
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated && user?.profile?.user_type !== 'student') {
      router.push('/dashboard');
      return;
    }
    if (isAuthenticated) {
      fetchMyEvents();
    }
  }, [authLoading, isAuthenticated, user, router]);

  interface RegistrationResponse {
    id: number;
    status: string;
    registered_at: string;
    event?: {
      id: number;
      title: string;
      date_time: string;
      description: string;
      category_name?: string;
      venue_name?: string;
      university_name?: string;
      registered_count?: number;
      participant_limit?: number;
    };
    event_title?: string;
  }

  const fetchMyEvents = async () => {
    try {
      // Fetch user's registrations
      const registrationsResponse = await userAPI.getRegistrations();
      let registrations: RegistrationResponse[] = [];
      
      if (Array.isArray(registrationsResponse.data)) {
        registrations = registrationsResponse.data;
      } else if (registrationsResponse.data?.results) {
        registrations = registrationsResponse.data.results;
      }
      
      // Transform the data to match our interface and hide cancelled events
      const eventsWithStatus: Event[] = registrations
        .map((reg: RegistrationResponse) => ({
          id: reg.event?.id || 0,
          registration_id: reg.id,
          title: reg.event?.title || reg.event_title || 'Unknown Event',
          date_time: reg.event?.date_time || reg.registered_at,
          description: reg.event?.description || 'No description available',
          status: reg.status as EventStatus,
          category_name: reg.event?.category_name || 'General',
          venue_name: reg.event?.venue_name || 'TBA',
          university_name: reg.event?.university_name || 'Unknown',
          registered_at: reg.registered_at || new Date().toISOString(),
          registered_count: reg.event?.registered_count,
          participant_limit: reg.event?.participant_limit
        }))
        .filter((event) => event.status !== 'cancelled');

      setMyEvents(eventsWithStatus);
      setCurrentPage(1);
    } catch (error: unknown) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = myEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || event.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig = {
      registered: { label: "Registered", variant: "default" as const },
      attended: { label: "Attended", variant: "outline" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCancelRegistration = async (eventId: number) => {
    try {
      await eventsAPI.cancelRegistration(eventId);
      // Refresh events
      triggerRefresh();
      fetchMyEvents(); // Re-fetch events for the current page
    } catch (error: any) {
      console.error('Error cancelling registration:', error);
      alert(error.response?.data?.error || 'Failed to cancel registration. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Events</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage and view all your registered events
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search events by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'registered', 'attended'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  onClick={() => setFilter(status)}
                  className="capitalize"
                  size="sm"
                >
                  {status === 'all' ? 'All Events' : status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEvents.map((event) => (
          <Card key={event.registration_id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            {/* Event Image */}
            <div className="relative h-40 bg-gradient-to-br from-blue-500 to-cyan-500">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-3 right-3">
                {getStatusBadge(event.status)}
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-slate-900">
                  {event.university_name}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3 grow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {event.category_name}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="truncate">{formatDate(event.date_time)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{formatTime(event.date_time)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{event.venue_name}</span>
                </div>
                {event.registered_count !== undefined && event.participant_limit !== undefined && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="text-xs font-medium">
                      {event.registered_count} / {event.participant_limit} attending
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {event.status === 'registered' && (
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel your registration for this event?')) {
                        handleCancelRegistration(event.id);
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {event.registered_at && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registered on {formatDate(event.registered_at)} at {formatTime(event.registered_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No events found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? "No events match your search criteria. Try adjusting your search or filters."
                : "You haven't registered for any events yet. Start exploring events to get involved!"}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/events">Browse All Events</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredEvents.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Stats Summary */}
      {filteredEvents.length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {myEvents.filter(e => e.status === 'registered').length}
                </span>
                <span>Registered</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {myEvents.filter(e => e.status === 'attended').length}
                </span>
                <span>Attended</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {myEvents.length}
                </span>
                <span>Total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
