/**
 * Pure unit tests for strategy decision logic.
 * These run without any blockchain, wallet, or browser.
 * Great for VPS validation and demonstrating clean, testable code.
 *
 * Run (once on laptop or with tsx + vitest):
 *   npm run test
 */

import { describe, it, expect } from 'vitest';

// Simplified version of the logic from scripts/simulate-strategy.ts and advance-simulation.ts
// In real code you would import from a shared pure module.

interface StrategyParams {
  copyPercentage: number;
  maxLeverage: number;
  autoSlBps: number;
}

function decideAction(
  currentPrice: number,
  entryPrice: number | null,
  params: StrategyParams,
  leaderSize: number
) {
  const targetSize = (leaderSize * params.copyPercentage) / 100;

  if (entryPrice === null) {
    return {
      action: 'OPEN',
      size: Math.min(targetSize, leaderSize * (params.maxLeverage / 5)),
    };
  }

  const moveBps = ((currentPrice - entryPrice) / entryPrice) * 10000;

  if (Math.abs(moveBps) > params.autoSlBps) {
    return { action: 'CLOSE', size: 0 };
  }

  return { action: 'ADJUST', size: targetSize };
}

describe('ForgeFlow Strategy Decision Logic', () => {
  const params: StrategyParams = {
    copyPercentage: 75,
    maxLeverage: 20,
    autoSlBps: 500,
  };

  it('opens a new position when none exists', () => {
    const result = decideAction(142.5, null, params, 10);
    expect(result.action).toBe('OPEN');
    expect(result.size).toBeGreaterThan(0);
  });

  it('triggers auto SL on large adverse move', () => {
    const result = decideAction(135.0, 142.5, params, 10); // ~5.26% drop = 526 bps
    expect(result.action).toBe('CLOSE');
    expect(result.size).toBe(0);
  });

  it('adjusts within risk limits on small moves', () => {
    const result = decideAction(143.1, 142.5, params, 10);
    expect(result.action).toBe('ADJUST');
    expect(result.size).toBeGreaterThan(0);
  });
});
