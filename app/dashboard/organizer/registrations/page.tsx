'use client';

import { useEffect, useMemo, useState } from "react";
import { organizerAPI } from "@/utils/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  RefreshCcw,
  Mail,
  Phone,
  University,
} from "lucide-react";

interface RegistrationUser {
  id: number;
  name: string;
  email: string;
  university: string | null;
  contact_number: string;
}

interface RegistrationRecord {
  id: number;
  status: string;
  registered_at: string;
  user: RegistrationUser;
}

interface WaitlistEntry {
  id: number;
  position: number;
  joined_at: string;
  user: RegistrationUser;
}

interface ParticipationEvent {
  id: number;
  title: string;
  date_time: string;
  venue_name?: string | null;
  participant_limit: number;
  registered_count: number;
  attended_count: number;
  status: string;
  is_full: boolean;
  registrations: RegistrationRecord[];
  waitlist: WaitlistEntry[];
}

const statusStyles: Record<string, string> = {
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  attended: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  waitlisted: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
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

export default function Participation() {
  const [events, setEvents] = useState<ParticipationEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await organizerAPI.getRegistrations();
      setEvents(response.data.events || []);
    } catch (err) {
      console.error("Failed to load participation data", err);
      setError(getErrorMessage(err) || "Unable to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipation();
  }, []);

  const { totalRegistrations, totalAttendees, waitlistedCount, upcomingEvents } = useMemo(() => {
    let registrations = 0;
    let attendees = 0;
    let waitlisted = 0;
    let upcoming = 0;
    const now = new Date();

    events.forEach((event) => {
      registrations += event.registrations.length;
      attendees += event.attended_count;
      waitlisted += event.waitlist?.length || 0;
      if (new Date(event.date_time) >= now) {
        upcoming += 1;
      }
    });

    return {
      totalRegistrations: registrations,
      totalAttendees: attendees,
      waitlistedCount: waitlisted,
      upcomingEvents: upcoming,
    };
  }, [events]);

  const filterRegistrations = (registrations: RegistrationRecord[]) => {
    if (!searchTerm) return registrations;
    const lowered = searchTerm.toLowerCase();
    return registrations.filter((reg) => {
      const haystack = [
        reg.user.name,
        reg.user.email,
        reg.user.university,
        reg.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(lowered);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Registrations & Attendees</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Track every participant from registration to attendance in one view.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchParticipation} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Registrations</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalRegistrations}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Attendees</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalAttendees}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Waitlisted</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{waitlistedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Upcoming Events</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Participants</CardTitle>
          <CardDescription>Search across all registrations and attendees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, university, or status"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-slate-500">Loading registrations...</p>
          ) : events.length === 0 ? (
            <p className="text-slate-500">No registrations yet.</p>
          ) : (
            <div className="space-y-6">
              {events.map((event) => {
                const filtered = filterRegistrations(event.registrations);
                return (
                  <div key={event.id} className="rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Event</p>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{event.title}</h3>
                        <p className="text-sm text-slate-500">
                          {new Date(event.date_time).toLocaleString()} • {event.venue_name || "TBA"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {event.registered_count}/{event.participant_limit} registered
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {event.attended_count} attended
                        </span>
                        {event.is_full && event.waitlist && event.waitlist.length > 0 && (
                          <span className="text-amber-600 dark:text-amber-400">
                            {event.waitlist.length} on waitlist
                          </span>
                        )}
                      </div>
                    </div>

                    {filtered.length === 0 && (!event.waitlist || event.waitlist.length === 0) ? (
                      <p className="p-4 text-sm text-slate-500">No participants match this search.</p>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
                              <tr>
                                <th className="px-4 py-3">Participant</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Registered At</th>
                                <th className="px-4 py-3">Contact</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map((reg) => (
                                <tr key={reg.id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900 dark:text-white">{reg.user.name}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                      <University className="h-3 w-3" />
                                        {reg.user.university || "—"}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge className={statusStyles[reg.status] || "bg-slate-100 text-slate-700"}>
                                      {reg.status}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {new Date(reg.registered_at).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      <a href={`mailto:${reg.user.email}`} className="hover:underline">
                                        {reg.user.email}
                                      </a>
                                    </div>
                                    {reg.user.contact_number && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <Phone className="h-3 w-3" />
                                        <a href={`tel:${reg.user.contact_number}`} className="hover:underline">
                                          {reg.user.contact_number}
                                        </a>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Waitlist Section */}
                        {event.is_full && event.waitlist && event.waitlist.length > 0 && (
                          <div className="border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
                            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Waitlist ({event.waitlist.length} {event.waitlist.length === 1 ? 'person' : 'people'})
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                                  <tr>
                                    <th className="px-4 py-3">Position</th>
                                    <th className="px-4 py-3">Participant</th>
                                    <th className="px-4 py-3">Joined At</th>
                                    <th className="px-4 py-3">Contact</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {event.waitlist.map((entry) => (
                                    <tr key={entry.id} className="border-b border-amber-100 last:border-b-0 dark:border-amber-900/30">
                                      <td className="px-4 py-3">
                                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                          #{entry.position}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white">{entry.user.name}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                          <University className="h-3 w-3" />
                                            {entry.user.university || "—"}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {new Date(entry.joined_at).toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-3 w-3" />
                                          <a href={`mailto:${entry.user.email}`} className="hover:underline">
                                            {entry.user.email}
                                          </a>
                                        </div>
                                        {entry.user.contact_number && (
                                          <div className="flex items-center gap-2 mt-1">
                                            <Phone className="h-3 w-3" />
                                            <a href={`tel:${entry.user.contact_number}`} className="hover:underline">
                                              {entry.user.contact_number}
                                            </a>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}