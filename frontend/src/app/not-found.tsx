import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-surface-light dark:bg-surface-dark hairline-border border flex items-center justify-center text-muted-light dark:text-muted-dark mb-6 shadow-sm">
        <Compass className="w-8 h-8 text-apple-blue animate-pulse" />
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark mb-3">
        Page not found
      </h1>
      <p className="max-w-md text-base text-muted-light dark:text-muted-dark mb-8 leading-relaxed">
        The skill, person, or page you are looking for might have been moved or does not exist.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:bg-apple-blue/90 transition-all shadow-sm active:scale-98"
      >
        <ArrowLeft className="w-4 h-4" />
        Return Home
      </Link>
    </div>
  );
}
