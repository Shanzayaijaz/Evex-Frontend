'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  Users,
  Search,
  Mail,
  Clock,
  UserCheck,
} from "lucide-react";
import { organizerAPI } from "@/utils/api";

interface AttendanceRecord {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  checked_in_at: string;
  checked_in_by_name: string;
  notes: string;
  is_verified: boolean;
}

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

interface EventData {
  id: number;
  title: string;
  date_time: string;
  registrations: RegistrationRecord[];
}

export default function EventAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id ? parseInt(params.id as string) : null;
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (eventId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attendanceRes, eventRes, registrationsRes] = await Promise.all([
        organizerAPI.getEventAttendance(eventId!),
        organizerAPI.getEvent(eventId!),
        organizerAPI.getRegistrations(),
      ]);
      setAttendance(attendanceRes.data || []);
      
      // Find the event's registrations from the registrations response
      const allEvents = registrationsRes.data?.events || [];
      const eventData = allEvents.find((e: { id: number }) => e.id === eventId);
      
      setEvent({
        id: eventRes.data.id,
        title: eventRes.data.title,
        date_time: eventRes.data.date_time,
        registrations: eventData?.registrations || [],
      });
    } catch (err: unknown) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (userId: number) => {
    setMarking(userId);
    try {
      await organizerAPI.markAttendance(eventId!, userId, notes);
      setNotes("");
      setSelectedUser(null);
      await fetchData();
    } catch (err: unknown) {
      console.error("Error marking attendance:", err);
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || "Failed to mark attendance");
    } finally {
      setMarking(null);
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

  if (!event) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/organizer/events')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/30">
          <CardContent className="p-6">
            <p className="text-red-800 dark:text-red-200">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const registeredUsers = (event.registrations || []).filter(
    reg => reg.status === 'registered' || reg.status === 'attended'
  );
  
  // Use user_id directly from attendance records
  const attendedUserIds = new Set(
    attendance.map(a => a.user_id).filter((id): id is number => id !== undefined && id !== null)
  );

  const availableToMark = registeredUsers.filter(
    reg => !attendedUserIds.has(reg.user.id)
  );

  const filteredAttendance = attendance.filter(a =>
    a.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push(`/dashboard/organizer/events/${eventId}`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.title} - Attendance</CardTitle>
          <CardDescription>
            Mark attendance for registered participants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Registered</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {registeredUsers.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Attended</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {attendance.length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Pending</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {availableToMark.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Mark Attendance Section */}
          {availableToMark.length > 0 && (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg">Mark Attendance</CardTitle>
                <CardDescription>Select a registered participant to mark as present</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Participant</Label>
                  <select
                    value={selectedUser || ""}
                    onChange={(e) => setSelectedUser(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a participant...</option>
                    {availableToMark.map((reg) => (
                      <option key={reg.id} value={reg.user.id}>
                        {reg.user.name} ({reg.user.email})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedUser && (
                  <>
                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this attendance..."
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={() => handleMarkAttendance(selectedUser)}
                      disabled={marking === selectedUser}
                      className="w-full"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      {marking === selectedUser ? "Marking..." : "Mark as Attended"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attendance List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Attendance Records</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search attendees..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No attendance records yet
              </p>
            ) : (
              <div className="space-y-2">
                {filteredAttendance.map((record) => (
                  <Card key={record.id} className="bg-white dark:bg-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {record.user_name}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {record.user_email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(record.checked_in_at).toLocaleString()}
                                </span>
                              </div>
                              {record.notes && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  Notes: {record.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                          Verified
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

