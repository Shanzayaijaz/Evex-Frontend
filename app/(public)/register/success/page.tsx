// app/register/success/page.tsx
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { useSearchParams } from 'next/navigation';

export default function RegisterSuccess() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 py-20">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Registration Successful!
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400">
            Your account has been created successfully. You can now sign in to your account.
          </p>
          
          {email && (
            <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {email}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-6">
          <Button asChild className="w-full">
            <Link href="/login" className="flex items-center gap-2">
              Go to Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ready to explore events? Sign in to get started.
          </p>
        </div>
      </div>
    </div>
  );
}