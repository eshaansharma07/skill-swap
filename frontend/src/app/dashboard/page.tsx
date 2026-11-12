"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api-client";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import {
  Sparkles,
  Repeat,
  Calendar,
  Clock,
  Video,
  Star,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Plus,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiFetch<any[]>("/api/matches").catch(() => []),
      apiFetch<any[]>("/api/sessions/upcoming").catch(() => []),
      apiFetch<any[]>("/api/swaps?type=received").catch(() => []),
    ])
      .then(([m, s, r]) => {
        setMatches(m || []);
        setUpcomingSessions(s || []);
        setPendingRequests((r || []).filter((req: any) => req.status === "PENDING"));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Greeting & Metric Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Explorer"}
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
            Here is what is happening with your skills exchange network today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/matches"
            className="py-2 px-4 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-xs shadow-sm transition-all hover:shadow active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Matches</span>
          </Link>

          <Link
            href="/discover"
            className="py-2 px-4 rounded-full hairline-border border bg-surface-light dark:bg-surface-dark text-foreground-light dark:text-foreground-dark font-medium text-xs hover:bg-black/5 transition-all"
          >
            Discover Peers
          </Link>
        </div>
      </div>

      {/* Pending Swap Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="p-4 rounded-apple-xl bg-apple-blue/[0.06] border border-apple-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-full bg-apple-blue text-white shrink-0">
              <Repeat className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                You have {pendingRequests.length} pending swap {pendingRequests.length === 1 ? "proposal" : "proposals"}
              </h4>
              <p className="text-xs text-muted-light">
                {pendingRequests[0].fromUser?.name || "A peer"} proposed to exchange skills with you.
              </p>
            </div>
          </div>

          <Link
            href="/swaps"
            className="py-2 px-4 rounded-full bg-apple-blue text-white text-xs font-semibold self-start sm:self-auto hover:bg-apple-blue/90 shrink-0"
          >
            Review Proposals →
          </Link>
        </div>
      )}

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-light text-xs font-medium">
            <span>Compatible Matches</span>
            <Sparkles className="w-4 h-4 text-apple-blue" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            {matches.length}
          </p>
          <span className="text-[11px] text-muted-light">Complementary fits ready to swap</span>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-light text-xs font-medium">
            <span>Sessions Completed</span>
            <CheckCircle2 className="w-4 h-4 text-apple-green" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            {user?.reputation?.sessionsCompleted || 0}
          </p>
          <span className="text-[11px] text-muted-light">Successful skill exchanges</span>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-light text-xs font-medium">
            <span>Reputation Score</span>
            <Star className="w-4 h-4 text-apple-orange fill-apple-orange" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            {user?.reputation?.ratingAverage?.toFixed(1) || "5.0"} ★
          </p>
          <span className="text-[11px] text-muted-light">Based on peer reviews</span>
        </div>
      </div>

      {/* Main Two-Column Grid: Matches Preview & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Top Matches Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-apple-blue" />
              Top Smart Matches
            </h2>
            <Link
              href="/matches"
              className="text-xs font-semibold text-apple-blue hover:underline"
            >
              See all ({matches.length}) →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-black/5 rounded-apple-xl animate-pulse" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl space-y-2">
              <p className="text-xs text-muted-light">No matches computed yet.</p>
              <Link href="/profile#skills" className="text-xs font-semibold text-apple-blue hover:underline">
                Add more skills to your profile →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 3).map((match, idx) => {
                const peer = match.user;
                return (
                  <div
                    key={peer.id}
                    className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm hover:shadow-apple-elevated transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-sm shrink-0">
                        {getInitials(peer.name)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${peer.username}`}
                            className="font-semibold text-sm text-foreground-light dark:text-foreground-dark hover:text-apple-blue"
                          >
                            {peer.name}
                          </Link>
                          {match.isDirectMutualMatch && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-apple-blue/10 text-apple-blue uppercase">
                              Mutual
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-light">
                          @{peer.username} • {peer.location?.city || "Remote"}
                        </p>
                        {match.reasons?.[0] && (
                          <p className="text-xs text-apple-blue font-medium line-clamp-1">
                            {match.reasons[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-bold text-apple-blue">{match.matchScore}%</span>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-light">Fit</span>
                      </div>

                      <Link
                        href={`/swaps/new?targetUserId=${peer.id}`}
                        className="py-2 px-3.5 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-xs shadow-sm"
                      >
                        Swap
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 span): Upcoming Sessions Quick List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-2">
              <Calendar className="w-4 h-4 text-apple-blue" />
              Next Sessions
            </h2>
            <Link
              href="/swaps"
              className="text-xs font-semibold text-apple-blue hover:underline"
            >
              Calendar →
            </Link>
          </div>

          {isLoading ? (
            <div className="h-44 bg-black/5 rounded-apple-xl animate-pulse" />
          ) : upcomingSessions.length === 0 ? (
            <div className="p-6 text-center bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl space-y-2">
              <Clock className="w-6 h-6 text-muted-light mx-auto" />
              <p className="text-xs text-muted-light">No sessions scheduled.</p>
              <Link href="/discover" className="text-xs font-semibold text-apple-blue hover:underline inline-block">
                Find a peer to swap →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 2).map((s) => {
                const partner = s.userA?.id === user?.id ? s.userB : s.userA;
                return (
                  <div
                    key={s.id}
                    className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground-light dark:text-foreground-dark">
                        With {partner?.name}
                      </span>
                      <span className="text-[10px] text-apple-green font-medium">Scheduled</span>
                    </div>

                    <div className="text-xs text-muted-light space-y-1">
                      <p>{formatDate(s.startUtc)} • {formatTime(s.startUtc)} (UTC)</p>
                      <p className="font-medium text-foreground-light dark:text-foreground-dark truncate">
                        {s.skillAOffers?.skillName} ⇄ {s.skillBOffers?.skillName}
                      </p>
                    </div>

                    {s.meetingLinkOrLocation && (
                      <a
                        href={s.meetingLinkOrLocation}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 rounded-full bg-apple-blue/10 text-apple-blue font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-apple-blue/20 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Room</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
