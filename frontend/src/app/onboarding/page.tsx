"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserSkill, AvailabilitySlot } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Globe,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  slug: string;
}

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};
const TIME_SLOTS = ["MORNING", "AFTERNOON", "EVENING"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  const [allSkills, setAllSkills] = useState<SkillItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Step 1: Teach Skills
  const [teachSkills, setTeachSkills] = useState<UserSkill[]>([]);
  // Step 2: Learn Skills
  const [learnSkills, setLearnSkills] = useState<UserSkill[]>([]);
  // Step 3: Bio, Languages, Timezone, Mode, Availability
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [langInput, setLangInput] = useState("");
  const [city, setCity] = useState("San Francisco");
  const [country, setCountry] = useState("USA");
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON" | "BOTH">("ONLINE");
  const [availability, setAvailability] = useState<Record<string, string[]>>({
    MONDAY: ["EVENING"],
    WEDNESDAY: ["EVENING"],
    SATURDAY: ["MORNING", "AFTERNOON"],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Fetch taxonomy skills
    apiFetch<SkillItem[]>("/api/skills")
      .then((data) => {
        setAllSkills(data);
        const uniqueCats = Array.from(new Set(data.map((s) => s.category)));
        setCategories(["All", ...uniqueCats]);
      })
      .catch(() => {
        // Fallback default skills if backend seeder hasn't run yet
        const defaults: SkillItem[] = [
          { id: "1", name: "Python", category: "Technology & Programming", slug: "python" },
          { id: "2", name: "Java", category: "Technology & Programming", slug: "java" },
          { id: "3", name: "TypeScript", category: "Technology & Programming", slug: "typescript" },
          { id: "4", name: "UI/UX Design", category: "Design & Creative", slug: "ui-ux-design" },
          { id: "5", name: "Figma Mastery", category: "Design & Creative", slug: "figma" },
          { id: "6", name: "Spanish Conversational", category: "Languages & Linguistics", slug: "spanish" },
          { id: "7", name: "Japanese", category: "Languages & Linguistics", slug: "japanese" },
          { id: "8", name: "Acoustic Guitar", category: "Music & Audio", slug: "acoustic-guitar" },
          { id: "9", name: "Piano & Keyboard", category: "Music & Audio", slug: "piano" },
          { id: "10", name: "Product Management", category: "Business & Career", slug: "product-management" },
        ];
        setAllSkills(defaults);
        setCategories(["All", "Technology & Programming", "Design & Creative", "Languages & Linguistics", "Music & Audio", "Business & Career"]);
      });
  }, []);

  const filteredSkills = allSkills.filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesQuery = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAddTeachSkill = (skill: SkillItem) => {
    if (teachSkills.some((ts) => ts.skillName.toLowerCase() === skill.name.toLowerCase())) return;
    setTeachSkills([
      ...teachSkills,
      {
        skillId: skill.id || skill.slug,
        skillName: skill.name,
        category: skill.category,
        type: "TEACH",
        level: "ADVANCED",
        yearsExp: 3,
        description: `Excited to mentor in ${skill.name}`,
      },
    ]);
  };

  const handleRemoveTeachSkill = (name: string) => {
    setTeachSkills(teachSkills.filter((s) => s.skillName !== name));
  };

  const handleAddLearnSkill = (skill: SkillItem) => {
    if (learnSkills.some((ls) => ls.skillName.toLowerCase() === skill.name.toLowerCase())) return;
    setLearnSkills([
      ...learnSkills,
      {
        skillId: skill.id || skill.slug,
        skillName: skill.name,
        category: skill.category,
        type: "LEARN",
        level: "BEGINNER",
        description: `Eager to learn ${skill.name} from experienced practitioners`,
      },
    ]);
  };

  const handleRemoveLearnSkill = (name: string) => {
    setLearnSkills(learnSkills.filter((s) => s.skillName !== name));
  };

  const toggleSlot = (day: string, slot: string) => {
    setAvailability((prev) => {
      const current = prev[day] || [];
      const updated = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      return { ...prev, [day]: updated };
    });
  };

  const addLanguage = () => {
    if (langInput.trim() && !languages.includes(langInput.trim())) {
      setLanguages([...languages, langInput.trim()]);
      setLangInput("");
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const handleComplete = async () => {
    if (teachSkills.length === 0) {
      setErrorMsg("Please add at least one skill you can teach.");
      setStep(1);
      return;
    }
    if (learnSkills.length === 0) {
      setErrorMsg("Please add at least one skill you want to learn.");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Update Profile (bio, languages, location)
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          bio: bio || "Passionate peer learner and mentor.",
          languages,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          location: {
            city,
            country,
            mode,
          },
        }),
      });

      // 2. Update Availability
      const availabilitySlots: AvailabilitySlot[] = Object.entries(availability)
        .filter(([_, slots]) => slots.length > 0)
        .map(([dayOfWeek, slots]) => ({ dayOfWeek, slots }));

      await apiFetch("/api/users/availability", {
        method: "PUT",
        body: JSON.stringify({ availability: availabilitySlots }),
      });

      // 3. Update Skills & Complete Onboarding
      await apiFetch("/api/users/skills", {
        method: "PUT",
        body: JSON.stringify({
          skills: [...teachSkills, ...learnSkills],
          onboardingCompleted: true,
        }),
      });

      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Step Indicator */}
      <div className="mb-10 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider">
          <span>Step {step} of 4</span>
          <span>
            {step === 1 && "What You Teach"}
            {step === 2 && "What You Want to Learn"}
            {step === 3 && "Availability & Location"}
            {step === 4 && "Review & Launch"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-apple-blue" : "bg-black/10 dark:bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-apple-md bg-apple-red/10 border border-apple-red/20 text-apple-red text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-semibold text-xs ml-4">Dismiss</button>
        </div>
      )}

      {/* STEP 1: TEACH SKILLS */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
              What skills can you teach?
            </h1>
            <p className="text-muted-light dark:text-muted-dark text-base">
              Select or search skills you are comfortable sharing with fellow peers. Pick your proficiency level.
            </p>
          </div>

          {/* Selected Teach Skills Chips */}
          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-apple-blue" />
              Your Teaching Skills ({teachSkills.length})
            </h3>

            {teachSkills.length === 0 ? (
              <p className="text-sm text-muted-light dark:text-muted-dark italic">
                No skills selected yet. Click skills below or search to add them.
              </p>
            ) : (
              <div className="space-y-3">
                {teachSkills.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border"
                  >
                    <div>
                      <span className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                        {s.skillName}
                      </span>
                      <span className="ml-2 text-xs text-muted-light dark:text-muted-dark">
                        ({s.category})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={s.level}
                        onChange={(e) => {
                          const updated = [...teachSkills];
                          updated[idx].level = e.target.value as any;
                          setTeachSkills(updated);
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-full bg-surface-light dark:bg-surface-dark hairline-border border font-medium text-foreground-light dark:text-foreground-dark focus:ring-1 focus:ring-apple-blue"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveTeachSkill(s.skillName)}
                        className="text-muted-light dark:text-muted-dark hover:text-apple-red p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Selector & Search */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
              <input
                type="text"
                placeholder="Search 100+ skills (e.g. Python, Guitar, Spanish, Figma)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-apple-lg bg-surface-light dark:bg-surface-dark hairline-border border text-sm text-foreground-light dark:text-foreground-dark placeholder-muted-light/60 dark:placeholder-muted-dark/60 shadow-sm focus-visible:ring-2 focus-visible:ring-apple-blue"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-apple-blue text-white shadow-sm"
                      : "bg-surface-light dark:bg-surface-dark hairline-border border text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Available Skills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
              {filteredSkills.map((skill) => {
                const isSelected = teachSkills.some((ts) => ts.skillName === skill.name);
                return (
                  <button
                    key={skill.id || skill.slug}
                    type="button"
                    onClick={() => (isSelected ? handleRemoveTeachSkill(skill.name) : handleAddTeachSkill(skill))}
                    className={`p-3 rounded-apple-md hairline-border border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-apple-blue/10 border-apple-blue text-apple-blue dark:text-apple-blueDark"
                        : "bg-surface-light dark:bg-surface-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-foreground-light dark:text-foreground-dark"
                    }`}
                  >
                    <span className="truncate">{skill.name}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-apple-blue" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 shrink-0 text-muted-light dark:text-muted-dark" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                if (teachSkills.length === 0) {
                  setErrorMsg("Please select at least one skill to teach.");
                  return;
                }
                setErrorMsg(null);
                setStep(2);
              }}
              className="py-3 px-6 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 flex items-center gap-2"
            >
              <span>Continue to Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: LEARN SKILLS */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
              What skills do you want to learn?
            </h1>
            <p className="text-muted-light dark:text-muted-dark text-base">
              Choose the knowledge or crafts you wish to pick up. We will match you with members eager to learn what you teach!
            </p>
          </div>

          {/* Selected Learn Skills Chips */}
          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-apple-blue" />
              Your Target Skills to Learn ({learnSkills.length})
            </h3>

            {learnSkills.length === 0 ? (
              <p className="text-sm text-muted-light dark:text-muted-dark italic">
                No skills selected yet. Pick the skills you are passionate to learn.
              </p>
            ) : (
              <div className="space-y-3">
                {learnSkills.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border"
                  >
                    <div>
                      <span className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                        {s.skillName}
                      </span>
                      <span className="ml-2 text-xs text-muted-light dark:text-muted-dark">
                        ({s.category})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={s.level}
                        onChange={(e) => {
                          const updated = [...learnSkills];
                          updated[idx].level = e.target.value as any;
                          setLearnSkills(updated);
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-full bg-surface-light dark:bg-surface-dark hairline-border border font-medium text-foreground-light dark:text-foreground-dark focus:ring-1 focus:ring-apple-blue"
                      >
                        <option value="BEGINNER">Target: Beginner</option>
                        <option value="INTERMEDIATE">Target: Intermediate</option>
                        <option value="ADVANCED">Target: Advanced</option>
                        <option value="EXPERT">Target: Expert</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveLearnSkill(s.skillName)}
                        className="text-muted-light dark:text-muted-dark hover:text-apple-red p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Search & Grid */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
              <input
                type="text"
                placeholder="Search skills to learn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-apple-lg bg-surface-light dark:bg-surface-dark hairline-border border text-sm text-foreground-light dark:text-foreground-dark placeholder-muted-light/60 dark:placeholder-muted-dark/60 shadow-sm focus-visible:ring-2 focus-visible:ring-apple-blue"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
              {filteredSkills.map((skill) => {
                const isSelected = learnSkills.some((ls) => ls.skillName === skill.name);
                return (
                  <button
                    key={skill.id || skill.slug}
                    type="button"
                    onClick={() => (isSelected ? handleRemoveLearnSkill(skill.name) : handleAddLearnSkill(skill))}
                    className={`p-3 rounded-apple-md hairline-border border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-apple-blue/10 border-apple-blue text-apple-blue dark:text-apple-blueDark"
                        : "bg-surface-light dark:bg-surface-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-foreground-light dark:text-foreground-dark"
                    }`}
                  >
                    <span className="truncate">{skill.name}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-apple-blue" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 shrink-0 text-muted-light dark:text-muted-dark" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3 px-5 rounded-full hairline-border border hover:bg-black/5 dark:hover:bg-white/10 text-foreground-light dark:text-foreground-dark font-medium text-sm transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (learnSkills.length === 0) {
                  setErrorMsg("Please select at least one skill to learn.");
                  return;
                }
                setErrorMsg(null);
                setStep(3);
              }}
              className="py-3 px-6 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 flex items-center gap-2"
            >
              <span>Continue to Availability</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: AVAILABILITY, LOCATION & PREFERENCES */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
              Availability & Preferences
            </h1>
            <p className="text-muted-light dark:text-muted-dark text-base">
              Set your general weekly schedule, languages, and whether you prefer online sessions or in-person swaps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bio & Location Card */}
            <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
                <Globe className="w-4 h-4 text-apple-blue" />
                Profile & Preferred Mode
              </h3>

              <div>
                <label className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1">
                  Bio / Learning Philosophy
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short intro about your background and what excites you about learning..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark focus-visible:ring-2 focus-visible:ring-apple-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-sm text-foreground-light dark:text-foreground-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1">
                  Exchange Mode Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ONLINE", "IN_PERSON", "BOTH"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`py-2 px-3 rounded-apple-md text-xs font-medium hairline-border border transition-all ${
                        mode === m
                          ? "bg-apple-blue text-white shadow-sm"
                          : "bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark"
                      }`}
                    >
                      {m === "IN_PERSON" ? "In Person" : m.charAt(0) + m.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1">
                  Spoken Languages
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add language..."
                    value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                    className="flex-1 px-3 py-1.5 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-xs text-foreground-light dark:text-foreground-dark"
                  />
                  <button
                    type="button"
                    onClick={addLanguage}
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
                      <button onClick={() => removeLanguage(l)} className="text-muted-light hover:text-apple-red">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Availability Schedule Grid */}
            <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
                <Calendar className="w-4 h-4 text-apple-blue" />
                Weekly Schedule Overlap
              </h3>
              <p className="text-xs text-muted-light dark:text-muted-dark">
                Tap the times of day you are generally free for a 1-hour swap session:
              </p>

              <div className="space-y-2 pt-2">
                {DAYS_OF_WEEK.map((day) => {
                  const currentSlots = availability[day] || [];
                  return (
                    <div key={day} className="flex items-center justify-between text-xs py-1 border-b hairline-border last:border-0">
                      <span className="font-medium text-foreground-light dark:text-foreground-dark w-12">
                        {DAY_LABELS[day]}
                      </span>
                      <div className="flex gap-1.5">
                        {TIME_SLOTS.map((slot) => {
                          const active = currentSlots.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => toggleSlot(day, slot)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                                active
                                  ? "bg-apple-blue text-white shadow-sm"
                                  : "bg-black/[0.03] dark:bg-white/[0.05] text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                              }`}
                            >
                              {slot.charAt(0) + slot.slice(1).toLowerCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-3 px-5 rounded-full hairline-border border hover:bg-black/5 dark:hover:bg-white/10 text-foreground-light dark:text-foreground-dark font-medium text-sm transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="py-3 px-6 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 flex items-center gap-2"
            >
              <span>Review Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: REVIEW & LAUNCH */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
              Review your SkillSwap Profile
            </h1>
            <p className="text-muted-light dark:text-muted-dark text-base">
              Everything looks primed. Confirm your skills to let our matching algorithm find your ideal skill exchange partners.
            </p>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-apple space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b hairline-border">
              <div className="w-14 h-14 rounded-full bg-apple-lightGray dark:bg-apple-darkGray flex items-center justify-center font-bold text-lg text-foreground-light dark:text-foreground-dark">
                {user?.name?.slice(0, 2).toUpperCase() || "ME"}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">{user?.name}</h3>
                <p className="text-sm text-muted-light dark:text-muted-dark">@{user?.username} • {city}, {country}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teach Side */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-apple-blue uppercase tracking-wider">You Will Teach</span>
                <div className="space-y-2">
                  {teachSkills.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-xs">
                      <span className="font-semibold text-foreground-light dark:text-foreground-dark">{s.skillName}</span>
                      <span className="ml-2 text-muted-light">({s.level})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learn Side */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-apple-green uppercase tracking-wider">You Want to Learn</span>
                <div className="space-y-2">
                  {learnSkills.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-xs">
                      <span className="font-semibold text-foreground-light dark:text-foreground-dark">{s.skillName}</span>
                      <span className="ml-2 text-muted-light">(Target: {s.level})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t hairline-border flex flex-wrap gap-4 text-xs text-muted-light dark:text-muted-dark">
              <span>Mode: <strong className="text-foreground-light dark:text-foreground-dark">{mode}</strong></span>
              <span>Languages: <strong className="text-foreground-light dark:text-foreground-dark">{languages.join(", ")}</strong></span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-3 px-5 rounded-full hairline-border border hover:bg-black/5 dark:hover:bg-white/10 text-foreground-light dark:text-foreground-dark font-medium text-sm transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleComplete}
              className="py-3 px-8 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch My Profile & Find Matches</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
