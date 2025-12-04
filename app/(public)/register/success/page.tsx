import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function RegisterSuccess() {
  return (
    <Suspense fallback={<SuccessSkeleton />}>
      <SuccessContent />
    </Suspense>
  );
}

// Skeleton loading component
function SuccessSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 py-20">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-4">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
        </div>

        <div className="space-y-4 pt-6">
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}
