"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useAuth, UserSkill } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import {
  Sparkles,
  CheckCircle2,
  Repeat,
  ArrowRight,
  Star,
  Clock,
  Globe,
  MapPin,
  GraduationCap,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface Match {
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
    reputation?: {
      ratingAverage?: number;
      sessionsCompleted?: number;
    };
    location?: {
      city?: string;
      mode?: string;
    };
  };
  matchScore: number;
  reasons: string[];
  mutualTeachSkills: UserSkill[];
  mutualLearnSkills: UserSkill[];
  isDirectMutualMatch: boolean;
}

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch<Match[]>("/api/matches")
      .then((data) => setMatches(data))
      .catch(() => setMatches([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-apple-blue/10 text-apple-blue dark:text-apple-blueDark">
            <Sparkles className="w-5 h-5" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
            Smart Matches
          </h1>
        </div>
        <p className="text-base text-muted-light dark:text-muted-dark">
          Our bipartite matching algorithm ranked peers whose teaching offers directly fulfill your learning aspirations, and vice versa.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-1/4" />
                </div>
              </div>
              <div className="h-16 bg-black/5 dark:bg-white/5 rounded-apple-md" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-sm space-y-4">
          <div className="inline-flex p-3 rounded-full bg-apple-blue/10 text-apple-blue">
            <Repeat className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
            No matches found yet
          </h3>
          <p className="text-sm text-muted-light dark:text-muted-dark max-w-md mx-auto">
            Add more skills you can teach and skills you want to learn to increase your mutual compatibility network.
          </p>
          <div className="pt-2">
            <Link
              href="/profile#skills"
              className="py-2.5 px-6 rounded-full bg-apple-blue text-white font-medium text-xs shadow-sm hover:shadow"
            >
              Manage My Skills
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match, idx) => {
            const peer = match.user;
            return (
              <div
                key={peer.id}
                className={`bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm transition-all duration-200 hover:shadow-apple-elevated relative overflow-hidden ${
                  match.isDirectMutualMatch ? "border-l-4 border-l-apple-blue" : ""
                }`}
              >
                {/* Top Bar: Match Score & Peer Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b hairline-border">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-base text-foreground-light dark:text-foreground-dark shrink-0">
                      {getInitials(peer.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${peer.username}`}
                          className="font-semibold text-lg text-foreground-light dark:text-foreground-dark hover:text-apple-blue transition-colors"
                        >
                          {peer.name}
                        </Link>
                        {match.isDirectMutualMatch && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-apple-blue/10 text-apple-blue dark:text-apple-blueDark">
                            Direct Mutual Fit
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-light dark:text-muted-dark">
                        @{peer.username}
                        {peer.location?.city && ` • ${peer.location.city}`}
                        {peer.reputation?.ratingAverage && ` • ${peer.reputation.ratingAverage.toFixed(1)} ★`}
                      </p>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-2xl font-bold tracking-tight text-apple-blue dark:text-apple-blueDark">
                        {match.matchScore}%
                      </span>
                      <span className="block text-[10px] uppercase font-semibold text-muted-light dark:text-muted-dark tracking-wider">
                        Match Score
                      </span>
                    </div>

                    <Link
                      href={`/swaps/new?targetUserId=${peer.id}`}
                      className="py-2.5 px-5 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-xs shadow-sm transition-all hover:shadow active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      <span>Propose Swap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Why You Match Reasons */}
                <div className="py-5 space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark">
                    Why you match
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {match.reasons.map((reason, rIdx) => (
                      <div
                        key={rIdx}
                        className="flex items-start gap-2.5 p-2.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] text-xs text-foreground-light dark:text-foreground-dark"
                      >
                        <CheckCircle2 className="w-4 h-4 text-apple-blue mt-0.5 shrink-0" />
                        <span className="leading-snug">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills In Play */}
                <div className="pt-4 border-t hairline-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-light dark:text-muted-dark gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground-light dark:text-foreground-dark">Exchange:</span>
                    {match.mutualTeachSkills?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-apple-blue/10 text-apple-blue font-medium">
                        You teach: {match.mutualTeachSkills.map((s) => s.skillName).join(", ")}
                      </span>
                    )}
                    {match.mutualLearnSkills?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-apple-green/10 text-apple-green font-medium">
                        You learn: {match.mutualLearnSkills.map((s) => s.skillName).join(", ")}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/profile/${peer.username}`}
                    className="text-xs font-semibold text-apple-blue hover:underline"
                  >
                    View Full Profile & Reviews →
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
