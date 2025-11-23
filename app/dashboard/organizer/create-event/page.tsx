'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Image,
  Tag,
  Upload
} from "lucide-react";
import { organizerAPI } from "@/utils/api";

const initialFormState = {
  title: "",
  description: "",
  date: "",
  time: "",
  endTime: "",
  location: "",
  capacity: "",
  price: "",
  category: "",
  tags: ""
};

export default function CreateEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormState);
  const [submissionState, setSubmissionState] = useState<"idle" | "publishing" | "drafting">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // New state for visibility and universities
  const [visibility, setVisibility] = useState<string>("university");
  const [allowedUniversities, setAllowedUniversities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<{id: number, name: string}[]>([]);

  // Fetch universities on mount
  useState(() => {
    const fetchUniversities = async () => {
      try {
        // Assuming there's an endpoint to get all universities. 
        // If not, we might need to use a different approach or endpoint.
        // Using a direct fetch here for simplicity, but should ideally use an API utility.
        const response = await fetch('http://localhost:8000/api/universities/');
        if (response.ok) {
          const data = await response.json();
          setUniversities(data);
        }
      } catch (error) {
        console.error("Failed to fetch universities", error);
      }
    };
    fetchUniversities();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUniversityToggle = (uniId: string) => {
    setAllowedUniversities(prev => {
      if (prev.includes(uniId)) {
        return prev.filter(id => id !== uniId);
      } else {
        return [...prev, uniId];
      }
    });
  };

  const categories = [
    "Technology",
    "Business",
    "Cultural",
    "Sports",
    "Workshop",
    "Conference",
    "Networking",
    "Seminar",
    "Career Fair",
    "Hackathon"
  ];

  const handleSubmit = async (status: "published" | "draft") => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const requiredFields: Array<keyof typeof formData> = ["title","description","date","time","location","capacity","category"];
    const missing = requiredFields.filter((field) => !String(formData[field]).trim());
    if (missing.length) {
      setErrorMessage(`Please fill in all required fields (${missing.join(", ")}).`);
      return;
    }

    setSubmissionState(status === "published" ? "publishing" : "drafting");
    try {
      await organizerAPI.createEvent({
        ...formData,
        capacity: Number(formData.capacity),
        price: formData.price,
        status,
        visibility,
        allowed_universities: visibility === 'inter_university' ? allowedUniversities : [],
      });

      setSuccessMessage(status === "published" ? "Event published successfully!" : "Draft saved successfully.");
      setFormData(initialFormState);

      if (status === "published") {
        setTimeout(() => router.push("/dashboard/organizer/events"), 800);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || "Unable to save the event. Please try again.");
    } finally {
      setSubmissionState("idle");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/organizer/events");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Event</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Fill in the details to create your event
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-200">
              {successMessage}
            </div>
          )}
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Event Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your event in detail..."
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    placeholder="Maximum attendees"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
              <CardDescription>
                When and where your event will take place
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      className="pl-10"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      className="pl-10"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      className="pl-10"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="Event venue address"
                    className="pl-10"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set ticket prices for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="price">Ticket Price (PKR) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="0 for free event"
                    className="pl-10"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter 0 for free events
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>
                Control who can see your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Event Visibility *</Label>
                <select
                  id="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="university">My University Only</option>
                  <option value="public">Public Event</option>
                  <option value="inter_university">Selected Universities</option>
                </select>
              </div>

              {visibility === 'inter_university' && (
                <div className="space-y-2">
                  <Label>Select Universities *</Label>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-800">
                    {universities.length > 0 ? (
                      universities.map((uni) => (
                        <div key={uni.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`uni-${uni.id}`}
                            checked={allowedUniversities.includes(String(uni.id))}
                            onChange={() => handleUniversityToggle(String(uni.id))}
                            className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                          />
                          <Label htmlFor={`uni-${uni.id}`} className="text-sm font-normal cursor-pointer">
                            {uni.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Loading universities...</p>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Select at least one university for inter-university events.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Image */}
          <Card>
            <CardHeader>
              <CardTitle>Event Image</CardTitle>
              <CardDescription>
                Upload a cover image for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                <Image className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Drag and drop an image, or click to browse
                </p>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Add tags to help people find your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="tags">Event Tags</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="tech, workshop, ai (comma separated)"
                    className="pl-10"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publish Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Event</CardTitle>
              <CardDescription>
                Save and publish your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                className="w-full gap-2"
                disabled={submissionState !== "idle"}
                onClick={() => handleSubmit("published")}
              >
                <Calendar className="h-4 w-4" />
                {submissionState === "publishing" ? "Publishing..." : "Publish Event"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={submissionState !== "idle"}
                onClick={() => handleSubmit("draft")}
              >
                {submissionState === "drafting" ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-red-600 border-red-600 hover:bg-red-50"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}