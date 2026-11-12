"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { User, UserSkill } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import {
  Star,
  MapPin,
  Globe,
  Clock,
  Calendar,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Repeat,
  CheckCircle2,
} from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [peer, setPeer] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!username) return;
    setIsLoading(true);
    apiFetch<User>(`/api/users/profile/${username}`)
      .then((data) => {
        setPeer(data);
        return apiFetch<any[]>(`/api/reviews/user/${data.id}`).catch(() => []);
      })
      .then((revs) => setReviews(revs || []))
      .catch(() => setPeer(null))
      .finally(() => setIsLoading(false));
  }, [username]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-32 bg-black/10 dark:bg-white/10 rounded-apple-xl" />
        <div className="h-64 bg-black/5 dark:bg-white/5 rounded-apple-xl" />
      </div>
    );
  }

  if (!peer) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <h2 className="text-2xl font-semibold text-foreground-light dark:text-foreground-dark">User Not Found</h2>
        <p className="text-sm text-muted-light dark:text-muted-dark">The user @{username} does not exist or has deleted their account.</p>
        <Link href="/discover" className="inline-block py-2 px-5 rounded-full bg-apple-blue text-white text-xs font-medium">
          Back to Discover
        </Link>
      </div>
    );
  }

  const teaches = peer.skills?.filter((s) => s.type === "TEACH") || [];
  const wants = peer.skills?.filter((s) => s.type === "LEARN") || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-apple space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-2xl text-foreground-light dark:text-foreground-dark shrink-0">
              {getInitials(peer.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
                  {peer.name}
                </h1>
                <ShieldCheck className="w-5 h-5 text-apple-blue" />
              </div>
              <p className="text-sm text-muted-light dark:text-muted-dark">@{peer.username}</p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-light dark:text-muted-dark">
                {peer.location?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {peer.location.city}, {peer.location.country}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {peer.timezone || "UTC"}
                </span>
                {peer.languages?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {peer.languages.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
            {peer.reputation && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-apple-orange/10 text-apple-orange font-semibold text-sm">
                <Star className="w-4 h-4 fill-apple-orange" />
                <span>{peer.reputation.ratingAverage?.toFixed(1) || "5.0"}</span>
                <span className="text-xs text-muted-light">({peer.reputation.totalReviews} reviews)</span>
              </div>
            )}

            <Link
              href={`/swaps/new?targetUserId=${peer.id}`}
              className="py-2.5 px-6 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 flex items-center gap-2"
            >
              <Repeat className="w-4 h-4" />
              <span>Propose a Swap</span>
            </Link>
          </div>
        </div>

        {peer.bio && (
          <p className="text-sm text-foreground-light dark:text-foreground-dark leading-relaxed border-t hairline-border pt-4">
            {peer.bio}
          </p>
        )}
      </div>

      {/* Skills Side-by-Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Taught */}
        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b hairline-border">
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-apple-blue" />
              Skills Taught ({teaches.length})
            </h3>
            <span className="text-[11px] font-medium text-apple-blue uppercase tracking-wider">Expertise</span>
          </div>

          <div className="space-y-3">
            {teaches.map((skill, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                    {skill.skillName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-apple-blue/10 text-apple-blue dark:text-apple-blueDark">
                    {skill.level}
                  </span>
                </div>
                {skill.description && (
                  <p className="text-xs text-muted-light dark:text-muted-dark">{skill.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b hairline-border">
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-apple-green" />
              Skills Wanted ({wants.length})
            </h3>
            <span className="text-[11px] font-medium text-apple-green uppercase tracking-wider">Learning Goals</span>
          </div>

          <div className="space-y-3">
            {wants.map((skill, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                    {skill.skillName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-apple-green/10 text-apple-green">
                    Target: {skill.level}
                  </span>
                </div>
                {skill.description && (
                  <p className="text-xs text-muted-light dark:text-muted-dark">{skill.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews & Reputation */}
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
          <Star className="w-4 h-4 text-apple-orange" />
          Endorsements & Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-light dark:text-muted-dark italic py-2">
            No completed session reviews yet. Arrange a swap to be their first reviewer!
          </p>
        ) : (
          <div className="space-y-4 pt-2">
            {reviews.map((r, idx) => (
              <div key={idx} className="p-4 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-apple-orange">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-apple-orange" />
                    ))}
                  </div>
                  <span className="text-muted-light">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground-light dark:text-foreground-dark leading-relaxed">{r.text}</p>
                {r.endorsedSkill && (
                  <span className="inline-block text-[11px] font-medium text-apple-blue bg-apple-blue/10 px-2 py-0.5 rounded-md">
                    Endorsed in {r.endorsedSkill}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
