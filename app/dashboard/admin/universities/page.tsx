// app/dashboard/admin/universities/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { adminAPI } from '@/utils/api';

interface University {
  id: number;
  name: string;
  short_code: string;
  domain: string;
  is_active: boolean;
  created_at: string;
}

export default function UniversityManagement() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    short_code: "",
    domain: "",
    is_active: true
  });

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await adminAPI.getUniversities();
      let unis: University[] = [];
      if (Array.isArray(response.data)) {
        unis = response.data;
      } else if (response.data?.results) {
        unis = response.data.results;
      }
      setUniversities(unis);
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await adminAPI.createUniversity(formData);
      setShowAddForm(false);
      setFormData({ name: "", short_code: "", domain: "", is_active: true });
      fetchUniversities();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create university');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await adminAPI.updateUniversity(id, formData);
      setEditingId(null);
      setFormData({ name: "", short_code: "", domain: "", is_active: true });
      fetchUniversities();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update university');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this university?')) return;
    try {
      await adminAPI.deleteUniversity(id);
      fetchUniversities();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete university');
    }
  };

  const startEdit = (uni: University) => {
    setEditingId(uni.id);
    setFormData({
      name: uni.name,
      short_code: uni.short_code,
      domain: uni.domain,
      is_active: uni.is_active
    });
    setShowAddForm(false);
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">University Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage partner universities and their settings
          </p>
        </div>
        <Button onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ name: "", short_code: "", domain: "", is_active: true }); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add University
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit University' : 'Add New University'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="University Name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Short Code</label>
                <Input
                  value={formData.short_code}
                  onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
                  placeholder="e.g., FAST-NU"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Domain</label>
                <Input
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="e.g., fast.edu.pk"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={editingId ? () => handleUpdate(editingId) : handleCreate}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search universities..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Universities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUniversities.map((uni) => (
          <Card key={uni.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{uni.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {uni.short_code} • {uni.domain}
                  </CardDescription>
                </div>
                <Badge variant={uni.is_active ? "default" : "secondary"}>
                  {uni.is_active ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(uni)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(uni.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUniversities.length === 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No universities found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm ? "Try adjusting your search." : "Add your first university to get started."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
