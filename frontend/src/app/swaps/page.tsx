"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import {
  Repeat,
  Calendar,
  Clock,
  Video,
  MapPin,
  Check,
  X,
  ExternalLink,
  Star,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export default function SwapsDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"requests" | "upcoming" | "past">("requests");
  const [requestFilter, setRequestFilter] = useState<"all" | "received" | "sent">("received");

  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      apiFetch<any[]>("/api/swaps?type=all").catch(() => []),
      apiFetch<any[]>("/api/sessions/upcoming").catch(() => []),
      apiFetch<any[]>("/api/sessions/past").catch(() => []),
    ])
      .then(([swaps, upcomings, pasts]) => {
        setSwapRequests(swaps);
        setUpcomingSessions(upcomings);
        setPastSessions(pasts);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptSwap = async (id: string) => {
    try {
      await apiFetch(`/api/swaps/${id}/accept`, { method: "PUT" });
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to accept swap proposal.");
    }
  };

  const handleDeclineSwap = async (id: string) => {
    try {
      await apiFetch(`/api/swaps/${id}/decline`, { method: "PUT" });
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to decline swap proposal.");
    }
  };

  const handleCancelSwap = async (id: string) => {
    try {
      await apiFetch(`/api/swaps/${id}/cancel`, { method: "PUT" });
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to cancel swap proposal.");
    }
  };

  const handleCompleteSession = async (id: string) => {
    try {
      await apiFetch(`/api/sessions/${id}/complete`, { method: "PUT" });
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to complete session.");
    }
  };

  const filteredRequests = swapRequests.filter((r) => {
    if (requestFilter === "received") return r.toUserId === user?.id;
    if (requestFilter === "sent") return r.fromUserId === user?.id;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-3">
            <Repeat className="w-7 h-7 text-apple-blue" />
            Swaps & Sessions
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Manage your peer swap proposals, join live video sessions, and track completed exchanges.
          </p>
        </div>

        <Link
          href="/discover"
          className="py-2.5 px-5 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-xs shadow-sm transition-all hover:shadow active:scale-95 self-start sm:self-auto"
        >
          Propose New Swap
        </Link>
      </div>

      {actionError && (
        <div className="p-4 rounded-apple-md bg-apple-red/10 border border-apple-red/20 text-apple-red text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {/* Segmented Control Tabs */}
      <div className="flex p-1 rounded-full hairline-border border bg-surface-light dark:bg-surface-dark max-w-md shadow-sm">
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === "requests"
              ? "bg-apple-blue text-white shadow-sm"
              : "text-muted-light hover:text-foreground-light"
          }`}
        >
          Requests ({swapRequests.filter((r) => r.status === "PENDING").length})
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === "upcoming"
              ? "bg-apple-blue text-white shadow-sm"
              : "text-muted-light hover:text-foreground-light"
          }`}
        >
          Upcoming ({upcomingSessions.length})
        </button>

        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === "past"
              ? "bg-apple-blue text-white shadow-sm"
              : "text-muted-light hover:text-foreground-light"
          }`}
        >
          Past ({pastSessions.length})
        </button>
      </div>

      {/* TAB 1: SWAP REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {/* Sub-filter pills */}
          <div className="flex gap-2">
            {[
              { id: "received", label: "Received Requests" },
              { id: "sent", label: "Sent Requests" },
              { id: "all", label: "All Requests" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRequestFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  requestFilter === f.id
                    ? "bg-foreground-light text-white dark:bg-foreground-dark dark:text-black"
                    : "bg-surface-light dark:bg-surface-dark hairline-border border text-muted-light hover:text-foreground-light"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-black/5 rounded-apple-xl animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 space-y-3">
              <p className="text-sm text-muted-light">No {requestFilter} swap proposals found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => {
                const isRecipient = req.toUserId === user?.id;
                const otherParty = isRecipient ? req.fromUser : req.toUser;

                return (
                  <div
                    key={req.id}
                    className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-xs">
                          {getInitials(otherParty?.name || "Peer")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                            {otherParty?.name || "Peer"}
                          </h3>
                          <p className="text-xs text-muted-light">
                            {isRecipient ? "Proposes a swap with you" : "You proposed a swap"} • {formatDate(req.createdAt)}
                          </p>
                        </div>

                        {/* Status Pill */}
                        <span
                          className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            req.status === "PENDING"
                              ? "bg-apple-orange/10 text-apple-orange"
                              : req.status === "ACCEPTED"
                              ? "bg-apple-green/10 text-apple-green"
                              : "bg-apple-red/10 text-apple-red"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {/* Skills Exchange Info */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="p-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border">
                          Offered: <strong className="text-apple-blue font-semibold">{req.offeredSkill?.skillName}</strong>
                        </span>
                        <span className="p-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border">
                          Requested: <strong className="text-apple-green font-semibold">{req.requestedSkill?.skillName}</strong>
                        </span>
                      </div>

                      {req.message && (
                        <p className="text-xs text-muted-light italic">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {isRecipient && req.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleAcceptSwap(req.id)}
                            className="py-2 px-4 rounded-full bg-apple-green hover:bg-apple-green/90 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Proposal</span>
                          </button>

                          <button
                            onClick={() => handleDeclineSwap(req.id)}
                            className="py-2 px-3 rounded-full hairline-border border hover:bg-apple-red/10 hover:text-apple-red text-xs font-medium text-muted-light active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {!isRecipient && req.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelSwap(req.id)}
                          className="py-2 px-4 rounded-full hairline-border border text-muted-light hover:text-apple-red hover:bg-apple-red/10 font-medium text-xs active:scale-95"
                        >
                          Cancel Request
                        </button>
                      )}

                      {req.status === "ACCEPTED" && req.sessionId && (
                        <button
                          onClick={() => setActiveTab("upcoming")}
                          className="py-2 px-4 rounded-full bg-apple-blue text-white font-medium text-xs active:scale-95"
                        >
                          View Session →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPCOMING SESSIONS */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 bg-black/5 rounded-apple-xl animate-pulse" />
              ))}
            </div>
          ) : upcomingSessions.length === 0 ? (
            <div className="text-center py-16 bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 space-y-3">
              <Calendar className="w-8 h-8 text-muted-light mx-auto" />
              <h3 className="font-semibold text-base">No upcoming sessions</h3>
              <p className="text-xs text-muted-light">Accept a pending swap request to lock in a confirmed session.</p>
            </div>
          ) : (
            upcomingSessions.map((session) => {
              const isUserA = session.userA?.id === user?.id;
              const partner = isUserA ? session.userB : session.userA;

              return (
                <div
                  key={session.id}
                  className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-apple flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-sm">
                        {getInitials(partner?.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-foreground-light dark:text-foreground-dark">
                          Session with {partner?.name}
                        </h3>
                        <p className="text-xs text-muted-light">
                          @{partner?.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-light dark:text-foreground-dark">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-apple-blue" />
                        {formatDate(session.startUtc)}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-apple-blue" />
                        {formatTime(session.startUtc)} - {formatTime(session.endUtc)} (UTC)
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        {session.mode === "ONLINE" ? (
                          <Video className="w-4 h-4 text-apple-green" />
                        ) : (
                          <MapPin className="w-4 h-4 text-apple-orange" />
                        )}
                        {session.mode === "ONLINE" ? "Online Video" : "In-Person"}
                      </span>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue font-medium">
                        {session.skillAOffers?.skillName} ⇄ {session.skillBOffers?.skillName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    {session.meetingLinkOrLocation && (
                      <a
                        href={session.meetingLinkOrLocation}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-5 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Session</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}

                    <button
                      onClick={() => handleCompleteSession(session.id)}
                      className="py-2.5 px-4 rounded-full bg-apple-green hover:bg-apple-green/90 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: PAST SESSIONS */}
      {activeTab === "past" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="h-32 bg-black/5 rounded-apple-xl animate-pulse" />
          ) : pastSessions.length === 0 ? (
            <div className="text-center py-16 bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-muted-light mx-auto" />
              <p className="text-sm text-muted-light">No completed sessions yet.</p>
            </div>
          ) : (
            pastSessions.map((session) => {
              const isUserA = session.userA?.id === user?.id;
              const partner = isUserA ? session.userB : session.userA;
              const hasReviewed = session.reviewedByUserIds?.includes(user?.id);

              return (
                <div
                  key={session.id}
                  className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                      Completed Swap with {partner?.name}
                    </h3>
                    <p className="text-xs text-muted-light">
                      Date: {formatDate(session.startUtc)} • Skills: {session.skillAOffers?.skillName} & {session.skillBOffers?.skillName}
                    </p>
                  </div>

                  <div>
                    {!hasReviewed ? (
                      <Link
                        href={`/reviews/new?sessionId=${session.id}&targetUserId=${partner?.id}`}
                        className="py-2 px-4 rounded-full bg-apple-orange text-white font-medium text-xs shadow-sm hover:shadow flex items-center gap-1.5 active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Leave Review</span>
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-apple-green flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Reviewed
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
