# ForgeFlow - Grok / AI Agent Context

**Project**: ForgeFlow  
**Repo**: https://github.com/criptocbas/ForgeFlow  
**Hackathon**: Solana Blitz v5 (June 12-14, 2026) — Trading track  
**Primary Goal**: Win (or place highly) by building a professional real-time perps strategy automation / copy-trading product on top of FlashTrade, deeply leveraging MagicBlock Ephemeral Rollups (ER) for sub-50ms execution and optional Private ER (PER) for privacy/MEV protection. Target the +50% FlashTrade partner prize boost.

## Core Idea (Why This Wins)
- Vanilla Solana is too slow/expensive/public for sophisticated trading UX.
- **FlashTrade** provides the live perps DEX (pool-to-peer, zero slippage, broad assets, high leverage). Build *on top* of their real liquidity and data using their SDKs/APIs.
- **MagicBlock ER** provides the execution layer: delegate StrategyConfig PDAs to a fast SVM runtime. Run reactive logic (trailing stops, copy mirroring, risk engines, auto strategies) at sub-50ms with low cost. Commit atomically back to Solana L1 for FlashTrade settlement.
- **PER (TEE)** option for hidden strategies (no front-running your own signals or copy trades).
- This matches exactly what MagicBlock and FlashTrade highlighted for the hackathon (automated strategies, copy trading, LP dashboards, agentic features).

See full details in `README.md` and `docs/ARCHITECTURE.md`.

## Current State (as of latest commits)
- Professional monorepo (root + `programs/flashforge` + `frontend` + `shared` + `scripts` + `docs`).
- **On-chain**: `programs/flashforge` (Anchor) with `StrategyConfig` PDA, full delegation support via `ephemeral-rollups-sdk` (delegate, update_params, record_execution, commit, execute_strategy stub). Good comments and structure.
- **Frontend**: Next.js 16 + wallet adapter + MagicBlock TS SDK. Clean component architecture (`components/StrategyForm.tsx`, `MarketPanel.tsx`, `DelegationControls.tsx`, `StatusBanner.tsx`). Real connection handling (base vs Magic Router/ER). In-UI feedback (no alerts). Dynamic mock markets ready for real FlashTrade data.
- **Libs**:
  - `frontend/lib/delegation.ts`: Production-style helpers (`sendDelegateTransaction`, `sendUndelegateTransaction`, `sendFastStrategyUpdate`, `isAccountDelegated`, typed errors).
  - `frontend/lib/flashTrade.ts`: Clean abstraction with interfaces, mock generators (`generateMockMarkets`), and explicit guide for wiring the real SDK.
- **Scripts** (VPS/headless friendly, pure where possible):
  - `scripts/test-magicblock-flow.ts` — exercises connections, PDAs, blockhash timing (base vs ER).
  - `scripts/simulate-strategy.ts` — basic pure logic.
  - `scripts/advance-simulation.ts` — advanced pure simulation showing ER speed advantage vs vanilla Solana (great for demo narrative and judges).
- **Docs & Professionalism**:
  - Detailed `README.md` (vision, hackathon details, architecture, code quality standards, links).
  - `docs/ARCHITECTURE.md` (with Mermaid diagram).
  - `CONTRIBUTING.md`, `LICENSE`, GitHub PR template, improved CI.
  - Code quality focus: small components, separation of concerns, real SDK usage, excellent comments.
- Research synthesis already done (MagicBlock ER/PER mechanics, FlashTrade partnership, previous Blitz winners patterns, best practices for +50% boost).

The project is a high-quality foundation/scaffold. Not fully end-to-end running yet (program not deployed, real FlashTrade SDK not wired), but the integration patterns, architecture, and professionalism are solid.

## Key Files & Structure
- `README.md` — start here for overview.
- `docs/ARCHITECTURE.md` — deep tech + diagram.
- `programs/flashforge/src/lib.rs` — on-chain logic.
- `frontend/app/page.tsx` + `frontend/components/` — UI entrypoint.
- `frontend/lib/` — delegation + flashTrade abstractions (keep these clean).
- `scripts/` — headless tools and simulations (very useful on VPS).
- `AGENTS.md` (this file), `CONTRIBUTING.md`.

## Development Guidelines (for this project)
- **Prioritize code quality & professionalism** at every step (user request). Small focused components, strong typing, clear separation (base Solana vs ER, FlashTrade concerns in their lib).
- Always explain "why this uses MagicBlock ER + FlashTrade" in comments/docs when adding features.
- Pure/headless scripts are gold for VPS work and demo material.
- Leverage official examples: https://github.com/magicblock-labs/magicblock-engine-examples (especially anchor-counter).
- FlashTrade integration must feel real for the +50% prize (use their SDK patterns, not superficial).
- Hackathon judging loves: deep delegation in loops, clear speed/privacy/composability benefits, working demo feel, excellent README + video narrative.
- When adding features, think about laptop vs VPS: keep pure simulation logic separate so it works without network/browser.

## Important Research & Links (keep handy)
- MagicBlock: docs.magicblock.gg, github.com/magicblock-labs, @magicblock on X.
- FlashTrade: docs.flash.trade, github.com/flash-trade, @FlashTrade on X.
- Hackathon: hackathon.magicblock.app, luma.com/x57f72d7 (register/submit).
- Endpoints: Magic Router `https://devnet-router.magicblock.app` (preferred), base devnet, ER `https://devnet.magicblock.app`.
- Previous winners: deep PER use for privacy/edge cases, full delegation baked into core loops.

## Current Priorities (as of last work)
- Keep improving code quality, architecture, pure scripts, docs.
- Prepare for smooth laptop experience (tests, build, real integrations).
- Next big leaps (when on laptop with browser/CLIs): deploy program, wire real FlashTrade SDK data + position opening, make "fast update" actually call on-chain via ER, add compelling feature (e.g. copy trading simulation or LP dashboard), create demo video.
- Maintain focus on the +50% FlashTrade boost and professional polish.

## How to Use This Context in a New Grok Session
When starting a fresh Grok session in the cloned repo:
1. Tell Grok: "Read AGENTS.md, README.md, and docs/ARCHITECTURE.md first. Then continue working on ForgeFlow."
2. Or paste the key sections + current task.

This file (AGENTS.md) + the main README/ARCHITECTURE should bring any new session fully up to speed without losing the research, standards, and momentum.

Let's keep building something that stands out for the hackathon. What's the next task? (e.g. more simulation variants, deeper program comments, test expansion, submission prep doc, etc.)