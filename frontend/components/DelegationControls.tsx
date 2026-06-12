"use client";

import React from "react";
import { Zap, Play } from "lucide-react";

interface DelegationControlsProps {
  isDelegated: boolean;
  isLoading: boolean;
  connected: boolean;
  onDelegate: () => void;
  onFastUpdate: () => void;
  onCommit: () => void;
}

/**
 * Controls for the core MagicBlock + FlashTrade flow.
 * Clear visual states and professional button hierarchy.
 * The three-step lifecycle (Delegate → Fast ER → Commit) is explicit here.
 */
export function DelegationControls({
  isDelegated,
  isLoading,
  connected,
  onDelegate,
  onFastUpdate,
  onCommit,
}: DelegationControlsProps) {
  if (!connected) {
    return (
      <div className="py-8 text-center border border-dashed border-white/15 rounded-2xl">
        <p className="text-[#a1a1aa] mb-4">Connect a wallet to create &amp; delegate a strategy account</p>
        {/* WalletMultiButton is rendered in parent for now */}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={onDelegate}
        disabled={isLoading || isDelegated}
        className="btn-primary flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isLoading ? "Building tx..." : isDelegated ? "DELEGATED TO ER" : "DELEGATE STRATEGY TO EPHEMERAL ROLLUP"}
        <Zap className="w-4 h-4" />
      </button>

      <button
        onClick={onFastUpdate}
        disabled={!isDelegated || isLoading}
        className="btn-secondary flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        FAST UPDATE IN ER <Play className="w-4 h-4" />
      </button>

      <button
        onClick={onCommit}
        disabled={!isDelegated}
        className="btn-secondary px-6 h-12 rounded-2xl flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        COMMIT + UNDELEGATE
      </button>
    </div>
  );
}
