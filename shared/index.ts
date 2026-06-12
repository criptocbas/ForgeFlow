// ForgeFlow shared types & utilities
// Use this workspace for types that both frontend and any agents/bots need.

export interface StrategyParams {
  copyPercentage: number;
  maxLeverage: number;
  autoSlBps: number;
}

export interface FlashTradeMarket {
  symbol: string;
  price: string;
  change24h: string;
  volume: string;
}
