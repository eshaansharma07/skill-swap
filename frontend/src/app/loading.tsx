export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-48 bg-black/5 dark:bg-white/5 rounded-apple-md" />
        <div className="h-4 w-72 bg-black/5 dark:bg-white/5 rounded-apple-sm" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-apple-xl bg-surface-light dark:bg-surface-dark hairline-border border space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5" />
              <div className="space-y-2">
                <div className="h-4 w-28 bg-black/5 dark:bg-white/5 rounded" />
                <div className="h-3 w-16 bg-black/5 dark:bg-white/5 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded" />
              <div className="h-3 w-4/5 bg-black/5 dark:bg-white/5 rounded" />
            </div>
            <div className="pt-2 flex gap-2">
              <div className="h-6 w-20 bg-black/5 dark:bg-white/5 rounded-full" />
              <div className="h-6 w-24 bg-black/5 dark:bg-white/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
