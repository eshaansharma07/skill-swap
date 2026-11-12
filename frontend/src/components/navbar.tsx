"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./theme-toggle";
import {
  Compass,
  Sparkles,
  Repeat,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Bell,
  Menu,
  X,
  Shield,
  Layers,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/matches", label: "Matches", icon: Sparkles },
    { href: "/swaps", label: "Swaps", icon: Repeat },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <>
      {/* Top Navigation Bar (Desktop & Mobile Header) */}
      <header className="sticky top-0 z-40 w-full nav-blur hairline-border border-b transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center gap-2 group transition-transform active:scale-95 duration-150"
            >
              <div className="w-8 h-8 rounded-xl bg-apple-blue flex items-center justify-center text-white font-semibold shadow-sm group-hover:shadow transition-shadow">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-foreground-light dark:text-foreground-dark">
                SkillSwap
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-black/5 dark:bg-white/10 text-apple-blue dark:text-apple-blueDark font-semibold"
                          : "text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Notifications Bell */}
                <Link
                  href="/notifications"
                  aria-label="Notifications"
                  className="relative p-2 rounded-full text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-apple-blue/20 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-apple-lightGray dark:bg-apple-darkGray text-foreground-light dark:text-foreground-dark flex items-center justify-center text-xs font-semibold hairline-border border">
                      {getInitials(user?.name)}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-apple-lg sheet-blur hairline-border border shadow-apple-elevated py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b hairline-border">
                        <p className="text-sm font-semibold truncate text-foreground-light dark:text-foreground-dark">
                          {user?.name}
                        </p>
                        <p className="text-xs text-muted-light dark:text-muted-dark truncate">
                          @{user?.username}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-muted-light dark:text-muted-dark" />
                        My Profile
                      </Link>

                      {user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-apple-indigo" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-muted-light dark:text-muted-dark" />
                        Settings
                      </Link>

                      <div className="border-t hairline-border mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-apple-red hover:bg-apple-red/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm font-medium text-foreground-light dark:text-foreground-dark hover:text-apple-blue transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-apple-blue hover:bg-apple-blue/90 text-white shadow-sm transition-all hover:shadow active:scale-95 duration-150"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 sheet-blur hairline-border border-t px-2 py-2 flex items-center justify-around">
          {[
            { href: "/discover", label: "Discover", icon: Compass },
            { href: "/matches", label: "Matches", icon: Sparkles },
            { href: "/swaps", label: "Swaps", icon: Repeat },
            { href: "/messages", label: "Messages", icon: MessageSquare },
            { href: "/profile", label: "Profile", icon: UserIcon },
          ].map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-apple-blue dark:text-apple-blueDark font-medium"
                    : "text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
