'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, MapPin, Filter, Search, Heart, ArrowRight, Clock, Sparkles, Building2, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRefresh } from '@/contexts/RefreshContext';
import { eventsAPI, categoriesAPI, universitiesAPI } from "@/utils/api";

type EventItem = {
  id: number;
  title: string;
  description: string;
  date_time: string;
  category?: number;
  host_university?: number;
  venue_name?: string;
  university_name?: string;
  category_name?: string;
  participant_limit: number;
  registered_count?: number;
  visibility?: string;
  is_full?: boolean;
  user_registration_status?: string | null;
};

type CategoryFilter = { id: number; name: string };
type UniversityFilter = { id: number; name: string };
type EventConflict = {
  id: number;
  title: string;
  date_time: string;
  venue_name?: string;
};

type CategoryFilterOption = {
  key: number | "all";
  label: string;
  gradient: string;
  Icon: typeof Sparkles;
};

type UniversityOption = {
  key: number | "all";
  label: string;
};

const CATEGORY_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-cyan-500 to-blue-500",
];

const CATEGORY_ICONS = [Sparkles, Star, Building2, Users, Calendar, Clock];

export default function Events() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [selectedUniversity, setSelectedUniversity] = useState<number | "all">("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [universities, setUniversities] = useState<UniversityFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [clashConflicts, setClashConflicts] = useState<EventConflict[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [eventsResponse, categoriesResponse, universitiesResponse] = await Promise.all([
          eventsAPI.getEvents(),
          categoriesAPI.getCategories(),
          universitiesAPI.getUniversities(),
        ]);

        const eventsData: EventItem[] = Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data?.results ?? [];
        setEvents(eventsData);

        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data?.results ?? [];
        setCategories(categoriesData);

        const universitiesData = Array.isArray(universitiesResponse.data)
          ? universitiesResponse.data
          : universitiesResponse.data?.results ?? [];
        setUniversities(universitiesData);
      } catch (err: any) {
        console.error("Error loading events:", err);
        setError(err.response?.data?.error || "Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const categoryFilters = useMemo<CategoryFilterOption[]>(() => {
    const dynamicFilters = categories.map((category, index) => {
      const Icon = CATEGORY_ICONS[(index + 1) % CATEGORY_ICONS.length];
      return {
        key: category.id,
        label: category.name,
        gradient: CATEGORY_COLORS[(index + 1) % CATEGORY_COLORS.length],
        Icon,
      };
    });

    return [
      {
        key: "all" as const,
        label: "All Events",
        gradient: CATEGORY_COLORS[0],
        Icon: Sparkles,
      },
      ...dynamicFilters,
    ];
  }, [categories]);

  const universityOptions = useMemo<UniversityOption[]>(() => {
    return [
      { key: "all" as const, label: "All Universities" },
      ...universities.map((uni) => ({ key: uni.id, label: uni.name })),
    ];
  }, [universities]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || event.category === selectedCategory;
      const matchesUniversity =
        selectedUniversity === "all" || event.host_university === selectedUniversity;
      return matchesSearch && matchesCategory && matchesUniversity;
    });
  }, [events, searchTerm, selectedCategory, selectedUniversity]);

  const toggleFavorite = (eventId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const refetchEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      const eventsData: EventItem[] = Array.isArray(response.data)
        ? response.data
        : response.data?.results ?? [];
      setEvents(eventsData);
    } catch (err) {
      console.error("Failed to refresh events", err);
    }
  };

  const handleRegister = async (eventId: number) => {
    if (!isAuthenticated) {
      router.push('/login?next=/events');
      return;
    }
    setRegisteringId(eventId);
    setStatusMessage(null);
    setError(null);
    setClashConflicts([]);

    try {
      await eventsAPI.registerForEvent(eventId);
      setStatusMessage("You're in! Check the Student Dashboard for details.");
      await refetchEvents();
      triggerRefresh();
    } catch (err: any) {
      if (err.response?.status === 409 && err.response.data?.clashing_events) {
        setClashConflicts(err.response.data.clashing_events);
        setError(err.response.data.message || err.response.data.error || "Time clash detected.");
      } else {
        setError(err.response?.data?.error || "Unable to register for this event.");
      }
    } finally {
      setRegisteringId(null);
    }
  };

  const getRegisterLabel = (event: EventItem) => {
    if (event.user_registration_status === "registered") return "Registered";
    if (event.user_registration_status === "waitlisted") return "On Waitlist";
    if (event.is_full) return "Join Waitlist";
    return "Register Now";
  };

  const isRegisterDisabled = (event: EventItem) => {
    return (
      registeringId === event.id ||
      event.user_registration_status === "registered" ||
      event.user_registration_status === "waitlisted"
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Discover Amazing{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Events
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Explore inter-university events, connect with students across Pakistan, and create unforgettable experiences.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search events, topics, or universities..."
                  className="pl-12 pr-4 py-3 text-lg rounded-2xl border-0 shadow-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-3">
              {categoryFilters.map((category, index) => {
                const isActive = selectedCategory === category.key;
                return (
                  <button
                    key={`${category.label}-${index}`}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? `border-blue-500 bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                        : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:shadow-md"
                    }`}
                  >
                    <category.Icon className="h-4 w-4" />
                    <span className="font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>

            {/* University Filter */}
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <select
                value={selectedUniversity === "all" ? "all" : selectedUniversity.toString()}
                onChange={(e) => {
                  const value = e.target.value === "all" ? "all" : Number(e.target.value);
                  setSelectedUniversity(value);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by university"
              >
                {universityOptions.map((uni) => (
                  <option key={uni.key} value={uni.key === "all" ? "all" : uni.key}>
                    {uni.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {statusMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/30 dark:text-green-200">
              {statusMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          {clashConflicts.length > 0 && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
              <p className="font-semibold mb-2">Conflicting registrations:</p>
              <ul className="space-y-1 text-sm">
                {clashConflicts.map((conflict) => (
                  <li key={conflict.id} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>
                      {conflict.title} — {formatDate(conflict.date_time)} at{" "}
                      {formatTime(conflict.date_time)} ({conflict.venue_name || "TBA"})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Upcoming Events
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {filteredEvents.length} events found across {universities.length}+ universities
              </p>
            </div>
            
            <Button variant="outline" className="rounded-full border-2" asChild>
              <Link href="/events/create" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setSelectedUniversity("all"); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
                >
                  {/* Event Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
                        {event.university_name || "Multi-University"}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => toggleFavorite(event.id)}
                        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 hover:scale-110 transition-transform duration-300"
                        type="button"
                        aria-label={favorites.has(event.id) ? "Remove from favorites" : "Add to favorites"}
                        title={favorites.has(event.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.has(event.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-slate-600'
                          }`} 
                        />
                      </button>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 flex-1 pr-4">
                        {event.title}
                      </h3>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>{formatDate(event.date_time)} • {formatTime(event.date_time)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>{event.venue_name || event.university_name || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span>
                          {event.registered_count || 0} / {event.participant_limit} seats
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="capitalize">
                          {event.visibility ? event.visibility.replace(/_/g, ' ') : 'Public Event'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-60"
                        disabled={isRegisterDisabled(event)}
                        onClick={() => handleRegister(event.id)}
                      >
                        {registeringId === event.id ? "Processing..." : getRegisterLabel(event)}
                      </Button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Can&apos;t Find Your Event?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Create your own event and reach thousands of students across Pakistan&apos;s top universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/events/create" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Event
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-2" asChild>
                <Link href="/about" className="flex items-center gap-2">
                  Learn More
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}