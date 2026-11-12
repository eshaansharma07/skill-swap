"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client-side errors
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-apple-red/10 border border-apple-red/20 flex items-center justify-center text-apple-red mb-6 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark mb-3">
        Something went wrong
      </h1>
      <p className="max-w-md text-base text-muted-light dark:text-muted-dark mb-8 leading-relaxed">
        An unexpected error occurred while processing this view. We have logged the issue.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:bg-apple-blue/90 transition-all shadow-sm active:scale-98"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-surface-light dark:bg-surface-dark hairline-border border text-foreground-light dark:text-foreground-dark text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm active:scale-98"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
