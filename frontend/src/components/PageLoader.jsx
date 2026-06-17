// frontend/src/components/PageLoader.jsx
import React from 'react';

export default function PageLoader() {
  return (
    <div className="w-full h-full space-y-6 animate-pulse p-6">
      {/* Top Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2.5">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-3.5 w-60 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
        </div>
        <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>

      {/* Main Bento Blocks Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>

      {/* Grid Sub Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-52 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="h-52 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    </div>
  );
}
