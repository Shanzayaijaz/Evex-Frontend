'use client';
import Link from "next/link";
import { Calendar, Users, MapPin, ArrowRight, Star, Globe, Sparkles, TrendingUp, Clock, Heart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { eventsAPI } from "@/utils/api";
import { useRefresh } from "@/contexts/RefreshContext";
import { AxiosError } from "axios";

interface Event {
  id: number;
  title: string;
  description: string;
  date_time: string;
  venue_name: string;
  university_name: string;
  category_name: string;
  registered_count: number;
  participant_limit: number;
  is_full: boolean;
  status: string;
}

export default function Home() {
  const { triggerRefresh } = useRefresh();
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(new Set());
  const [realEvents, setRealEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [clashDialog, setClashDialog] = useState<{
    open: boolean;
    eventId: number | null;
    clashingEvents: Array<{ id: number; title: string; date_time: string; venue_name: string }>;
  }>({
    open: false,
    eventId: null,
    clashingEvents: []
  });

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    
    // Load real events from backend
    loadRealEvents();
    
    return () => clearInterval(interval);
  }, []);

  const loadRealEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      // Handle both paginated and direct array responses
      let events: Event[] = [];
      if (Array.isArray(response.data)) {
        events = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        events = response.data.results;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        events = response.data.data;
      }
      
      // Filter only published events for the homepage
      const publishedEvents = events.filter((event: Event) => event.status === 'published');
      setRealEvents(publishedEvents.slice(0, 3)); // Show only first 3 events
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to empty array if API fails
      setRealEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number, forceRegister: boolean = false) => {
    try {
      if (registeredEvents.has(eventId)) {
        // Cancel registration
        await eventsAPI.cancelRegistration(eventId);
        setRegisteredEvents((prev: Set<number>) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        triggerRefresh(); // Refresh dashboard to update recent activity
      } else {
        // Register for event
        try {
          await eventsAPI.registerForEvent(eventId);
          setRegisteredEvents((prev: Set<number>) => new Set(prev).add(eventId));
          setClashDialog({ open: false, eventId: null, clashingEvents: [] });
          triggerRefresh(); // Refresh dashboard to update recent activity
        } catch (error) {
          // Check if it's a clash error (409 Conflict)
          const axiosError = error as AxiosError<{ clashing_events?: Array<{ id: number; title: string; date_time: string; venue_name: string }>; error?: string; message?: string }>;
          if (axiosError.response?.status === 409 && axiosError.response?.data?.clashing_events) {
            // Show clash warning dialog
            setClashDialog({
              open: true,
              eventId: eventId,
              clashingEvents: axiosError.response.data.clashing_events
            });
          } else {
            throw error; // Re-throw other errors
          }
        }
      }
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      console.error('Registration error:', err);
      if (err.response?.status !== 409) { // Don't show alert for clash errors (handled by dialog)
        alert(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
      }
    }
  };

  const features = [
    {
      icon: Globe,
      title: "Multi-University Events",
      description: "Discover events from top universities across Pakistan in one platform",
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Cross-Campus Registration",
      description: "Sign up for events at any partner university with ease",
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      icon: MapPin,
      title: "Nationwide Reach",
      description: "Access events from Karachi to Lahore and beyond",
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500"
    }
  ];

  const universities = [
    { 
      name: "FAST-NU", 
      events: "Tech, Hackathons", 
      color: "bg-gradient-to-br from-red-500 to-orange-500",
      students: "10,000+"
    },
    { 
      name: "LUMS", 
      events: "Business, Cultural", 
      color: "bg-gradient-to-br from-blue-600 to-purple-600",
      students: "8,500+"
    },
    { 
      name: "IBA", 
      events: "Finance, Debates", 
      color: "bg-gradient-to-br from-green-600 to-teal-600",
      students: "7,200+"
    },
    { 
      name: "NUST", 
      events: "Engineering, Sports", 
      color: "bg-gradient-to-br from-purple-600 to-indigo-600",
      students: "12,000+"
    },
    { 
      name: "GIKI", 
      events: "Engineering, Tech", 
      color: "bg-gradient-to-br from-orange-500 to-red-500",
      students: "3,500+"
    },
    { 
      name: "COMSATS", 
      events: "Academic, Research", 
      color: "bg-gradient-to-br from-cyan-600 to-blue-600",
      students: "15,000+"
    }
  ];

  const stats = [
    { number: `${realEvents.length * 10}+`, label: "Events Monthly", icon: Calendar },
    { number: "10K+", label: "Active Students", icon: Users },
    { number: "25+", label: "Cities Covered", icon: MapPin },
    { number: "98%", label: "Satisfaction Rate", icon: Star }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950 py-24">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pakistan&apos;s #1 Inter-University Event Platform
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Evex
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with students across <span className="font-semibold text-slate-700 dark:text-slate-200">Pakistan&apos;s top universities</span>. 
              Discover amazing events from FAST-NU, LUMS, IBA, NUST, and more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="rounded-full px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/events" className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  Explore Events
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 py-3 text-lg font-semibold border-2" asChild>
                <Link href="/about" className="flex items-center gap-2">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.number}</div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Universities */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Partner <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Universities</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Connecting students from Pakistan&apos;s premier educational institutions
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {universities.map((uni, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${uni.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                    {uni.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {uni.events}
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {uni.students} students
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Evex</span>?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              The only platform that truly connects you with events across multiple universities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 ${
                  activeFeature === index 
                    ? 'border-blue-500 shadow-xl scale-105' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`w-20 h-20 ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  {feature.description}
                </p>
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 ${feature.gradient} transition-all duration-500 group-hover:w-3/4`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Featured <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Events</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Real events from our partner universities
              </p>
            </div>
            <Button variant="outline" size="lg" className="rounded-full px-8 border-2 mt-4 lg:mt-0" asChild>
              <Link href="/events" className="flex items-center gap-2">
                View All Events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading events...</p>
            </div>
          ) : realEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">No events yet</h3>
              <p className="text-slate-500 dark:text-slate-500">Check back later for upcoming events!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {realEvents.map((event) => (
                <div
                  key={event.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
                        {event.university_name}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-black/50 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">
                        {event.category_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 flex-1 pr-4">
                        {event.title}
                      </h3>
                      <button 
                        onClick={() => handleRegister(event.id)}
                        className="shrink-0 text-slate-400 hover:text-red-500 transition-colors duration-300"
                        type="button"
                        aria-label={registeredEvents.has(event.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart 
                          className={`h-5 w-5 ${
                            registeredEvents.has(event.id) 
                              ? 'fill-red-500 text-red-500' 
                              : ''
                          }`} 
                        />
                      </button>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>{new Date(event.date_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>{event.venue_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span>{event.registered_count} / {event.participant_limit} attending</span>
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full mt-6 rounded-lg font-semibold transition-all duration-300 ${
                        registeredEvents.has(event.id)
                          ? 'bg-green-600 hover:bg-green-700'
                          : event.is_full
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      size="lg"
                      onClick={() => handleRegister(event.id)}
                      disabled={event.is_full && !registeredEvents.has(event.id)}
                    >
                      {registeredEvents.has(event.id) ? (
                        <>
                          <span>Registered </span>
                          <span className="ml-2">✓</span>
                        </>
                      ) : event.is_full ? (
                        "Event Full"
                      ) : (
                        "Register Now"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join the Inter-University Revolution
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with thousands of students from top universities across Pakistan. 
              Expand your network and discover amazing events beyond your campus boundaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="secondary" className="rounded-full px-8 py-3 text-lg font-semibold shadow-lg bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link href="/register" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 py-3 text-lg font-semibold border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600" asChild>
                <Link href="/login" className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-200 text-sm">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-blue-200 text-sm">Free</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Instant</div>
                <div className="text-blue-200 text-sm">Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clash Detection Dialog */}
      <Dialog open={clashDialog.open} onOpenChange={(open) => {
        if (!open) {
          setClashDialog({ open: false, eventId: null, clashingEvents: [] });
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <DialogTitle className="text-xl">Time Clash Detected</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              You have {clashDialog.clashingEvents.length} event(s) scheduled at the same time as this event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-200 mb-3">
                Clashing Events:
              </p>
              <div className="space-y-2">
                {clashDialog.clashingEvents.map((clash) => (
                  <div key={clash.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {clash.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {new Date(clash.date_time).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {clash.venue_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Do you want to register for this event anyway? You may not be able to attend all events.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setClashDialog({ open: false, eventId: null, clashingEvents: [] })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (clashDialog.eventId) {
                  handleRegister(clashDialog.eventId, true);
                }
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Register Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}