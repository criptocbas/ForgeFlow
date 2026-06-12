/**
 * ForgeFlow - Advanced Pure Strategy Simulation (VPS / Headless)
 *
 * This script simulates the *value proposition* of using MagicBlock Ephemeral Rollups
 * vs vanilla Solana for real-time perps strategy execution on FlashTrade.
 *
 * It is 100% pure (no network, no keys, no external deps beyond Node).
 * Perfect for:
 * - Generating realistic numbers and examples for your hackathon demo video / slides
 * - Proving the "sub-50ms reactive execution" and "CEX-like feel" narrative in code
 * - Quick iteration on strategy logic before wiring real on-chain + FlashTrade calls
 *
 * Run on VPS:
 *   npx tsx scripts/advance-simulation.ts
 *
 * Research-backed:
 * - ER enables sub-50ms execution inside the rollup (MagicBlock docs + partnership blog)
 * - FlashTrade already uses ER for its own CEX-like UX
 * - Winners in previous Blitzes succeeded by deeply integrating delegation into loops
 *   and showing clear before/after speed/privacy benefits.
 */

interface StrategyParams {
  copyPercentage: number; // e.g. 75
  maxLeverage: number;
  autoSlBps: number;
}

interface MarketUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

interface SimulatedPosition {
  symbol: string;
  size: number;
  entryPrice: number;
  lastUpdateSlot: number;
}

function simulateBaseSolanaLatency(): number {
  // Realistic devnet/mainnet feel: 400-1200ms per tx + confirmation under load
  return 650 + Math.random() * 550;
}

function simulateERLatency(): number {
  // Sub-50ms inside the rollup (MagicBlock claim + FlashTrade partnership results)
  return 8 + Math.random() * 35;
}

function decideAction(
  currentPrice: number,
  position: SimulatedPosition | null,
  params: StrategyParams,
  leaderSize: number
): { action: string; newSize: number; reason: string; latencyMs: number } {
  const targetSize = (leaderSize * params.copyPercentage) / 100;

  if (!position) {
    const latency = simulateERLatency(); // Decision + execution in ER
    return {
      action: "OPEN",
      newSize: Math.min(targetSize, leaderSize * (params.maxLeverage / 5)),
      reason: `Copying ${params.copyPercentage}% of leader (ER decision)`,
      latencyMs: latency,
    };
  }

  // Simulate price move that could trigger risk rule
  const priceMoveBps = ((currentPrice - position.entryPrice) / position.entryPrice) * 10000;

  if (Math.abs(priceMoveBps) > params.autoSlBps) {
    const latency = simulateERLatency();
    return {
      action: "CLOSE",
      newSize: 0,
      reason: `Auto SL triggered at ${params.autoSlBps}bps (price moved ${priceMoveBps.toFixed(0)}bps)`,
      latencyMs: latency,
    };
  }

  // Normal adjustment - fast because of ER
  const latency = simulateERLatency();
  return {
    action: "ADJUST",
    newSize: targetSize,
    reason: "Following leader within risk params (fast ER update)",
    latencyMs: latency,
  };
}

function runAdvancedSimulation() {
  console.log("=== ForgeFlow Advanced ER vs Base Simulation ===\n");

  const params: StrategyParams = {
    copyPercentage: 80,
    maxLeverage: 25,
    autoSlBps: 650,
  };

  console.log("Strategy params:", params);
  console.log("Leader opens position of size 12 SOL-PERP\n");

  let position: SimulatedPosition | null = null;
  const updates: MarketUpdate[] = [
    { symbol: "SOL-PERP", price: 143.2, timestamp: Date.now() },
    { symbol: "SOL-PERP", price: 141.8, timestamp: Date.now() + 1200 },
    { symbol: "SOL-PERP", price: 140.1, timestamp: Date.now() + 2400 },
    { symbol: "SOL-PERP", price: 138.5, timestamp: Date.now() + 3600 },
  ];

  let totalBaseLatency = 0;
  let totalERLatency = 0;
  let actions = 0;

  updates.forEach((update, index) => {
    console.log(`Market tick #${index + 1} @ ${update.price}`);

    const decision = decideAction(update.price, position, params, 12);

    // Simulate what the same decision would cost on vanilla Solana
    const baseLatency = simulateBaseSolanaLatency();

    console.log(`  Action: ${decision.action} | Size: ${decision.newSize.toFixed(2)} | Reason: ${decision.reason}`);
    console.log(`  ER latency (this decision): ${decision.latencyMs.toFixed(0)}ms`);
    console.log(`  Vanilla Solana latency (same decision): ~${baseLatency.toFixed(0)}ms`);
    console.log("");

    totalBaseLatency += baseLatency;
    totalERLatency += decision.latencyMs;
    actions++;

    if (decision.newSize === 0) {
      position = null;
    } else {
      position = {
        symbol: update.symbol,
        size: decision.newSize,
        entryPrice: update.price,
        lastUpdateSlot: index,
      };
    }
  });

  console.log("=== Results Summary ===");
  console.log(`Total actions: ${actions}`);
  console.log(`Cumulative vanilla Solana latency: ${totalBaseLatency.toFixed(0)}ms (~${(totalBaseLatency / 1000).toFixed(1)}s)`);
  console.log(`Cumulative ER latency: ${totalERLatency.toFixed(0)}ms`);
  console.log(`Speedup: ${(totalBaseLatency / totalERLatency).toFixed(1)}x faster with MagicBlock`);
  console.log("\nThis is the core UX advantage that wins +50% FlashTrade prize tracks:");
  console.log("- Real-time risk management and copy trading that feels CEX-like");
  console.log("- Still fully onchain with atomic settlement to FlashTrade liquidity");
  console.log("- Optional PER for private strategies (no front-running your own signals)");

  console.log("\n=== End simulation ===");
}

runAdvancedSimulation();
