/**
 * ForgeFlow - Pure Strategy Simulation (no network, no keys, VPS friendly)
 *
 * This script lets you validate the core *logic* of a strategy on the terminal
 * without any Solana/MagicBlock dependencies.
 *
 * Perfect for:
 * - Quick iteration on risk/copy math on the VPS
 * - Generating realistic examples for your demo / judges
 * - Unit-test style thinking before wiring real on-chain / FlashTrade calls
 *
 * Run: npx tsx scripts/simulate-strategy.ts
 */

interface StrategyParams {
  copyPercentage: number; // 0-200
  maxLeverage: number;
  autoSlBps: number; // stop loss in basis points
}

interface MarketSignal {
  symbol: string;
  price: number;
  change24h: number;
}

interface PositionState {
  symbol: string;
  size: number;
  entryPrice: number;
  unrealizedPnl: number;
}

function simulateMirror(
  leaderTradeSize: number,
  params: StrategyParams,
  currentPosition?: PositionState
): { newSize: number; action: string; reason: string } {
  const targetSize = (leaderTradeSize * params.copyPercentage) / 100;

  if (!currentPosition) {
    return {
      newSize: Math.min(targetSize, leaderTradeSize * (params.maxLeverage / 10)), // rough cap
      action: "OPEN",
      reason: `Copying ${params.copyPercentage}% of leader size`,
    };
  }

  const drawdown = (currentPosition.entryPrice - currentPosition.entryPrice * 1.02) / currentPosition.entryPrice; // fake drawdown example
  if (Math.abs(drawdown) * 10000 > params.autoSlBps) {
    return {
      newSize: 0,
      action: "CLOSE",
      reason: `Auto SL triggered at ${params.autoSlBps}bps`,
    };
  }

  return {
    newSize: targetSize,
    action: "ADJUST",
    reason: "Following leader within risk params",
  };
}

function runSimulation() {
  console.log("=== ForgeFlow Pure Strategy Simulation ===\n");

  const params: StrategyParams = {
    copyPercentage: 75,
    maxLeverage: 20,
    autoSlBps: 800,
  };

  console.log("Strategy params:", params);

  const leaderTrade = 10; // 10 SOL equivalent
  const signal: MarketSignal = { symbol: "SOL-PERP", price: 142.5, change24h: 2.1 };

  console.log("\nLeader just opened:", leaderTrade, signal.symbol);

  const result1 = simulateMirror(leaderTrade, params);
  console.log("Our action:", result1);

  // Simulate some time passing + price move that would trigger SL
  const badPosition: PositionState = {
    symbol: "SOL-PERP",
    size: 7.5,
    entryPrice: 150,
    unrealizedPnl: -12.3,
  };

  console.log("\nCurrent position with drawdown:");
  const result2 = simulateMirror(leaderTrade, params, badPosition);
  console.log("Our action:", result2);

  console.log("\n=== End simulation ===");
  console.log("This logic lives in the 'brain' that can run inside an Ephemeral Rollup for speed.");
}

runSimulation();
