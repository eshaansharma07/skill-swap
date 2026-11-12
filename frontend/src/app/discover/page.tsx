"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { User } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Filter,
  CheckCircle2,
} from "lucide-react";

export default function DiscoverPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("ALL");

  const categories = [
    "All",
    "Technology & Programming",
    "Design & Creative",
    "Languages & Linguistics",
    "Music & Audio",
    "Business & Career",
    "Health & Wellness",
    "Craft & DIY",
    "Academic & Sciences",
  ];

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedMode !== "ALL") params.set("mode", selectedMode);

    apiFetch<User[]>(`/api/users/search?${params.toString()}`)
      .then((data) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, [searchQuery, selectedCategory, selectedMode]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
          Discover Mentors & Peers
        </h1>
        <p className="text-base text-muted-light dark:text-muted-dark">
          Explore talented individuals ready to exchange knowledge. Filter by category, proficiency, and learning mode.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
            <input
              type="text"
              placeholder="Search by name, skill, or keyword (e.g. Python, Piano, Spanish)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-light dark:bg-surface-dark hairline-border border text-sm text-foreground-light dark:text-foreground-dark placeholder-muted-light/60 dark:placeholder-muted-dark/60 shadow-sm focus-visible:ring-2 focus-visible:ring-apple-blue"
            />
          </div>

          {/* Mode Selector */}
          <div className="flex rounded-full hairline-border border p-1 bg-surface-light dark:bg-surface-dark text-xs self-start">
            {[
              { id: "ALL", label: "Any Mode" },
              { id: "ONLINE", label: "Online" },
              { id: "IN_PERSON", label: "In-Person" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                  selectedMode === m.id
                    ? "bg-apple-blue text-white shadow-sm"
                    : "text-muted-light dark:text-muted-dark hover:text-foreground-light"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-foreground-light text-white dark:bg-foreground-dark dark:text-black shadow-sm"
                  : "bg-surface-light dark:bg-surface-dark hairline-border border text-muted-light dark:text-muted-dark hover:text-foreground-light"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of User Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-1/3" />
                </div>
              </div>
              <div className="h-12 bg-black/5 dark:bg-white/5 rounded-apple-md" />
              <div className="h-10 bg-black/10 dark:bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-sm space-y-3">
          <div className="inline-flex p-3 rounded-full bg-black/5 dark:bg-white/10 text-muted-light dark:text-muted-dark">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            No matching peers found
          </h3>
          <p className="text-sm text-muted-light dark:text-muted-dark max-w-sm mx-auto">
            Try adjusting your search terms, changing the category filter, or exploring online sessions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((peer) => {
            const teaches = peer.skills?.filter((s) => s.type === "TEACH") || [];
            const wants = peer.skills?.filter((s) => s.type === "LEARN") || [];

            return (
              <div
                key={peer.id}
                className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm hover:shadow-apple-elevated transition-all duration-200 flex flex-col justify-between space-y-5"
              >
                {/* User Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-sm text-foreground-light dark:text-foreground-dark">
                      {getInitials(peer.name)}
                    </div>
                    <div>
                      <Link
                        href={`/profile/${peer.username}`}
                        className="font-semibold text-base text-foreground-light dark:text-foreground-dark hover:text-apple-blue transition-colors line-clamp-1"
                      >
                        {peer.name}
                      </Link>
                      <p className="text-xs text-muted-light dark:text-muted-dark">
                        @{peer.username}
                        {peer.location?.city && ` • ${peer.location.city}`}
                      </p>
                    </div>
                  </div>

                  {peer.reputation && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-apple-orange bg-apple-orange/10 px-2 py-1 rounded-full shrink-0">
                      <Star className="w-3 h-3 fill-apple-orange" />
                      <span>{peer.reputation.ratingAverage?.toFixed(1) || "5.0"}</span>
                    </div>
                  )}
                </div>

                {/* Bio preview */}
                {peer.bio && (
                  <p className="text-xs text-muted-light dark:text-muted-dark line-clamp-2 leading-relaxed">
                    {peer.bio}
                  </p>
                )}

                {/* Skills Section */}
                <div className="space-y-3 pt-2 border-t hairline-border">
                  {/* Teaches */}
                  <div>
                    <span className="text-[11px] font-medium text-apple-blue uppercase tracking-wider block mb-1.5">
                      Teaches
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {teaches.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-xs bg-apple-blue/10 text-apple-blue dark:text-apple-blueDark font-medium"
                        >
                          {s.skillName}
                        </span>
                      ))}
                      {teaches.length > 3 && (
                        <span className="text-xs text-muted-light self-center">
                          +{teaches.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Wants */}
                  <div>
                    <span className="text-[11px] font-medium text-apple-green uppercase tracking-wider block mb-1.5">
                      Wants to Learn
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {wants.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-xs bg-apple-green/10 text-apple-green font-medium"
                        >
                          {s.skillName}
                        </span>
                      ))}
                      {wants.length > 3 && (
                        <span className="text-xs text-muted-light self-center">
                          +{wants.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <Link
                    href={`/profile/${peer.username}`}
                    className="text-xs font-semibold text-muted-light dark:text-muted-dark hover:text-foreground-light transition-colors"
                  >
                    View Profile
                  </Link>

                  <Link
                    href={`/swaps/new?targetUserId=${peer.id}`}
                    className="py-2 px-4 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-xs shadow-sm transition-all hover:shadow active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Propose Swap</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
