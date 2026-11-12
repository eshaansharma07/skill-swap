"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  Repeat,
  MessageSquare,
  Calendar,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, any>;
  readAt?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = () => {
    setIsLoading(true);
    apiFetch<Notification[]>("/api/notifications")
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
    } catch {
      // Ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SWAP_REQUEST":
        return <Repeat className="w-5 h-5 text-apple-blue" />;
      case "SWAP_ACCEPTED":
        return <CheckCircle2 className="w-5 h-5 text-apple-green" />;
      case "SWAP_DECLINED":
        return <XCircle className="w-5 h-5 text-apple-red" />;
      case "NEW_MESSAGE":
        return <MessageSquare className="w-5 h-5 text-apple-indigo" />;
      case "SESSION_REMINDER":
        return <Calendar className="w-5 h-5 text-apple-orange" />;
      case "REVIEW_RECEIVED":
        return <Star className="w-5 h-5 text-apple-orange" />;
      default:
        return <Bell className="w-5 h-5 text-apple-blue" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-3">
            <Bell className="w-7 h-7 text-apple-blue" />
            Notifications
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Stay updated on swap requests, messages, and upcoming sessions.
          </p>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <button
            onClick={handleMarkAllRead}
            className="py-1.5 px-3.5 rounded-full hairline-border border text-xs font-medium text-foreground-light dark:text-foreground-dark hover:bg-black/5 flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-apple-blue" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-black/5 rounded-apple-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-8 space-y-3 shadow-sm">
          <Bell className="w-8 h-8 text-muted-light mx-auto" />
          <h3 className="font-semibold text-base">You&apos;re all caught up!</h3>
          <p className="text-xs text-muted-light">No new notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isUnread = !n.readAt;

            return (
              <div
                key={n.id}
                className={`p-4 rounded-apple-xl hairline-border border shadow-sm transition-all flex items-start gap-4 ${
                  isUnread
                    ? "bg-apple-blue/[0.04] border-apple-blue/30"
                    : "bg-surface-light dark:bg-surface-dark"
                }`}
              >
                <div className="p-2.5 rounded-full bg-surface-light dark:bg-surface-dark hairline-border border shadow-sm shrink-0">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-muted-light shrink-0">
                      {formatDate(n.createdAt)} • {formatTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
                    {n.message}
                  </p>

                  {/* Context Links */}
                  <div className="pt-2 flex items-center gap-3">
                    {n.type.startsWith("SWAP") && (
                      <Link
                        href="/swaps"
                        className="text-xs font-semibold text-apple-blue hover:underline"
                      >
                        View Swap Details →
                      </Link>
                    )}
                    {n.type === "NEW_MESSAGE" && (
                      <Link
                        href="/messages"
                        className="text-xs font-semibold text-apple-blue hover:underline"
                      >
                        Open Conversation →
                      </Link>
                    )}
                    {n.type.startsWith("SESSION") && (
                      <Link
                        href="/swaps"
                        className="text-xs font-semibold text-apple-blue hover:underline"
                      >
                        View Session Calendar →
                      </Link>
                    )}
                  </div>
                </div>

                {isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-apple-blue shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
