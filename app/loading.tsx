export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Sidebar (Profile Card Skeleton) */}
        <div className="hidden md:block md:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="h-24 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            <div className="flex justify-center -mt-10">
              <div className="w-20 h-20 bg-slate-300 dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-900 animate-pulse"></div>
            </div>
            <div className="p-5 flex flex-col items-center gap-3">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              <div className="w-full mt-4 space-y-2">
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed Column */}
        <div className="col-span-1 md:col-span-6 space-y-6">
          {/* Post Skeletons */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
              <div className="mt-6 h-40 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4"></div>
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
