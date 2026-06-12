"use client";

import React from "react";

interface StatusBannerProps {
  message: string | null;
  onDismiss: () => void;
}

/**
 * Professional, non-intrusive feedback banner.
 * Replaces alert() for a much better UX.
 * Easy to style or replace with a real toast lib (sonner, etc.) later.
 */
export function StatusBanner({ message, onDismiss }: StatusBannerProps) {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 rounded-2xl border border-white/15 bg-black/40 text-sm flex items-start gap-3">
      <div className="mt-0.5">ℹ️</div>
      <div className="flex-1 whitespace-pre-wrap">{message}</div>
      <button
        onClick={onDismiss}
        className="text-[#a1a1aa] hover:text-white text-xs self-start"
        aria-label="Dismiss message"
      >
        dismiss
      </button>
    </div>
  );
}
