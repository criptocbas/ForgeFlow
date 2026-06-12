"use client";

import React from "react";

interface StrategyFormProps {
  strategyId: number;
  copyPct: number;
  maxLev: number;
  slBps: number;
  onStrategyIdChange: (v: number) => void;
  onCopyPctChange: (v: number) => void;
  onMaxLevChange: (v: number) => void;
  onSlBpsChange: (v: number) => void;
  disabled?: boolean;
}

/**
 * Pure form component for strategy parameters.
 * Good validation boundaries and clear labels.
 * Easy to enhance with sliders, tooltips, or advanced risk controls later.
 */
export function StrategyForm({
  strategyId,
  copyPct,
  maxLev,
  slBps,
  onStrategyIdChange,
  onCopyPctChange,
  onMaxLevChange,
  onSlBpsChange,
  disabled,
}: StrategyFormProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label className="text-xs text-[#a1a1aa] block mb-1">Strategy ID</label>
        <input
          type="number"
          value={strategyId}
          onChange={(e) => onStrategyIdChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm disabled:opacity-50"
        />
      </div>
      <div>
        <label className="text-xs text-[#a1a1aa] block mb-1">Copy % (1-200)</label>
        <input
          type="number"
          min={1}
          max={200}
          value={copyPct}
          onChange={(e) => onCopyPctChange(Math.max(1, Math.min(200, Number(e.target.value))))}
          disabled={disabled}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm disabled:opacity-50"
        />
      </div>
      <div>
        <label className="text-xs text-[#a1a1aa] block mb-1">Max Leverage (x)</label>
        <input
          type="number"
          min={1}
          max={100}
          value={maxLev}
          onChange={(e) => onMaxLevChange(Math.max(1, Math.min(100, Number(e.target.value))))}
          disabled={disabled}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm disabled:opacity-50"
        />
      </div>
      <div>
        <label className="text-xs text-[#a1a1aa] block mb-1">Auto SL (bps)</label>
        <input
          type="number"
          min={0}
          max={5000}
          value={slBps}
          onChange={(e) => onSlBpsChange(Math.max(0, Math.min(5000, Number(e.target.value))))}
          disabled={disabled}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm disabled:opacity-50"
        />
      </div>
    </div>
  );
}
