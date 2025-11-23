'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Users, Building, Tag, Clock, Edit, UserCheck } from "lucide-react";
import { organizerAPI } from "@/utils/api";
import Link from "next/link";

interface EventDetails {
  id: number;
  title: string;
  description: string;
  date_time: string;
  venue_name: string;
  university_name: string;
  category_name: string;
  registered_count: number;
  participant_limit: number;
  status: string;
  visibility: string;
  organizer_name: string;
}

const statusStyles: Record<string, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  draft: "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id ? parseInt(params.id as string) : null;
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizerAPI.getEvent(eventId!);
      setEvent(response.data);
    } catch (err: unknown) {
      console.error("Error fetching event:", err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to load event details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/organizer/events')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/30">
          <CardContent className="p-6">
            <p className="text-red-800 dark:text-red-200">{error || "Event not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percent = event.participant_limit > 0
    ? Math.min(100, Math.round((event.registered_count / event.participant_limit) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard/organizer/events')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/organizer/events/${event.id}/attendance`}>
              <UserCheck className="h-4 w-4 mr-2" />
              Manage Attendance
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Link>
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl text-slate-900 dark:text-white mb-2">
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={statusStyles[event.status] || "bg-slate-100 text-slate-700"}>
                  {event.status}
                </Badge>
                <Badge variant="outline">{event.visibility}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Description</h3>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Date & Time</p>
                  <p className="text-slate-900 dark:text-white">
                    {new Date(event.date_time).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Venue</p>
                  <p className="text-slate-900 dark:text-white">{event.venue_name || "TBA"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">University</p>
                  <p className="text-slate-900 dark:text-white">{event.university_name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</p>
                  <p className="text-slate-900 dark:text-white">{event.category_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Registrations</p>
                  <p className="text-slate-900 dark:text-white">
                    {event.registered_count} / {event.participant_limit} registered
                  </p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {percent}% capacity
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Organizer</p>
                  <p className="text-slate-900 dark:text-white">{event.organizer_name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

