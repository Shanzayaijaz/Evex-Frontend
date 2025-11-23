// app/dashboard/admin/users/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Shield,
  UserX,
  Trash2
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { adminAPI } from '@/utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string; // Moved from profile
  profile?: {
    // user_type is no longer here
    university_name?: string;
    university_domain?: string;
    is_verified?: boolean;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'organizer' | 'admin'>('all');
  const [domainFilter, setDomainFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      let userList: User[] = [];
      if (Array.isArray(response.data)) {
        userList = response.data;
      } else if (response.data?.results) {
        userList = response.data.results;
      }
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await adminAPI.deleteUser(userId);
        // Refresh the list
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'organizer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const availableDomains = useMemo(() => {
    const domains = new Set<string>();
    users.forEach((user) => {
      if (user.profile?.university_domain) {
        domains.add(user.profile.university_domain);
      }
    });
    return Array.from(domains).sort();
  }, [users]);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

    const userRole = user.user_type;
    // Only filter by role if user has a profile with user_type, or if filter is 'all'
    const matchesRole = roleFilter === 'all' || (userRole && userRole === roleFilter);
    const matchesDomain =
      domainFilter === 'all' ||
      user.profile?.university_domain === domainFilter;

    return matchesSearch && matchesRole && matchesDomain;
  });

  // Calculate stats
  const students = users.filter(u => u.user_type === 'student').length;
  const organizers = users.filter(u => u.user_type === 'organizer').length;
  const admins = users.filter(u => u.user_type === 'admin').length;
  const totalUsers = students + organizers + admins;

  const stats = {
    total: totalUsers,
    students,
    organizers,
    admins,
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage all users, organizers, and administrators
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {stats.students} students • {stats.organizers} organizers • {stats.admins} admins
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Students</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.students}</p>
              </div>
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Organizers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.organizers}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Admins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users by name, email, or username..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Filter by role
              </p>
              <Select value={roleFilter} onValueChange={(value: 'all' | 'student' | 'organizer' | 'admin') => setRoleFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="organizer">Organizers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Filter by university domain
              </p>
              <Select value={domainFilter} onValueChange={(value) => setDomainFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  {availableDomains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {(((user.first_name || '') + ' ' + (user.last_name || '')).trim() || user.username)
                        .split(' ').map((n: string) => n[0] || '').join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {((user.first_name || '') + ' ' + (user.last_name || '')).trim() || user.username}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{user.email || user.username}</p>
                    <div className="flex gap-2 mt-1">
                      {user.user_type ? (
                        <Badge className={getRoleColor(user.user_type)}>
                          {user.user_type}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          No Role
                        </Badge>
                      )}
                      {user.profile?.university_name && (
                        <Badge variant="outline">{user.profile.university_name}</Badge>
                      )}
                      {user.profile?.is_verified && (
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleDeleteUser(user.id, user.username)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserX className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? "Try adjusting your search." : "No users in the system."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
