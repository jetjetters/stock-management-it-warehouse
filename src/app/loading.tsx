export default function Loading(): React.JSX.Element {
  return (
    <div
      className="space-y-6 animate-pulse max-w-7xl mx-auto"
      aria-busy="true"
      aria-label="Memuat konten..."
    >
      {/* Top Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200/80 rounded-lg dark:bg-slate-700/60" />
          <div className="h-4 w-72 bg-slate-200/50 rounded dark:bg-slate-700/40" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-slate-200/70 rounded-xl dark:bg-slate-700/50" />
          <div className="h-10 w-36 bg-slate-200/70 rounded-xl dark:bg-slate-700/50" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="p-4 rounded-2xl border border-slate-200/70 bg-white/70 shadow-xs space-y-3 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-slate-200/70 rounded dark:bg-slate-700/50" />
              <div className="h-8 w-8 bg-slate-200/60 rounded-xl dark:bg-slate-700/40" />
            </div>
            <div className="h-7 w-16 bg-slate-200/80 rounded dark:bg-slate-700/60" />
            <div className="h-3 w-28 bg-slate-200/50 rounded dark:bg-slate-700/40" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/70 shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900/40">
        {/* Table Filter Skeleton */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 justify-between items-center dark:border-slate-800">
          <div className="h-10 w-full md:w-80 bg-slate-200/60 rounded-xl dark:bg-slate-700/50" />
          <div className="flex gap-2 w-full md:w-auto">
            <div className="h-10 w-28 bg-slate-200/60 rounded-xl dark:bg-slate-700/50" />
            <div className="h-10 w-28 bg-slate-200/60 rounded-xl dark:bg-slate-700/50" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="p-4 space-y-3">
          <div className="h-8 w-full bg-slate-200/40 rounded-lg dark:bg-slate-700/30" />
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="h-12 w-full bg-slate-200/30 rounded-xl flex items-center px-4 gap-4 dark:bg-slate-800/40"
            >
              <div className="h-4 w-24 bg-slate-200/60 rounded dark:bg-slate-700/50" />
              <div className="h-4 flex-1 bg-slate-200/50 rounded dark:bg-slate-700/40" />
              <div className="h-4 w-28 bg-slate-200/50 rounded dark:bg-slate-700/40" />
              <div className="h-4 w-16 bg-slate-200/60 rounded dark:bg-slate-700/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
