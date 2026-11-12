"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { User } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import {
  Star,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

function ReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const targetUserId = searchParams.get("targetUserId");

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [endorsedSkill, setEndorsedSkill] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    apiFetch<User>(`/api/users/${targetUserId}`)
      .then((data) => {
        setTargetUser(data);
        const teachSkills = data.skills?.filter((s) => s.type === "TEACH") || [];
        if (teachSkills.length > 0) {
          setEndorsedSkill(teachSkills[0].skillName);
        }
      })
      .catch(() => setErrorMsg("Could not load peer details."))
      .finally(() => setIsLoading(false));
  }, [targetUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !targetUserId || !reviewText.trim()) {
      setErrorMsg("Please provide your review thoughts.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          revieweeId: targetUserId,
          rating,
          text: reviewText.trim(),
          endorsedSkill,
        }),
      });

      router.push("/swaps");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit review.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 bg-black/10 rounded w-1/3" />
        <div className="h-64 bg-black/5 rounded-apple-xl" />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <h2 className="text-xl font-semibold">Session not found</h2>
        <Link href="/swaps" className="py-2.5 px-6 rounded-full bg-apple-blue text-white text-xs font-medium inline-block">
          Return to Swaps
        </Link>
      </div>
    );
  }

  const teachSkills = targetUser.skills?.filter((s) => s.type === "TEACH") || [];

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Link href="/swaps" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-light hover:text-foreground-light mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Swaps</span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-3">
          <Star className="w-7 h-7 text-apple-orange fill-apple-orange" />
          Review Session
        </h1>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Share your experience and endorse <strong className="text-foreground-light dark:text-foreground-dark">{targetUser.name}</strong>&apos;s teaching skill.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-apple-md bg-apple-red/10 border border-apple-red/20 text-apple-red text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-apple space-y-6">
        {/* Peer Info */}
        <div className="flex items-center gap-4 pb-6 border-b hairline-border">
          <div className="w-12 h-12 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-sm">
            {getInitials(targetUser.name)}
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground-light dark:text-foreground-dark">{targetUser.name}</h3>
            <p className="text-xs text-muted-light">@{targetUser.username}</p>
          </div>
        </div>

        {/* 5-Star Rating */}
        <div className="space-y-2 text-center py-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-light block">
            Overall Rating
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? "fill-apple-orange text-apple-orange"
                      : "text-muted-light/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-light font-medium">
            {rating === 5 && "Exceptional & thoroughly prepared"}
            {rating === 4 && "Great exchange & valuable feedback"}
            {rating === 3 && "Good session"}
            {rating === 2 && "Could have been better"}
            {rating === 1 && "Did not meet expectations"}
          </p>
        </div>

        {/* Endorse Skill */}
        {teachSkills.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-light flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-apple-blue" />
              Skill Endorsement
            </label>
            <select
              value={endorsedSkill}
              onChange={(e) => setEndorsedSkill(e.target.value)}
              className="w-full px-3 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
            >
              {teachSkills.map((s, idx) => (
                <option key={idx} value={s.skillName}>
                  {s.skillName} ({s.level})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Review Text */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-light block">
            Written Feedback & Endorsement
          </label>
          <textarea
            rows={4}
            placeholder={`Describe what you learned from ${targetUser.name}, their patience, and teaching style...`}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full px-4 py-3 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !reviewText.trim()}
          className="w-full py-3 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Submit Review</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-12 animate-pulse space-y-4">
          <div className="h-8 bg-black/10 rounded w-1/3" />
          <div className="h-64 bg-black/5 rounded-apple-xl" />
        </div>
      }
    >
      <ReviewForm />
    </Suspense>
  );
}
