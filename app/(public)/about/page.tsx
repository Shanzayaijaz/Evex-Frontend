'use client';
import Link from "next/link";
import { Calendar, Users, MapPin, Target, Heart, Shield, Globe, Sparkles, TrendingUp, ArrowRight, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function About() {
  const [mounted, setMounted] = useState(false);
  const [activeValue, setActiveValue] = useState(0);
  const [hoveredUniversity, setHoveredUniversity] = useState<number | null>(null);
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);

  useEffect(() => {
    setMounted(true);
    
    // Auto-rotate values
    const valueInterval = setInterval(() => {
      setActiveValue((prev) => (prev + 1) % values.length);
    }, 3500);

    // Animate stats
    const statsInterval = setInterval(() => {
      setAnimatedStats([1500, 8000, 14, 95]);
    }, 1000);

    return () => {
      clearInterval(valueInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const universities = [
    { 
      name: "FAST-NU", 
      color: "bg-gradient-to-br from-red-500 to-orange-500", 
      students: "10K+ Students",
      established: "2000",
      focus: "Technology & Innovation"
    },
    { 
      name: "LUMS", 
      color: "bg-gradient-to-br from-blue-600 to-purple-600", 
      students: "8.5K+ Students",
      established: "1985",
      focus: "Business & Arts"
    },
    { 
      name: "IBA", 
      color: "bg-gradient-to-br from-green-600 to-teal-600", 
      students: "7.2K+ Students",
      established: "1955",
      focus: "Finance & Economics"
    },
    { 
      name: "NUST", 
      color: "bg-gradient-to-br from-purple-600 to-indigo-600", 
      students: "12K+ Students",
      established: "1991",
      focus: "Engineering & Sciences"
    },
    { 
      name: "Habib University", 
      color: "bg-gradient-to-br from-orange-500 to-red-500", 
      students: "3.5K+ Students",
      established: "2014",
      focus: "Liberal Arts & Humanities"
    },
    { 
      name: "KU", 
      color: "bg-gradient-to-br from-cyan-600 to-blue-600", 
      students: "15K+ Students",
      established: "1951",
      focus: "Research & Academics"
    },
    { 
      name: "NED University", 
      color: "bg-gradient-to-br from-emerald-500 to-green-500", 
      students: "11K+ Students",
      established: "1921",
      focus: "Engineering & Technology"
    },
    { 
      name: "COMSATS", 
      color: "bg-gradient-to-br from-violet-500 to-purple-500", 
      students: "9K+ Students",
      established: "1998",
      focus: "IT & Computer Science"
    },
    { 
      name: "GIKI", 
      color: "bg-gradient-to-br from-rose-500 to-pink-500", 
      students: "2.5K+ Students",
      established: "1993",
      focus: "Engineering & Sciences"
    },
    { 
      name: "IVS", 
      color: "bg-gradient-to-br from-amber-500 to-yellow-500", 
      students: "1.8K+ Students",
      established: "1990",
      focus: "Architecture & Design"
    },
    { 
      name: "IoBM", 
      color: "bg-gradient-to-br from-sky-500 to-blue-500", 
      students: "4K+ Students",
      established: "1995",
      focus: "Business & Management"
    },
    { 
      name: "SZABIST", 
      color: "bg-gradient-to-br from-fuchsia-500 to-purple-500", 
      students: "6K+ Students",
      established: "1995",
      focus: "Business & Technology"
    },
  ];

  const team = [
    {
      name: "University Students",
      role: "Development Team",
      description: "Passionate students from multiple universities building the future of inter-campus events",
      avatar: "👨‍💻",
      contribution: "Product Development"
    },
    {
      name: "University Administrations",
      role: "Advisory Board",
      description: "Providing guidance and support for cross-campus initiatives and partnerships",
      avatar: "🎓",
      contribution: "Strategic Guidance"
    },
    {
      name: "Student Community",
      role: "Beta Testers & Contributors",
      description: "Students from all partner universities providing feedback and shaping Evex's features",
      avatar: "🌟",
      contribution: "Community Feedback"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To connect students across Pakistan's top universities through a unified event discovery and management platform.",
      color: "from-blue-500 to-cyan-500",
      longDescription: "Breaking down campus barriers and creating opportunities for cross-university collaboration and learning."
    },
    {
      icon: Heart,
      title: "Our Vision",
      description: "Creating an interconnected academic community where students can explore diverse events beyond their campus boundaries.",
      color: "from-purple-500 to-pink-500",
      longDescription: "A future where geographical and institutional boundaries don't limit student experiences and opportunities."
    },
    {
      icon: Shield,
      title: "Our Commitment",
      description: "Providing a secure, inclusive platform that celebrates diversity and fosters cross-university collaboration.",
      color: "from-green-500 to-emerald-500",
      longDescription: "Ensuring every student feels safe, included, and empowered to participate in the wider academic community."
    },
    {
      icon: Globe,
      title: "Our Reach",
      description: "Bridging the gap between Pakistan's premier educational institutions through shared experiences and events.",
      color: "from-orange-500 to-red-500",
      longDescription: "Connecting campuses from Karachi to Lahore, creating a truly national student network."
    }
  ];

  const stats = [
    { number: animatedStats[0], label: "Events Listed", suffix: "+", icon: Calendar },
    { number: animatedStats[1], label: "Students Connected", suffix: "+", icon: Users },
    { number: animatedStats[2], label: "Partner Universities", suffix: "+", icon: Globe },
    { number: animatedStats[3], label: "User Satisfaction", suffix: "%", icon: Star }
  ];

  const eventTypes = [
    { name: "Tech Conferences & Hackathons", icon: "💻", count: "120+" },
    { name: "Cultural Festivals & Competitions", icon: "🎭", count: "85+" },
    { name: "Career Fairs & Networking Events", icon: "🤝", count: "200+" },
    { name: "Academic Workshops & Seminars", icon: "📚", count: "150+" },
    { name: "Sports Tournaments & Activities", icon: "⚽", count: "90+" },
    { name: "Social Impact & Community Service", icon: "🌍", count: "60+" }
  ];

  const milestones = [
    { year: "2023", event: "Evex Founded", description: "Concept development begins" },
    { year: "2024", event: "First University Partnership", description: "FAST-NU joins the platform" },
    { year: "2024", event: "Platform Launch", description: "Beta version released" },
    { year: "2024", event: "1000+ Users", description: "Rapid community growth" },
    { year: "2025", event: "National Expansion", description: "Covering major cities" }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950 py-24">
        <div className="absolute inset-0 bg-grid-slate-100mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800 dark:mask-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Our Story & Mission
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              About{" "}
              <span className="bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Evex
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Pakistan&apos;s premier inter-university event platform connecting students across 
              <span className="font-semibold text-slate-700 dark:text-slate-200"> 14+ top educational institutions</span>. 
              Breaking barriers, building communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="rounded-full px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" asChild>
                <Link href="/events" className="flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  Explore Events
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 py-3 text-lg font-semibold border-2" asChild>
                <Link href="/register" className="flex items-center gap-2">
                  Join Community
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-12 bg-linear-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                    Connecting Campuses Across{" "}
                    <span className="bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Pakistan
                    </span>
                  </h2>
                </div>
                
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                  Evex is Pakistan&apos;s <span className="font-semibold text-slate-700 dark:text-slate-200">first inter-university event management platform</span>, 
                  designed to break down campus barriers and create a unified student community.
                </p>
                
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                  Discover events from top universities including FAST-NU, LUMS, IBA, NUST, Habib University, 
                  and more - all in one centralized platform that celebrates diversity and fosters collaboration.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="rounded-lg px-8 font-semibold" asChild>
                    <Link href="/events" className="flex items-center gap-2">
                      Explore All Events
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-lg px-8 font-semibold border-2" asChild>
                    <Link href="/register" className="flex items-center gap-2">
                      Join Network
                      <Users className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="bg-linear-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Multi-University Platform</h3>
                      <p className="text-blue-100">Connecting Pakistan&apos;s top educational institutions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <MapPin className="h-6 w-6" />
                      <div>
                        <div className="font-semibold">Events from 14+ Universities</div>
                        <div className="text-blue-100 text-sm">Nationwide coverage</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <Calendar className="h-6 w-6" />
                      <div>
                        <div className="font-semibold">Cross-Campus Registration</div>
                        <div className="text-blue-100 text-sm">One-click enrollment</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <Users className="h-6 w-6" />
                      <div>
                        <div className="font-semibold">Inter-University Networking</div>
                        <div className="text-blue-100 text-sm">Build connections</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Building Bridges Between{" "}
              <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Campuses
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Evex has transformed how students connect across university boundaries, creating unprecedented opportunities for collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="text-4xl font-bold text-slate-900 dark:text-white">
                    {stat.number}{stat.suffix}
                  </div>
                </div>
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Universities */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Our <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Partner Universities</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Connecting students across Pakistan&apos;s premier educational institutions through strategic partnerships
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {universities.map((uni, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
                onMouseEnter={() => setHoveredUniversity(index)}
                onMouseLeave={() => setHoveredUniversity(null)}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 ${uni.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {uni.name}
                  </h3>
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{uni.students}</div>
                    <div>Est. {uni.established}</div>
                    <div className="font-medium text-xs">{uni.focus}</div>
                  </div>
                </div>
                
                {hoveredUniversity === index && (
                  <div className="absolute inset-0 bg-linear-to-br from-slate-900 to-blue-900 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-white text-center p-4">
                      <div className="text-xl font-bold mb-1">{uni.name}</div>
                      <div className="text-blue-200 text-sm">{uni.focus}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Our <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Core Values</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              The principles that guide our mission to connect Pakistan&apos;s student community
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 transform ${
                  activeValue === index ? '-translate-y-3 scale-105' : 'hover:-translate-y-2'
                } border-2 ${
                  activeValue === index ? 'border-purple-500 shadow-xl' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`w-16 h-16 bg-linear-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {value.description}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {value.longDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Diverse <span className="bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Event Categories</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Discover a wide range of events open to students from all partner universities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {eventTypes.map((type, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{type.icon}</div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {type.name}
                    </h4>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                      {type.count} events
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-linear-to-br from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Our <span className="bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Journey</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              From concept to nationwide platform - the evolution of Evex
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-linear-to-b from-blue-500 to-cyan-500"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {milestone.event}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900 shadow-lg"></div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              The <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Evex Network</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              A collaborative effort from students and administrators across multiple universities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
              >
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {member.avatar}
                </div>
                <div className="w-24 h-1 bg-linear-to-r from-blue-500 to-cyan-500 mx-auto mb-6 rounded-full"></div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 text-lg font-semibold mb-4">
                  {member.role}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {member.description}
                </p>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 inline-block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {member.contribution}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join the Inter-University Revolution
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re a student looking to explore events beyond your campus or an organizer 
              planning cross-university activities, Evex connects you with the entire academic community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="secondary" className="rounded-full px-8 py-3 text-lg font-semibold shadow-lg" asChild>
                <Link href="/register" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 py-3 text-lg font-semibold border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600" asChild>
                <Link href="/events" className="flex items-center gap-2">
                  Discover Events
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
    </div>
  );
}