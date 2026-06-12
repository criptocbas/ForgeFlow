// ForgeFlow constants for Solana Blitz v5

export const MAGICBLOCK_ROUTER_RPC =
  process.env.NEXT_PUBLIC_ER_ROUTER_RPC || "https://devnet-router.magicblock.app";
export const MAGICBLOCK_ROUTER_WS =
  process.env.NEXT_PUBLIC_ER_ROUTER_WS || "wss://devnet-router.magicblock.app";

export const SOLANA_BASE_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";

export const FLASH_TRADE_PROGRAM_ID =
  "FLASH6Lo6h3iasJKWDs2F8TkW2UKf3s15C8PMGuVfgBn";

// Program ID for our flashforge program (update after real deploy)
export const FLASHFORGE_PROGRAM_ID = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";

// Common seeds
export const STRATEGY_SEED = Buffer.from("strategy");

// Hackathon links
export const HACKATHON_LINKS = {
  register: "https://luma.com/x57f72d7",
  submit: "https://luma.com/ujbohb95",
  magicblock: "https://hackathon.magicblock.app/",
  docs: "https://docs.magicblock.gg/",
  flashTradeBuild: "https://docs.flash.trade/flash-trade/flash-trade-protocol/build-on-flash",
  examples: "https://github.com/magicblock-labs/magicblock-engine-examples",
  sdk: "https://github.com/magicblock-labs/ephemeral-rollups-sdk",
  flashOrg: "https://github.com/flash-trade",
} as const;
