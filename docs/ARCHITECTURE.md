# ForgeFlow Architecture Notes

## Core Thesis for Solana Blitz v5
Build the most professional trading automation layer possible in a weekend by deeply leveraging two partner technologies:

- **MagicBlock Ephemeral Rollups** for the execution substrate (real-time, low cost, optionally private).
- **FlashTrade** for the actual liquidity + data surface (their live perps DEX + excellent SDK/MCP surface for builders).

This directly targets the +50% prize boost and aligns with every example of what has won previous Blitz events (deep delegation, creative use of ER/PER, clear composability story, polished demo).

## Account Model
- `StrategyConfig` PDA (owner + strategy_id seed).
- Lives on Solana when created/committed.
- Can be delegated to an ER (ownership transferred to delegation program temporarily).
- While delegated: owner (or authorized executors) can call fast instructions (`update_params`, `record_execution`) routed to the ER.
- State is periodically or explicitly committed back.
- Later: support private/ephemeral-permission variants and Magic Actions to trigger FlashTrade instructions from inside the ER.

## Transaction Routing (Critical)
Use the Magic Router (`https://devnet-router.magicblock.app`) whenever possible. It inspects metadata and does the right thing.

Client code pattern (base vs ER providers) is shown in every official example and in our `lib/delegation.ts` + frontend demo.

## FlashTrade Integration Layers
1. **Data** — REST + WS (or their SDK) for prices, positions, LP stats. Real-time in UI.
2. **Execution** — Build/submit the actual perps instructions (open, close, adjust) against the FlashTrade program. Can be done from client or (advanced) triggered via Magic Action from ER.
3. **Intelligence** — The ForgeFlow program + delegated strategies provide the "brain" that decides sizing, risk, mirroring, etc. at ER speed.

## Current Scaffolding State (as of 2026-06-12)
- Root professional monorepo with excellent README containing all research.
- Anchor program skeleton with the exact delegate CPI + #[delegate] macro pattern from official examples (adapted to trading domain language).
- Next.js 16 + Tailwind + wallet adapter + MagicBlock TS SDK + lucide/recharts.
- Live-feeling UI with:
  - Mock FlashTrade market tiles.
  - Create + delegate strategy flow using the real TS SDK helper.
  - "Fast update in ER" button (simulated but wired to the mental model).
  - Commit/undelegate.
- All important links, endpoints, previous winner patterns, and best practices documented.

## Recommended Next 48h Order of Operations
1. Install Solana + Anchor CLIs (Anchor 1.0.2 via avm).
2. `cd programs/flashforge && anchor build` (fix any version skew in Cargo.toml).
3. Deploy to devnet (or use local MagicBlock cluster from the examples repo for speed).
4. Update program IDs everywhere.
5. Wire a real FlashTrade position open from the frontend (even a simple one).
6. Make the "fast update" actually call the onchain instruction via an ER provider.
7. Add at least one more compelling feature (copy watch simulation, PER story, LP view, or MCP agent stub).
8. Record a crisp 60-90s video showing delegation → ER speed → FlashTrade context.
9. Submit + celebrate.

## Resources (duplicated from root README for convenience)
See root README.md for the master list. The most important during coding:
- https://github.com/magicblock-labs/magicblock-engine-examples (clone and run the anchor-counter)
- https://docs.magicblock.gg/
- FlashTrade build section in their GitBook docs + their GitHub SDKs.

This structure is designed so that judges and partners can immediately see serious intent and technical understanding.
