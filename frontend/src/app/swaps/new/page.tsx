"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useAuth, User, UserSkill } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import {
  Repeat,
  Calendar,
  Clock,
  MapPin,
  Video,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  GraduationCap,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

function NewSwapForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("targetUserId");
  const { user: currentUser } = useAuth();

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMySkill, setSelectedMySkill] = useState<UserSkill | null>(null);
  const [selectedTheirSkill, setSelectedTheirSkill] = useState<UserSkill | null>(null);

  // Proposed Slot
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("18:00");
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON">("ONLINE");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSlotDate(tomorrow.toISOString().split("T")[0]);

    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    apiFetch<User>(`/api/users/${targetUserId}`)
      .then((data) => {
        setTargetUser(data);

        if (currentUser?.skills) {
          const myTeach = currentUser.skills.filter((s) => s.type === "TEACH");
          if (myTeach.length > 0) setSelectedMySkill(myTeach[0]);
        }

        const theirTeach = data.skills?.filter((s) => s.type === "TEACH") || [];
        if (theirTeach.length > 0) setSelectedTheirSkill(theirTeach[0]);
      })
      .catch(() => setErrorMsg("Could not load target peer details."))
      .finally(() => setIsLoading(false));
  }, [targetUserId, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || !selectedMySkill || !selectedTheirSkill || !slotDate || !slotTime) {
      setErrorMsg("Please select both skills and a proposed date/time.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const startUtc = new Date(`${slotDate}T${slotTime}:00Z`).toISOString();
    const endUtc = new Date(new Date(startUtc).getTime() + 60 * 60 * 1000).toISOString();

    try {
      await apiFetch("/api/swaps", {
        method: "POST",
        body: JSON.stringify({
          toUserId: targetUser.id,
          offeredSkill: selectedMySkill,
          requestedSkill: selectedTheirSkill,
          proposedSlots: [
            {
              startUtc,
              endUtc,
              mode,
              locationOrLink: mode === "ONLINE" ? "https://meet.skillswap.io" : locationOrLink || "Local Library / Cafe",
            },
          ],
          message: message || `Hi ${targetUser.name}, I would love to arrange a swap: I can teach you ${selectedMySkill.skillName} in exchange for learning ${selectedTheirSkill.skillName}!`,
        }),
      });

      router.push("/swaps");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit swap proposal.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-10 bg-black/10 dark:bg-white/10 rounded w-1/3" />
        <div className="h-48 bg-black/5 dark:bg-white/5 rounded-apple-xl" />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <h2 className="text-xl font-semibold">Select a peer first</h2>
        <p className="text-sm text-muted-light dark:text-muted-dark">Explore our discover page or smart matches to propose a skill exchange.</p>
        <Link href="/discover" className="inline-block py-2.5 px-6 rounded-full bg-apple-blue text-white text-xs font-medium">
          Browse Discover
        </Link>
      </div>
    );
  }

  const myTeachSkills = currentUser?.skills?.filter((s) => s.type === "TEACH") || [];
  const theirTeachSkills = targetUser.skills?.filter((s) => s.type === "TEACH") || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <Link href="/discover" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-light hover:text-foreground-light mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discover</span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-3">
          <Repeat className="w-7 h-7 text-apple-blue" />
          Propose a Skill Swap
        </h1>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Arrange a complementary 1-on-1 session with <strong className="text-foreground-light dark:text-foreground-dark">{targetUser.name}</strong>. Both parties give and receive knowledge.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-apple-md bg-apple-red/10 border border-apple-red/20 text-apple-red text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-sm text-foreground-light dark:text-foreground-dark shrink-0">
            {getInitials(targetUser.name)}
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground-light dark:text-foreground-dark">{targetUser.name}</h3>
            <p className="text-xs text-muted-light dark:text-muted-dark">@{targetUser.username} • {targetUser.location?.city || "Remote"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-apple-blue flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              1. Skill You Will Teach
            </label>
            <p className="text-xs text-muted-light">Choose from your listed teaching skills:</p>

            <div className="space-y-2 pt-1">
              {myTeachSkills.length === 0 ? (
                <p className="text-xs text-apple-red">You have no teaching skills listed. Please add some to your profile first.</p>
              ) : (
                myTeachSkills.map((skill, idx) => {
                  const isSelected = selectedMySkill?.skillName === skill.skillName;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedMySkill(skill)}
                      className={`w-full p-3 rounded-apple-md hairline-border border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-apple-blue/10 border-apple-blue text-apple-blue dark:text-apple-blueDark font-semibold"
                          : "hover:bg-black/[0.02] text-foreground-light dark:text-foreground-dark"
                      }`}
                    >
                      <span>{skill.skillName} ({skill.level})</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-apple-blue shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-apple-green flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              2. Skill You Want to Learn
            </label>
            <p className="text-xs text-muted-light">Choose from {targetUser.name}&apos;s teaching offers:</p>

            <div className="space-y-2 pt-1">
              {theirTeachSkills.length === 0 ? (
                <p className="text-xs text-muted-light italic">This user has not listed teaching skills yet.</p>
              ) : (
                theirTeachSkills.map((skill, idx) => {
                  const isSelected = selectedTheirSkill?.skillName === skill.skillName;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTheirSkill(skill)}
                      className={`w-full p-3 rounded-apple-md hairline-border border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-apple-green/10 border-apple-green text-apple-green font-semibold"
                          : "hover:bg-black/[0.02] text-foreground-light dark:text-foreground-dark"
                      }`}
                    >
                      <span>{skill.skillName} ({skill.level})</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-apple-green shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
            <Calendar className="w-4 h-4 text-apple-blue" />
            3. Proposed Session Timing & Mode
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-light mb-1">Date</label>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full px-3 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-light mb-1">Time (UTC)</label>
              <input
                type="time"
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
                className="w-full px-3 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-light mb-1">Session Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
              >
                <option value="ONLINE">Online Video Room</option>
                <option value="IN_PERSON">In-Person Meeting</option>
              </select>
            </div>
          </div>

          {mode === "IN_PERSON" && (
            <div>
              <label className="block text-xs font-medium text-muted-light mb-1">Suggested Location</label>
              <input
                type="text"
                placeholder="e.g. Blue Bottle Coffee, 315 Linden St"
                value={locationOrLink}
                onChange={(e) => setLocationOrLink(e.target.value)}
                className="w-full px-3 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-light mb-1">Introductory Message</label>
            <textarea
              rows={3}
              placeholder="Add a friendly note on what topics you would like to cover..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/discover"
            className="py-2.5 px-6 rounded-full hairline-border border text-xs font-medium hover:bg-black/5"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || !selectedMySkill || !selectedTheirSkill}
            className="py-2.5 px-8 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Swap Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewSwapPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-10 bg-black/10 rounded w-1/3" />
          <div className="h-48 bg-black/5 rounded-apple-xl" />
        </div>
      }
    >
      <NewSwapForm />
    </Suspense>
  );
}
