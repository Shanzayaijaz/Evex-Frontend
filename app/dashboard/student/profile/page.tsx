// app/dashboard/student/profile/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save, Edit, Mail, Building, Phone, Bell, Shield, Trash2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, universitiesAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface University {
  id: number;
  name: string;
  code?: string;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  department: string;
  university: number | null;
}

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    department: '',
    university: null
  });
  const [stats, setStats] = useState({
    events_registered: 0,
    events_attended: 0,
    total_events: 0
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated && user?.profile?.user_type !== 'student') {
      router.push('/dashboard');
      return;
    }
    if (isAuthenticated && user) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchData = async () => {
    try {
      // Fetch universities
      const universitiesResponse = await universitiesAPI.getUniversities();
      let unis: University[] = [];
      if (Array.isArray(universitiesResponse.data)) {
        unis = universitiesResponse.data;
      } else if (universitiesResponse.data?.results) {
        unis = universitiesResponse.data.results;
      }
      setUniversities(unis);

      // Fetch user profile
      const profileResponse = await userAPI.getProfile();
      interface ProfileResponse {
        id: number;
        first_name: string;
        last_name: string;
        contact_number: string;
        department: string;
        university?: number;
        user_type: string;
        email?: string;
      }

      interface RegistrationResponse {
        id: number;
        status: string;
        event?: {
          title: string;
        };
        event_title?: string;
      }

      let profileData: ProfileResponse | null = null;
      if (Array.isArray(profileResponse.data) && profileResponse.data.length > 0) {
        profileData = profileResponse.data[0];
      } else if (profileResponse.data) {
        profileData = profileResponse.data;
      }

      if (profileData) {
        setProfile({
          first_name: profileData.first_name || user?.first_name || '',
          last_name: profileData.last_name || user?.last_name || '',
          email: user?.email || profileData.email || '',
          contact_number: profileData.contact_number || '',
          department: profileData.department || '',
          university: profileData.university || null
        });
      }

      // Fetch stats
      const registrationsResponse = await userAPI.getRegistrations();
      let regs: RegistrationResponse[] = [];
      if (Array.isArray(registrationsResponse.data)) {
        regs = registrationsResponse.data;
      } else if (registrationsResponse.data?.results) {
        regs = registrationsResponse.data.results;
      }
      
      setStats({
        events_registered: regs.filter((r) => r.status === 'registered').length,
        events_attended: regs.filter((r) => r.status === 'attended').length,
        total_events: regs.length
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      interface UpdateProfileData {
        first_name: string;
        last_name: string;
        contact_number: string | null;
        department: string | null;
        university: number | null;
      }

      const updateData: UpdateProfileData = {
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        contact_number: profile.contact_number.trim() || null,
        department: profile.department.trim() || null,
        university: profile.university || null,  // Explicitly set to null if not selected
      };

      await userAPI.updateProfile(updateData);
      
      setIsEditing(false);
      // Refresh data
      await fetchData();
      alert('Profile updated successfully!');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      console.error('Error updating profile:', error);
      alert(apiError.response?.data?.error || 'Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchData();
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userAPI.deleteCurrentUser();
      alert('Your account has been successfully deleted.');
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const userName = `${profile.first_name} ${profile.last_name}`.trim() || user?.username || 'Student';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const universityName = universities.find(u => u.id === profile.university)?.name || 'Not specified';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your personal information
          </p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Personal Information</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-slate-900 dark:text-white">
                    First Name
                  </Label>
                  <Input 
                    id="first_name" 
                    value={profile.first_name}
                    onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white dark:bg-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-slate-900 dark:text-white">
                    Last Name
                  </Label>
                  <Input 
                    id="last_name" 
                    value={profile.last_name}
                    onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white dark:bg-slate-700"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input 
                  id="email" 
                  value={profile.email}
                  disabled
                  className="bg-slate-100 dark:bg-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_number" className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input 
                    id="contact_number" 
                    value={profile.contact_number}
                    onChange={(e) => setProfile({...profile, contact_number: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white dark:bg-slate-700"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-slate-900 dark:text-white">
                    Department
                  </Label>
                  <Input 
                    id="department" 
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white dark:bg-slate-700"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university" className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Building className="h-4 w-4" />
                  University
                </Label>
                {isEditing ? (
                  <Select 
                    value={profile.university ? profile.university.toString() : 'none'} 
                    onValueChange={(value) => setProfile({...profile, university: value === 'none' ? null : parseInt(value)})}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-700">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No university selected</SelectItem>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id.toString()}>
                          {uni.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={universityName}
                    disabled
                    className="bg-slate-100 dark:bg-slate-700"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/50 dark:border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This action is irreversible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including registrations, feedback, and profile information.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-xl font-bold">
                    {userInitials}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {userName}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Student</p>
                {universityName !== 'Not specified' && (
                  <Badge variant="secondary" className="mt-2">
                    {universityName}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">Event Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Registered</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.events_registered}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Attended</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.events_attended}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.total_events}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/student/my-events">View My Events</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
