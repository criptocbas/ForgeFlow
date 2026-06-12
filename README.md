# ForgeFlow ⚡

**Real-time automated perps strategies and copy-trading intelligence layer for FlashTrade, powered by MagicBlock Ephemeral Rollups.**

> Solana Blitz v5 Hackathon — Trading track (June 12–14, 2026)

**Why this stack wins the extra 50% FlashTrade boost + stands out:**

- **FlashTrade**: The live, production perps DEX (pool-to-peer, zero slippage,  crypto + commodities + forex + equities, high leverage). We build *directly on top* of their real liquidity, data (REST + WS), and onchain state using their official SDKs + APIs. Features like copy trading, auto strategies, and LP dashboards are called out by MagicBlock as high-value integrations.
- **MagicBlock Ephemeral Rollups (ER)**: Sub-50ms execution, high throughput, cheap/fast tx *while fully on Solana*. Delegate strategy state PDAs to a dedicated SVM runtime. Run reactive logic (trailing stops, copy mirroring, condition-based execution, risk engines) instantly. Commit atomically back to L1. Use Private ER (PER + Intel TDX TEE) for hidden alpha strategies / MEV-resistant dark execution.
- **Composability + Escape Hatch**: No fragmentation. Full Solana security + composability + FlashTrade liquidity. 1:1 compatible. "Magic Actions" let ER logic trigger mainnet behavior.

This is exactly what the judges and partners want to see: creative, deep use of both technologies to unlock trading UX that feels impossible on vanilla Solana (CEX-like reactivity + onchain guarantees + privacy options).

---

## 🎯 Project Vision (MVP for the weekend)

**ForgeFlow** = "Forge" strategies in the ephemeral layer that react at the speed of thought and execute on FlashTrade.

### Code Quality & Professionalism Standards
This repo aims for hackathon-winning levels of polish:
- Clear separation of base Solana vs. Ephemeral Rollup execution paths in every layer.
- FlashTrade concerns live in their own well-typed lib.
- Small, focused React components and pure simulation scripts for VPS/headless development.
- Excellent comments and documentation so judges (and future you) understand the MagicBlock + FlashTrade integration deeply.
- Real transaction construction using the official SDKs (not smoke-and-mirrors).

See `CONTRIBUTING.md`, the extracted components in `frontend/components/`, `frontend/lib/flashTrade.ts`, and the pure `scripts/simulate-strategy.ts`.

Core flows (prioritized for hackathon):

1. **Live FlashTrade Terminal + Data Layer** — Real markets, your positions, LP metrics pulled via FlashTrade SDK / onchain reads + WS. One-click open/manage perps positions on the actual FlashTrade DEX.
2. **Delegated Strategy Accounts** — Create "MirrorConfig" or "Strategy" PDAs. One click: delegate to ER (using MagicBlock TS SDK + Magic Router RPC). Once delegated, updates and reactive logic are sub-second / low cost.
3. **Real-time Automation Layer (ER)** — While delegated:
   - Fast param updates (copy %, risk limits, SL/TP levels).
   - Simulated or real "execution engine": watch FlashTrade state (via WS or events) and trigger mirror trades or auto risk actions at ER speed.
   - Optional PER mode for private strategies (state invisible on mainnet until commit).
4. **Copy Trading & Vaults** — Follow top traders or published strategies. Your delegated mirror config computes sizing/risk in ER and fires the actual FlashTrade trade (via client or Magic Action pattern).
5. **LP Intelligence Dashboard** — Real yield tracking + suggested rebalancing actions that can be executed fast in ER.

**Stretch (if time)**: Simple onchain "crank" or use MagicBlock automation primitives; MCP-powered agent that proposes/adjusts strategies; on-curve or session-key delegated trading sessions.

**Unique angle**: Vanilla copy/auto trading on Solana is too slow/expensive/public for sophisticated use. ER removes the latency/cost tax. PER removes the information leakage tax. FlashTrade removes the liquidity/UX tax. The combination feels like the "CEXiest onchain perps experience" the partners keep talking about.

---

## 🏆 Hackathon Alignment & Prize Boost

- **Event**: [Solana Blitz v5](https://hackathon.magicblock.app/) by MagicBlock. Theme: Trading apps built with Ephemeral Rollups. Dates: Fri Jun 12 – Sun Jun 14.
- **Register**: https://luma.com/x57f72d7
- **Submit**: https://luma.com/ujbohb95 (or via hackathon.magicblock.app)
- **Prizes (base)**: 1st $500 USDC (best trading), 2nd $250, 3rd $150, Wizardio's Choice $100.
- **FlashTrade partner boost**: **+50% on prizes** if you integrate their SDK/API (confirmed by @magicblock). 1st becomes $750 USDC.
- **Support this weekend**: MagicBlock team in Telegram + virtual co-working (WorkAdventure). Livestream kickoff with FlashTrade SDK walkthrough. Previous Blitz had 30–50+ submissions.

Judging loves: Working demo (especially live delegation + ER tx feel), clear narrative ("only possible because of ER + FlashTrade"), clean/professional code + docs, creative leverage of delegation/PER/automation/composability.

---

## 🔬 Technology Deep Dive (from research + official sources)

### MagicBlock
- **Core primitive**: Ephemeral Rollup (ER) — temporarily delegate (lock) one or more Solana accounts to a specialized high-performance SVM runtime.
- Lifecycle: Delegate (via CPI to delegation program) → Execute fast txs on ER RPC (or Magic Router) → Commit (or scheduled commit) state back to Solana L1 atomically → Optionally undelegate.
- **Magic Router** (recommended): Single smart RPC `https://devnet-router.magicblock.app` that inspects metadata and routes txs automatically to the right environment (ER vs base Solana). Huge DX win.
- Endpoints (devnet, free for dev):
  - Magic Router: https://devnet-router.magicblock.app (and wss)
  - Direct ER: https://devnet.magicblock.app
  - Base Solana: https://api.devnet.solana.com
  - TEE/PER: https://devnet-tee.magicblock.app
- **Private Ephemeral Rollup (PER)**: ER + Intel TDX TEE. Confidential state + execution. Perfect for trading (hidden orders, sealed strategies, no frontrunning your own signals).
- SDKs:
  - Rust: `ephemeral-rollups-sdk` (macros `#[delegate]`, `delegate_account` CPI, `commit_accounts`, etc.)
  - TS: `@magicblock-labs/ephemeral-rollups-sdk` (and kit for @solana/kit)
- Key repos (study these first):
  - https://github.com/magicblock-labs/magicblock-engine-examples (the bible — especially anchor-counter)
  - https://github.com/magicblock-labs/ephemeral-rollups-sdk
  - https://github.com/magicblock-labs/delegation-program
  - https://github.com/magicblock-labs/starter-kits
- Docs: https://docs.magicblock.gg/ (quickstart, Anchor integration guide, ER explanation, Magic Router, local dev with test cluster)
- Website: https://www.magicblock.xyz/ (trading use case, privacy, incubator)
- X: [@magicblock](https://x.com/magicblock), [@andyweng_](https://x.com/andyweng_)
- Community: Discord, Telegram (linked from Luma/hackathon pages)

### FlashTrade
- Production asset-backed perps DEX on Solana. Pool-to-peer model → zero price impact/slippage even on size. Broad markets (incl. non-crypto). Deep LP via FLP + FAF staking.
- **It already runs on MagicBlock ER** for its own CEX-like speed (partnership announced 2025, multiple blog posts + X).
- For builders (this hackathon):
  - REST API + WebSocket for real-time data (prices, fills, positions, LP earnings).
  - Official SDKs: TypeScript (`flash-trade-sdk` or equiv in https://github.com/flash-trade) + Rust (`flash-sdk-rust`).
  - MCP server (flash-trade-MCP) — Model Context Protocol for Claude / AI agents. "AI and LLM integration out of the box".
  - Onchain program ID (known): `FLASH6Lo6h3iasJKWDs2F8TkW2UKf3s15C8PMGuVfgBn`
  - Build guide: https://docs.flash.trade/ (see "Build On Flash", V2 API sections). Direct from announcement: https://docs.flash.trade/flash-trade/flash-trade-protocol/build-on-flash and v2 subpage.
- GitHub org: https://github.com/flash-trade (flash-trade-sdk, flash-sdk-rust, flash-trade-MCP, magicblock-grpc-example, session-keys fork, etc.)
- X: [@FlashTrade](https://x.com/FlashTrade)
- Partnership context: https://www.magicblock.xyz/blog/flashtrade (real-time UX, unfragmented liquidity, elastic TPS).

### Key Patterns Observed in Previous Blitz Winners (X + Reddit recaps)
- Deep delegation baked into the core loop (not a demo button).
- Heavy PER/privacy usage when it gives a real edge (auctions, payments, games with hidden info).
- Creative plugins (VRF for fairness, automation/crank, Magic Actions to bridge ER → L1).
- Polished demos + strong "why this only works with the tech" storytelling.
- Full E2E: client delegation tx → fast ER execution visible in UI → commit visible on explorer.
- One standout example (dark pool orderbook): sub-10ms matching inside ER + atomic mainnet settlement via Magic Actions.
- For agentic/trading: privacy matters so your agents aren't copied or sandwiched.

Apply these: Our strategy accounts live delegated. Reactive logic runs in ER. Privacy toggle via PER when it matters. All trades ultimately hit real FlashTrade liquidity.

---

## 🏗️ Architecture (High Level)

```
User / Agent (FE or MCP)
        │
        ▼  (Wallet txs + FlashTrade SDK / WS)
FlashTrade Frontend Layer (live data + place actual perps trades)
        │
        ▼  (delegate / fast tx routing)
Magic Router / ER RPC (https://devnet-router.magicblock.app)
        │
        ├─► Delegated Strategy PDA (in ER)  ← fast reads/writes, low latency, optional TEE
        │      • Update mirror params
        │      • Risk engine / trailing logic / copy calc
        │      • (Future) scheduled or event-driven execution
        │
        ▼  (commit or Magic Action)
Solana L1 (FlashTrade program state + your positions/collateral)
        ▲
        └─ Full composability + security + liquidity
```

**Two connection points** (see examples):
- Base provider → Solana devnet (for delegation setup, commits, FlashTrade settlement reads).
- ER provider (or router) → MagicBlock endpoint (for the fast path while delegated).

Program must CPI the delegation program for delegate/undelegate/commit. Client uses the TS SDK helpers for the same instructions.

---

## 🚀 Quick Start (Current State)

This repo is set up as a clean, professional monorepo ready for a weekend of high-quality hacking.

### 1. Prerequisites (install if missing)
- Node 20+ (we have v22)
- Rust + cargo
- Solana CLI + Anchor (1.0.2 recommended for current examples; older 0.32.1 also supported)
  ```bash
  # One-liner examples (see official docs)
  sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
  # Then AVM for Anchor 1.0.2
  ```
- (Optional but recommended) MagicBlock local cluster for fast iteration (see examples repo `yarn setup` + `test-locally.sh` patterns).

### 2. Clone / Setup (you're already in the folder)
```bash
git clone <repo>   # or continue here
cd magicblock   # the workspace folder
npm install       # installs workspaces (frontend + shared)
```

### 3. Environment
```bash
cp .env.example .env
# Edit with your wallet etc. RPCs are public for devnet.
```

### 4. Program (programs/flashforge)
Scaffolded with the canonical delegation pattern from the official Anchor Counter example (adapted for a trading "StrategyConfig" account).

```bash
cd programs/flashforge
# Once Anchor/Solana CLIs installed:
anchor build
# Tests will use both base + ER providers (see anchor-counter in magicblock-engine-examples)
```

Key integration points already planned:
- `#[delegate]` on the program.
- `delegate_account` CPI in an init/delegate instruction.
- Commit helpers.
- Strategy state designed for fast ER mutation (params, last signal, computed sizing).

Study in parallel: https://github.com/magicblock-labs/magicblock-engine-examples/tree/main/anchor-counter

### 5. Frontend
Next.js (to be scaffolded / expanded). Wallet adapter, Tailwind + professional trading dark UI, tabs for:
- Markets (FlashTrade data)
- My Strategies (create + delegate button)
- Live Execution (ER status, fast update demo)
- Copy / LP views

```bash
npm run dev   # from root or cd frontend && npm run dev
```

### 6. FlashTrade Integration
- Use official TS SDK from https://github.com/flash-trade/flash-trade-sdk (or direct REST/WS + onchain reads with the known program ID).
- MCP server available for any agentic bonus features.
- See their build docs for exact instruction building / position management.

### 7. Useful Commands
```bash
npm run dev
npm run build
npm run build:program   # after CLIs
```

See package.json scripts + individual workspace READMEs.

---

## 📁 Current Folder Structure

```
.
├── README.md
├── package.json                 # root + workspaces orchestration
├── .gitignore
├── .env.example
├── programs/
│   └── flashforge/              # Anchor program (delegation-ready)
│       ├── Anchor.toml
│       ├── Cargo.toml
│       └── src/lib.rs           # StrategyConfig + delegate CPI skeleton
├── frontend/                    # Next.js trading app (wallet, data, delegation UI)
├── shared/                      # Shared TS types, FlashTrade/MagicBlock wrappers
├── scripts/                     # deploy, test, demo helpers
├── docs/                        # extra architecture notes, submission assets
└── .github/workflows/           # CI skeleton (build + lint)
```

---

## 🛠️ Development Best Practices We're Following (for pro submission)

- Study the official examples **before** writing custom logic (magicblock-engine-examples is gold).
- Use Magic Router RPC from day one for simplest routing.
- Separate base vs ER connections/providers clearly (documented in code).
- Make delegation/ER status visible and toggleable in UI (judges love this).
- Real FlashTrade data + at least one real onchain interaction with their program (or accurate simulation + clear path to full).
- Clean commits, excellent inline comments on the delegation flow.
- Professional README + short Loom/video showing "before (slow mainnet feel) vs after (delegated ER)" if possible.
- Test both local MagicBlock cluster (when available) and public devnet endpoints.
- For PER/privacy angle: have a clear toggle or variant even if stubbed.
- Leverage session keys / MCP where it adds "future-proof agentic" polish.

---

## 📚 Essential Links (bookmark these)

**Hackathon**
- Register: https://luma.com/x57f72d7
- Submit / more info: https://hackathon.magicblock.app/ | https://luma.com/ujbohb95
- Kickoff & support: MagicBlock Telegram, virtual office, X livestreams

**MagicBlock**
- Docs: https://docs.magicblock.gg/
- Examples (must read): https://github.com/magicblock-labs/magicblock-engine-examples
- SDK: https://github.com/magicblock-labs/ephemeral-rollups-sdk
- Blog (FlashTrade partnership): https://www.magicblock.xyz/blog/flashtrade
- Site: https://www.magicblock.xyz/
- X: @magicblock

**FlashTrade**
- Build docs: https://docs.flash.trade/ (Build On Flash section)
- GitHub org + SDKs: https://github.com/flash-trade
- X: @FlashTrade
- Main: https://www.flash.trade/

**Solana / Tooling**
- Anchor 1.0.2 + ephemeral-rollups-sdk patterns (see examples READMEs)

---

## ✅ Pre-Submission Checklist (professional bar)

- [ ] Working delegation flow (tx visible) + at least one fast tx executed while delegated (ER endpoint or router)
- [ ] Visible FlashTrade data or position interaction (SDK or accurate onchain)
- [ ] Clear ER vs base latency / cost benefit shown (UI badge, logs, or comparison)
- [ ] README + short video explaining the "why MagicBlock + FlashTrade" thesis
- [ ] Code is clean, typed, well-commented on the integration points
- [ ] Demo works on public devnet endpoints (or note local cluster requirement)
- [ ] Privacy / automation angle called out even if partial
- [ ] Submitted on time + any required Luma form filled

---

## 🤝 Contributing / Team

Solo or small squad (up to 4 mentioned). Jump in the Telegram for the event.

This repo is intended to be the single source of truth for the project — clean, documented, and impressive from the first commit.

Let's build something the partners will be excited to amplify.

**Status**: Initial professional scaffolding complete. Research synthesized. Ready for rapid implementation of the core delegation + FlashTrade data + UI flows.

Start here:
1. Install CLIs if needed.
2. `npm install`
3. Study the two key example READMEs linked above.
4. Begin with the program delegation instruction + a "hello fast update" in the frontend.

Questions or blockers during the weekend? Use the official channels — the MagicBlock team is active.

Let's ship something legendary. 🧙✨⚡

---

*Built for Solana Blitz v5. Deeply leveraging MagicBlock Ephemeral Rollups + FlashTrade for the future of real-time onchain trading.*
