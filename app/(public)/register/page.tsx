// app/register/page.tsx
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles, Check, Calendar, Users, University } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { authAPI } from '@/utils/api'; // Use the API utility

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"student" | "organizer">("student");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    department: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!isPasswordStrong) {
      setError("Please create a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare registration data
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: userType,
        contact_number: formData.contact_number,
        department: formData.department
      };

      // Make API call to register
      const response = await authAPI.register(registrationData);
      
      if (response.status === 201) {
        setSuccess('Registration successful! Redirecting to login...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?message=Registration successful! Please login with your credentials.');
        }, 2000);
      }
      
    } catch (err: any) {
      console.error('Registration error:', err);
      // Handle different error response formats
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const passwordStrength = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left Side - Form */}
        <div className="lg:p-8 flex items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
            <div className="flex flex-col space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Evex
                </h1>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Join the Community
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Create your account and start exploring inter-university events across 14+ universities
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            {/* User Type Selection */}
            <div className="grid gap-4">
              <Label className="text-slate-700 dark:text-slate-300 text-lg font-semibold">
                Join as:
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType("student")}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    userType === "student"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Users className={`h-8 w-8 ${
                      userType === "student" 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-slate-400"
                    }`} />
                    <div className="text-center">
                      <div className={`font-semibold ${
                        userType === "student" 
                          ? "text-blue-700 dark:text-blue-300" 
                          : "text-slate-700 dark:text-slate-300"
                      }`}>
                        Student
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Discover & Register for Events
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("organizer")}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    userType === "organizer"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-105"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Calendar className={`h-8 w-8 ${
                      userType === "organizer" 
                        ? "text-purple-600 dark:text-purple-400" 
                        : "text-slate-400"
                    }`} />
                    <div className="text-center">
                      <div className={`font-semibold ${
                        userType === "organizer" 
                          ? "text-purple-700 dark:text-purple-300" 
                          : "text-slate-700 dark:text-slate-300"
                      }`}>
                        Organizer
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Create & Manage Events
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
                      Username *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Choose a username"
                        className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first_name" className="text-slate-700 dark:text-slate-300">
                        First Name
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        type="text"
                        placeholder="First name"
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={formData.first_name}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last_name" className="text-slate-700 dark:text-slate-300">
                        Last Name
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        type="text"
                        placeholder="Last name"
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="student@university.edu.pk"
                        className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {userType === "organizer" && (
                    <div className="grid gap-2">
                      <Label htmlFor="contact_number" className="text-slate-700 dark:text-slate-300">
                        Phone Number (Recommended)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="contact_number"
                          name="contact_number"
                          type="tel"
                          placeholder="+92 300 1234567"
                          className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          value={formData.contact_number}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="department" className="text-slate-700 dark:text-slate-300">
                      Department
                    </Label>
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      placeholder="e.g., Computer Science"
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2 space-y-2">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Password must contain:
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {[
                            { key: 'length', text: '8+ characters' },
                            { key: 'uppercase', text: 'Uppercase letter' },
                            { key: 'lowercase', text: 'Lowercase letter' },
                            { key: 'number', text: 'Number' },
                            { key: 'special', text: 'Special character' }
                          ].map((req) => (
                            <div key={req.key} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                passwordStrength[req.key as keyof typeof passwordStrength] 
                                  ? 'bg-green-500' 
                                  : 'bg-slate-300 dark:bg-slate-600'
                              }`}>
                                {passwordStrength[req.key as keyof typeof passwordStrength] && (
                                  <Check className="h-2 w-2 text-white" />
                                )}
                              </div>
                              <span className={
                                passwordStrength[req.key as keyof typeof passwordStrength]
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              }>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 mt-4"
                    disabled={isLoading || !isPasswordStrong || formData.password !== formData.confirmPassword}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating {userType} account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Create {userType === "student" ? "Student" : "Organizer"} Account
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Button variant="outline" type="button" className="w-full border-2" asChild disabled={isLoading}>
                <Link href="/login" className="flex items-center gap-2">
                  Sign in instead
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-l">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" />
          
          <div className="relative z-20 flex items-center text-lg font-medium mb-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8" />
              <span className="font-bold text-2xl">Evex</span>
            </div>
          </div>

          <div className="relative z-20 flex flex-col justify-center flex-1">
            <div className="max-w-md mx-auto">
              <h3 className="text-4xl font-bold mb-8 text-center">
                {userType === "student" ? "Student Benefits" : "Organizer Benefits"}
              </h3>
              
              <div className="space-y-6">
                {userType === "student" ? (
                  <>
                    <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                      <Users className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xl mb-2">Build Your Network</h4>
                        <p className="text-blue-100 text-lg">Connect with 8,000+ students across Pakistan</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                      <Sparkles className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xl mb-2">Exclusive Opportunities</h4>
                        <p className="text-blue-100 text-lg">Access hackathons, career fairs, and cultural events</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                      <Calendar className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xl mb-2">Easy Registration</h4>
                        <p className="text-blue-100 text-lg">One-click registration for events across universities</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                      <Calendar className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xl mb-2">Event Management</h4>
                        <p className="text-blue-100 text-lg">Create and manage events with powerful tools</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                      <Users className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xl mb-2">Reach More Students</h4>
                        <p className="text-blue-100 text-lg">Promote events to 8,000+ students across universities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                      <Sparkles className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xl mb-2">Analytics & Insights</h4>
                        <p className="text-blue-100 text-lg">Track registrations and engagement metrics</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-20 mt-auto pt-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">50+</div>
                <div className="text-blue-200 text-sm">Events Monthly</div>
              </div>
              <div>
                <div className="text-2xl font-bold">8K+</div>
                <div className="text-blue-200 text-sm">Active Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold">14+</div>
                <div className="text-blue-200 text-sm">Universities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}