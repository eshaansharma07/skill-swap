"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Layers, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !username || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await register({ name, email, username, password });
      router.push("/onboarding");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-apple-blue text-white items-center justify-center shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
            Create your account
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Join the skill sharing economy. Teach what you excel at, master what you desire.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 shadow-apple space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 rounded-apple-md bg-apple-red/10 border border-apple-red/20 text-apple-red text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-4 py-3 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-foreground-light dark:text-foreground-dark placeholder-muted-light/60 dark:placeholder-muted-dark/60 text-sm focus-visible:ring-2 focus-visible:ring-apple-blue transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@example.com"
                className="w-full px-4 py-3 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-foreground-light dark:text-foreground-dark placeholder-muted-light/60 dark:placeholder-muted-dark/60 text-sm focus-visible:ring-2 focus-visible:ring-apple-blue transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="elena_dev"
                className="w-full px-4 py-3 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-foreground-light dark:text-foreground-dark placeholder-muted-light/60 dark:placeholder-muted-dark/60 text-sm focus-visible:ring-2 focus-visible:ring-apple-blue transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 pr-11 rounded-apple-md bg-black/[0.02] dark:bg-white/[0.04] hairline-border border text-foreground-light dark:text-foreground-dark placeholder-muted-light/60 dark:placeholder-muted-dark/60 text-sm focus-visible:ring-2 focus-visible:ring-apple-blue transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white font-medium text-sm shadow-sm transition-all hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-muted-light dark:text-muted-dark">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-apple-blue dark:text-apple-blueDark hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
