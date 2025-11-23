// app/login/page.tsx
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, University } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext'; // Use AuthContext instead of authService

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "", // Accepts username or email
    password: ""
  });

  const { login } = useAuth(); // Get login function from AuthContext
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userType = await login(formData.username, formData.password);
      
      // Redirect based on user type
      let redirectPath = '/dashboard';
      if (userType === 'student') {
        redirectPath = '/dashboard/student';
      } else if (userType === 'organizer') {
        redirectPath = '/dashboard/organizer';
      } else if (userType === 'admin') {
        redirectPath = '/dashboard/admin';
      }
      
      router.push(redirectPath);
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'Invalid username or password');
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left Side - Form */}
        <div className="lg:p-8 flex items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <div className="flex flex-col space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Evex
                </h1>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to access your personalized dashboard
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}



            <div className="grid gap-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
                      Username or Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username or email"
                        className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In
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
                    New to Evex?
                  </span>
                </div>
              </div>

              <Button variant="outline" type="button" className="w-full border-2" asChild disabled={isLoading}>
                <Link href="/register" className="flex items-center gap-2">
                  Create an account
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              By continuing, you agree to our{" "}
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
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
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
                Multi-Role Platform
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <University className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-xl mb-2">For Students</h4>
                    <p className="text-blue-100 text-lg">Discover and register for events across universities</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <Sparkles className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-xl mb-2">For Organizers</h4>
                    <p className="text-blue-100 text-lg">Create and manage events with powerful tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <University className="h-8 w-8 text-blue-200 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-xl mb-2">For Admins</h4>
                    <p className="text-blue-100 text-lg">Manage platform users and university partnerships</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 mt-auto pt-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-blue-200 text-sm">User Types</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50+</div>
                <div className="text-blue-200 text-sm">Events Monthly</div>
              </div>
              <div>
                <div className="text-2xl font-bold">6+</div>
                <div className="text-blue-200 text-sm">Universities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}