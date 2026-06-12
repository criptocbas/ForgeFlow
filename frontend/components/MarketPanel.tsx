"use client";

import React from "react";

export interface Market {
  symbol: string;
  price: string;
  change: string;
  volume: string;
  oi?: string;
  updated?: number;
}

interface MarketPanelProps {
  markets: Market[];
  onRefresh: () => void;
  isLoading?: boolean;
}

/**
 * Isolated market display component.
 * Clean separation makes it trivial to swap mock data for real FlashTrade SDK/WS later.
 * Professional trading terminal feel with tabular numbers and subtle live indicators.
 */
export function MarketPanel({ markets, onRefresh, isLoading }: MarketPanelProps) {
  return (
    <div className="trading-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-title">FlashTrade • Live Markets</div>
          <div className="text-xs text-[#a1a1aa] mt-0.5">
            Real data via SDK / WS (demo data for now)
          </div>
        </div>
        <div className="text-[10px] px-2 py-1 bg-emerald-950 text-emerald-400 rounded">
          Powered by FlashTrade
        </div>
      </div>

      <div className="space-y-3">
        {markets.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-black/30 rounded-2xl px-4 py-3 text-sm"
          >
            <div className="font-medium">{m.symbol}</div>
            <div className="font-mono tabular-nums">{m.price}</div>
            <div className={m.change.startsWith("+") ? "text-[#22c55e]" : "text-[#ef4444]"}>
              {m.change}
            </div>
            <div className="text-[#a1a1aa] tabular-nums text-xs hidden sm:block">
              Vol {m.volume}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="mt-3 text-xs text-[#22c55e] hover:underline flex items-center gap-1 disabled:opacity-50"
      >
        Refresh markets (demo) ↻
      </button>

      <div className="mt-1 text-[11px] text-[#a1a1aa]">
        Next: Replace with <span className="code">@flash-trade/flash-trade-sdk</span> + onchain reads from{" "}
        <span className="code">FLASH6Lo...</span>. Data shape is isolated for clean swap.
      </div>
    </div>
  );
}
