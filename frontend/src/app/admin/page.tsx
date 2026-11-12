"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { useAuth, User } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import {
  Shield,
  Users,
  Layers,
  Repeat,
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalSkills: number;
  totalSwaps: number;
  totalSessions: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalSkills: 0, totalSwaps: 0, totalSessions: 0 });
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");

  // New Skill form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technology & Programming");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [skillAddedSuccess, setSkillAddedSuccess] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      apiFetch<AdminStats>("/api/admin/stats").catch(() => ({ totalUsers: 0, totalSkills: 0, totalSwaps: 0, totalSessions: 0 })),
      apiFetch<User[]>("/api/admin/users").catch(() => []),
    ])
      .then(([st, u]) => {
        setStats(st);
        setUsersList(u);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await apiFetch(`/api/admin/users/${userId}/status?status=${nextStatus}`, { method: "PUT" });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
    } catch {
      // Ignore
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await apiFetch("/api/admin/skills", {
        method: "POST",
        body: JSON.stringify({
          name: newSkillName.trim(),
          category: newSkillCategory,
          description: newSkillDesc,
          slug: newSkillName.trim().toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      setNewSkillName("");
      setNewSkillDesc("");
      setSkillAddedSuccess(true);
      setTimeout(() => setSkillAddedSuccess(false), 3000);
      loadData();
    } catch {
      // Ignore
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (!searchUser) return true;
    return (
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase())
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b hairline-border">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-3">
          <Shield className="w-7 h-7 text-apple-indigo" />
          Admin & Moderation Console
        </h1>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Manage system metrics, moderate community members, and maintain the skill taxonomy.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-light">
            <span>Total Members</span>
            <Users className="w-4 h-4 text-apple-blue" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            {stats.totalUsers}
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-light">
            <span>Taxonomy Skills</span>
            <Layers className="w-4 h-4 text-apple-green" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            {stats.totalSkills}
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-light">
            <span>Swaps Initiated</span>
            <Repeat className="w-4 h-4 text-apple-orange" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            {stats.totalSwaps}
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-light">
            <span>Completed Sessions</span>
            <Calendar className="w-4 h-4 text-apple-indigo" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">
            {stats.totalSessions}
          </p>
        </div>
      </div>

      {/* Add Skill to Taxonomy */}
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
          <Plus className="w-4 h-4 text-apple-blue" />
          Add Skill to Taxonomy
        </h3>

        {skillAddedSuccess && (
          <div className="p-3 rounded-apple-md bg-apple-green/10 border border-apple-green/20 text-apple-green text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Skill added successfully to taxonomy!
          </div>
        )}

        <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Skill Name (e.g. Swift, Go, Yoga)..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="px-3.5 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-xs text-foreground-light dark:text-foreground-dark"
            required
          />

          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            className="px-3 py-2 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-xs text-foreground-light dark:text-foreground-dark"
          >
            <option value="Technology & Programming">Technology & Programming</option>
            <option value="Design & Creative">Design & Creative</option>
            <option value="Languages & Linguistics">Languages & Linguistics</option>
            <option value="Music & Audio">Music & Audio</option>
            <option value="Business & Career">Business & Career</option>
            <option value="Health & Wellness">Health & Wellness</option>
            <option value="Craft & DIY">Craft & DIY</option>
            <option value="Academic & Sciences">Academic & Sciences</option>
          </select>

          <button
            type="submit"
            className="py-2 px-4 rounded-apple-md bg-apple-blue text-white text-xs font-medium hover:bg-apple-blue/90 shadow-sm active:scale-95"
          >
            Add to Taxonomy
          </button>
        </form>
      </div>

      {/* User Moderation Table */}
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
            <Users className="w-4 h-4 text-apple-blue" />
            Member Moderation ({filteredUsers.length})
          </h3>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-light" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-full bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-xs text-foreground-light dark:text-foreground-dark w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b hairline-border text-muted-light uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Member</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-black/[0.01]">
                  <td className="py-3 px-2 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-[10px]">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground-light dark:text-foreground-dark block">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-muted-light">@{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-muted-light">{u.email}</td>
                  <td className="py-3 px-2 font-medium">{u.role}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                        u.status === "ACTIVE"
                          ? "bg-apple-green/10 text-apple-green"
                          : "bg-apple-red/10 text-apple-red"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status || "ACTIVE")}
                      className={`py-1 px-3 rounded-full text-[10px] font-semibold transition-colors ${
                        u.status === "ACTIVE"
                          ? "bg-apple-red/10 text-apple-red hover:bg-apple-red hover:text-white"
                          : "bg-apple-green/10 text-apple-green hover:bg-apple-green hover:text-white"
                      }`}
                    >
                      {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
