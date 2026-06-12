/**
 * ForgeFlow - FlashTrade Integration Layer
 *
 * Clean, typed abstraction over FlashTrade's data and execution surface.
 *
 * Goals for code quality & professionalism:
 * - Isolate all FlashTrade-specific logic so the rest of the app (especially UI) doesn't care about SDK details.
 * - Ready for official @flash-trade/flash-trade-sdk (Rust + TS) + their MCP / WS.
 * - Provides both read (markets, positions, LP) and write paths (open position, adjust risk) hooks.
 * - Easy to test in isolation or with mocks.
 *
 * Current state: Interface + realistic mocks. 
 * When integrating for real (on laptop), replace the fetch functions with SDK calls.
 * See https://docs.flash.trade/ and the flash-trade GitHub org for the exact SDK.
 */

import { FLASH_TRADE_PROGRAM_ID } from "./constants";

export interface FlashTradeMarket {
  symbol: string;
  price: string;
  change24h: string;
  volume24h: string;
  openInterest: string;
}

export interface FlashTradePosition {
  symbol: string;
  size: string;
  entryPrice: string;
  unrealizedPnl: string;
  leverage: number;
}

export interface FlashTradeLPStats {
  totalLiquidity: string;
  yourShare?: string;
  earnedFees24h: string;
}

export interface OpenPositionParams {
  symbol: string;
  size: number; // in base asset units or USD notional
  isLong: boolean;
  leverage: number;
  // Additional risk params from our delegated strategy can flow here
}

/**
 * Fetch current markets.
 * In production: use FlashTrade SDK REST/WS or direct on-chain reads against the FLASH program + Pyth oracles.
 */
export async function fetchMarkets(): Promise<FlashTradeMarket[]> {
  // Placeholder that feels live. Replace with real call.
  // Example future implementation:
  // const sdk = new FlashTradeSDK({ rpc: ... });
  // return sdk.getMarkets();
  return [
    { symbol: "SOL-PERP", price: "142.87", change24h: "+2.4%", volume24h: "$48.2M", openInterest: "$112M" },
    { symbol: "BTC-PERP", price: "67,420", change24h: "-1.1%", volume24h: "$129M", openInterest: "$341M" },
    { symbol: "ETH-PERP", price: "2,412", change24h: "+0.8%", volume24h: "$67M", openInterest: "$89M" },
  ];
}

/**
 * Fetch user's positions on FlashTrade (on-chain or via their indexer/SDK).
 */
export async function fetchPositions(wallet: string): Promise<FlashTradePosition[]> {
  // TODO: real implementation using the SDK or direct account deserialization.
  if (!wallet) return [];
  return []; // Return empty for scaffold; real version will populate.
}

/**
 * Fetch LP / yield stats (very relevant for one of the highlighted hackathon use cases).
 */
export async function fetchLPStats(wallet?: string): Promise<FlashTradeLPStats> {
  return {
    totalLiquidity: "$XXXM",
    yourShare: wallet ? "$12.4k" : undefined,
    earnedFees24h: "$87.30",
  };
}

/**
 * Submit an order / position adjustment on FlashTrade.
 * This would be called after our delegated strategy logic decides "what to do".
 *
 * For the ER fast path: the decision happens in the rollup (fast), the actual tx to FlashTrade program
 * can be built client-side or (advanced) triggered via Magic Actions from inside the ER.
 */
export async function openPosition(params: OpenPositionParams, wallet: string): Promise<string> {
  console.log("[FlashTrade] Would open position", params, "for wallet", wallet);
  // In real code: build the instruction using the FlashTrade SDK / IDL and send via the user's provider.
  // Return the signature.
  return "FLASH_TRADE_SIG_" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export const FLASH_TRADE_PROGRAM = FLASH_TRADE_PROGRAM_ID;
