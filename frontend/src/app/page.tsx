"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  Repeat,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Calendar,
  MessageSquare,
  Star,
  Layers,
  Code,
  Palette,
  Languages,
  Music,
  Briefcase,
  Heart,
} from "lucide-react";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const featuredCategories = [
    { name: "Programming & Code", count: "24 Skills", icon: Code },
    { name: "Design & Creative", count: "18 Skills", icon: Palette },
    { name: "Languages & Culture", count: "16 Skills", icon: Languages },
    { name: "Music & Audio", count: "14 Skills", icon: Music },
    { name: "Business & Strategy", count: "12 Skills", icon: Briefcase },
    { name: "Health & Movement", count: "10 Skills", icon: Heart },
  ];

  const testimonials = [
    {
      name: "Marcus Vance",
      role: "Guitarist & Software Student",
      quote: "I taught Elena fingerstyle acoustic guitar in exchange for weekly Python tutoring. We both progressed faster than any paid course.",
      stars: 5,
    },
    {
      name: "Elena Rostova",
      role: "Senior Backend Engineer",
      quote: "SkillSwap feels like learning how it was meant to be—collaborative, human, and rooted in mutual respect without money getting in the way.",
      stars: 5,
    },
    {
      name: "Sophia Chen",
      role: "Product Designer",
      quote: "Found a fluent Spanish speaker who wanted to master Figma design systems. The complementary matching algorithm was spot on.",
      stars: 5,
    },
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-16">
      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-12 max-w-4xl mx-auto px-4 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hairline-border border text-xs font-semibold text-foreground-light dark:text-foreground-dark">
          <Sparkles className="w-3.5 h-3.5 text-apple-blue" />
          <span>The Peer-to-Peer Knowledge Economy</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark leading-[1.08]">
          Trade knowledge. <br />
          <span className="text-muted-light dark:text-muted-dark">Not currency.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-light dark:text-muted-dark leading-relaxed font-normal">
          Connect with peers to teach what you excel at and master what you love. 
          No money changes hands. Time, craft, and mutual curiosity are the currency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-base shadow-sm transition-all hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{isAuthenticated ? "Go to Dashboard" : "Start Exchanging Skills"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/discover"
            className="w-full sm:w-auto py-3.5 px-7 rounded-full bg-surface-light dark:bg-surface-dark hairline-border border text-foreground-light dark:text-foreground-dark font-medium text-base hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
          >
            Explore Skills
          </Link>
        </div>
      </section>

      {/* How It Works (Calm 3 Steps) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-apple-blue">
            How It Works
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
            Three simple steps to reciprocal mastery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              List Your Skills
            </h3>
            <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
              Specify what you can teach with your comfort level, and identify the subjects or crafts you are excited to learn.
            </p>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-apple-green/10 text-apple-green flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              Smart Complementary Match
            </h3>
            <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
              Our bipartite algorithm identifies partners where Person A teaches what Person B wants, and Person B teaches what Person A wants.
            </p>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-apple-indigo/10 text-apple-indigo flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              Arrange Session & Swap
            </h3>
            <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
              Coordinate convenient time slots, meet online or in person, exchange knowledge, and leave mutual endorsements.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Skills Taxonomy Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-apple-blue">
              Diverse Taxonomy
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
              100+ Curated Disciplines
            </h2>
          </div>

          <Link
            href="/discover"
            className="text-sm font-semibold text-apple-blue dark:text-apple-blueDark hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={`/discover?category=${encodeURIComponent(cat.name)}`}
                className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm hover:shadow-apple-elevated transition-all flex flex-col items-center text-center space-y-3 group active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] group-hover:bg-apple-blue/10 group-hover:text-apple-blue flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground-light dark:text-foreground-dark">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] text-muted-light">
                    {cat.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-apple-blue">
            Community Stories
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
            Real exchanges. Real relationships.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-7 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex gap-1 text-apple-orange">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-apple-orange" />
                  ))}
                </div>
                <p className="text-sm text-foreground-light dark:text-foreground-dark leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="border-t hairline-border pt-4">
                <h4 className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                  {t.name}
                </h4>
                <p className="text-xs text-muted-light">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-10 md:p-14 shadow-apple text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            Ready to expand your skillset?
          </h2>
          <p className="max-w-xl mx-auto text-muted-light dark:text-muted-dark text-base">
            Join thousands of curious learners and generous mentors trading craft, code, and language.
          </p>
          <div className="pt-2">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex py-3.5 px-8 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-base shadow-sm transition-all hover:shadow active:scale-95"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pt-12 border-t hairline-border text-xs text-muted-light flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium text-foreground-light dark:text-foreground-dark">
          <Layers className="w-4 h-4 text-apple-blue" />
          <span>SkillSwap &copy; 2026</span>
        </div>
        <p>Built with Spring Boot 3 &amp; Next.js 15. Time and knowledge are the currency.</p>
      </footer>
    </div>
  );
}
