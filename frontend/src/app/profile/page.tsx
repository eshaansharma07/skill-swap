"use client";

import React, { useState, useEffect } from "react";
import { useAuth, UserSkill, AvailabilitySlot } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";
import {
  User as UserIcon,
  GraduationCap,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Globe,
  MapPin,
  Clock,
  Star,
} from "lucide-react";

export default function MyProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON" | "BOTH">("ONLINE");
  const [languages, setLanguages] = useState<string[]>([]);
  const [langInput, setLangInput] = useState("");

  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technology & Programming");
  const [newSkillType, setNewSkillType] = useState<"TEACH" | "LEARN">("TEACH");
  const [newSkillLevel, setNewSkillLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT">("INTERMEDIATE");

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setCity(user.location?.city || "");
      setCountry(user.location?.country || "");
      setMode(user.location?.mode || "ONLINE");
      setLanguages(user.languages || ["English"]);
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name,
          bio,
          languages,
          location: {
            city,
            country,
            mode,
          },
        }),
      });

      await apiFetch("/api/users/skills", {
        method: "PUT",
        body: JSON.stringify({
          skills,
        }),
      });

      await refreshUser();
      setSuccessMsg("Profile and skills updated successfully! Matches recalculated.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        skillId: newSkillName.toLowerCase().replace(/\s+/g, "-"),
        skillName: newSkillName.trim(),
        category: newSkillCategory,
        type: newSkillType,
        level: newSkillLevel,
        yearsExp: 2,
        description: `Experienced in ${newSkillName.trim()}`,
      },
    ]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const addLang = () => {
    if (langInput.trim() && !languages.includes(langInput.trim())) {
      setLanguages([...languages, langInput.trim()]);
      setLangInput("");
    }
  };

  const removeLang = (l: string) => {
    setLanguages(languages.filter((x) => x !== l));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b hairline-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-3">
            <UserIcon className="w-7 h-7 text-apple-blue" />
            My Profile & Skills
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Manage your personal bio, teaching specialties, and desired learning topics.
          </p>
        </div>

        {user?.reputation && (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-apple-orange/10 text-apple-orange text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-apple-orange" />
            <span>{user.reputation.ratingAverage?.toFixed(1) || "5.0"} ★</span>
            <span className="text-muted-light">({user.reputation.sessionsCompleted} sessions)</span>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-apple-md bg-apple-green/10 border border-apple-green/20 text-apple-green text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-apple-md bg-apple-red/10 border border-apple-red/20 text-apple-red text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Personal Details Card */}
        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
            <Globe className="w-4 h-4 text-apple-blue" />
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-light mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-light mb-1.5">Username (Read-only)</label>
              <input
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-apple-md bg-black/[0.05] dark:bg-white/[0.08] text-sm text-muted-light cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-light mb-1.5">Bio & Learning Philosophy</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Introduce yourself and your goals..."
              className="w-full px-3.5 py-2.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-light mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-light mb-1.5">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-light mb-1.5">Preferred Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
              >
                <option value="ONLINE">Online Video</option>
                <option value="IN_PERSON">In-Person Only</option>
                <option value="BOTH">Both (Online / In-Person)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-light mb-1.5">Spoken Languages</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add language..."
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLang())}
                className="flex-1 px-3 py-1.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-xs text-foreground-light dark:text-foreground-dark"
              />
              <button
                type="button"
                onClick={addLang}
                className="px-3 py-1.5 rounded-apple-md bg-black/5 dark:bg-white/10 text-xs font-medium hover:bg-black/10"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-black/[0.03] dark:bg-white/[0.05] hairline-border border"
                >
                  {l}
                  <button type="button" onClick={() => removeLang(l)} className="text-muted-light hover:text-apple-red">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Management Card */}
        <div id="skills" className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b hairline-border">
            <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-apple-blue" />
              Manage Skills Portfolio ({skills.length})
            </h3>
            <span className="text-xs text-muted-light">Used by matching engine</span>
          </div>

          {/* Add Skill Row */}
          <div className="p-4 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-light block">
              Add New Skill
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Skill name (e.g. Python, Salsa, React)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="sm:col-span-2 px-3 py-1.5 rounded-apple-md bg-surface-light dark:bg-surface-dark hairline-border border text-xs text-foreground-light dark:text-foreground-dark"
              />

              <select
                value={newSkillType}
                onChange={(e) => setNewSkillType(e.target.value as any)}
                className="px-3 py-1.5 rounded-apple-md bg-surface-light dark:bg-surface-dark hairline-border border text-xs text-foreground-light dark:text-foreground-dark"
              >
                <option value="TEACH">I can Teach</option>
                <option value="LEARN">I want to Learn</option>
              </select>

              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as any)}
                className="px-3 py-1.5 rounded-apple-md bg-surface-light dark:bg-surface-dark hairline-border border text-xs text-foreground-light dark:text-foreground-dark"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddSkill}
              className="py-1.5 px-4 rounded-full bg-apple-blue text-white text-xs font-medium hover:bg-apple-blue/90 shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Portfolio</span>
            </button>
          </div>

          {/* Current Skills List */}
          <div className="space-y-2">
            {skills.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-apple-md bg-surface-light dark:bg-surface-dark hairline-border border text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                      s.type === "TEACH"
                        ? "bg-apple-blue/10 text-apple-blue"
                        : "bg-apple-green/10 text-apple-green"
                    }`}
                  >
                    {s.type}
                  </span>
                  <span className="font-semibold text-foreground-light dark:text-foreground-dark">{s.skillName}</span>
                  <span className="text-muted-light">({s.level})</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="text-muted-light hover:text-apple-red p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-8 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
