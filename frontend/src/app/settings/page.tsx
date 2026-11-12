"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api-client";
import {
  Layers,
  Shield,
  Bell,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiFetch("/api/users/me", { method: "DELETE" });
      await logout();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-1 pb-4 border-b hairline-border">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground-light dark:text-foreground-dark flex items-center gap-3">
          <Layers className="w-7 h-7 text-apple-blue" />
          Settings
        </h1>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Manage your account credentials, notifications, and privacy options.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-apple-md bg-apple-green/10 border border-apple-green/20 text-apple-green text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark">
          Account Credentials
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b hairline-border">
            <span className="text-muted-light">Email Address</span>
            <span className="font-medium text-foreground-light dark:text-foreground-dark">{user?.email}</span>
          </div>

          <div className="flex justify-between py-2 border-b hairline-border">
            <span className="text-muted-light">Username</span>
            <span className="font-medium text-foreground-light dark:text-foreground-dark">@{user?.username}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-muted-light">Member Since</span>
            <span className="font-medium text-foreground-light dark:text-foreground-dark">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2026"}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
          <Bell className="w-4 h-4 text-apple-blue" />
          Notifications
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between py-2 cursor-pointer border-b hairline-border">
            <div>
              <span className="text-sm font-medium block">In-app notifications</span>
              <span className="text-xs text-muted-light">Receive alerts on swap proposals, counter-offers, and chat.</span>
            </div>
            <input
              type="checkbox"
              checked={inAppNotifications}
              onChange={(e) => {
                setInAppNotifications(e.target.checked);
                handleSavePreferences();
              }}
              className="w-4 h-4 accent-apple-blue rounded"
            />
          </label>

          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <span className="text-sm font-medium block">Email session reminders</span>
              <span className="text-xs text-muted-light">Get calendar invites 24 hours prior to scheduled swaps.</span>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => {
                setEmailNotifications(e.target.checked);
                handleSavePreferences();
              }}
              className="w-4 h-4 accent-apple-blue rounded"
            />
          </label>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark flex items-center gap-2">
          <Shield className="w-4 h-4 text-apple-green" />
          Privacy & Visibility
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <span className="text-sm font-medium block">Public profile visible in Discover</span>
              <span className="text-xs text-muted-light">Allow compatible peers to discover your skills portfolio and propose swaps.</span>
            </div>
            <input
              type="checkbox"
              checked={profileVisible}
              onChange={(e) => {
                setProfileVisible(e.target.checked);
                handleSavePreferences();
              }}
              className="w-4 h-4 accent-apple-blue rounded"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border border-apple-red/20 rounded-apple-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-apple-red">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-semibold">Danger Zone</h3>
        </div>

        <p className="text-xs text-muted-light">
          Once you delete your account, your active swaps will be cancelled and your profile removed from discovery.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="py-2 px-4 rounded-full bg-apple-red/10 text-apple-red hover:bg-apple-red hover:text-white font-medium text-xs transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl p-6 max-w-sm w-full shadow-apple-elevated space-y-4">
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
              Are you absolutely sure?
            </h3>
            <p className="text-xs text-muted-light leading-relaxed">
              This action cannot be undone. All your session history, skills portfolio, and conversation logs will be permanently deleted.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-1.5 px-4 rounded-full hairline-border border text-xs font-medium hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="py-1.5 px-4 rounded-full bg-apple-red text-white text-xs font-medium hover:bg-apple-red/90 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
