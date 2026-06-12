"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Rocket, 
  ExternalLink, 
  Play, 
  CheckCircle 
} from "lucide-react";

import { deriveStrategyPda, buildDelegateInstruction } from "../lib/delegation";
import { HACKATHON_LINKS, FLASHFORGE_PROGRAM_ID, MAGICBLOCK_ROUTER_RPC, SOLANA_BASE_RPC } from "../lib/constants";

export default function ForgeFlowPage() {
  const { publicKey, connected, signTransaction } = useWallet();

  const [strategyId, setStrategyId] = useState(1);
  const [copyPct, setCopyPct] = useState(100);
  const [maxLev, setMaxLev] = useState(20);
  const [slBps, setSlBps] = useState(500); // 5%

  const [isDelegated, setIsDelegated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [status, setStatus] = useState<"base" | "er">("base");

  const strategyPda = publicKey 
    ? deriveStrategyPda(publicKey, strategyId) 
    : null;

  // Demo "live" FlashTrade-like data (replace with real SDK/WS reads)
  const mockMarkets = [
    { symbol: "SOL-PERP", price: "142.87", change: "+2.4%", volume: "$48.2M", oi: "$112M" },
    { symbol: "BTC-PERP", price: "67,420", change: "-1.1%", volume: "$129M", oi: "$341M" },
    { symbol: "ETH-PERP", price: "2,412", change: "+0.8%", volume: "$67M", oi: "$89M" },
  ];

  const handleDelegate = async () => {
    if (!publicKey || !signTransaction) return;

    setIsLoading(true);
    try {
      const delegateTx = buildDelegateInstruction({
        payer: publicKey,
        delegatedAccount: strategyPda!,
        ownerProgram: new PublicKey(FLASHFORGE_PROGRAM_ID),
      });

      delegateTx.feePayer = publicKey;
      // In a real app fetch fresh blockhash from base connection
      delegateTx.recentBlockhash = "11111111111111111111111111111111"; // placeholder for demo only

      const signed = await signTransaction(delegateTx);

      const fakeSig = "DEMO_" + Math.random().toString(36).slice(2, 10).toUpperCase();
      setLastTx(fakeSig);
      setIsDelegated(true);
      setStatus("er");

      console.log("[ForgeFlow] Delegate instruction built using @magicblock-labs/ephemeral-rollups-sdk. Send on BASE RPC in production, then route fast txs to router/ER.");
    } catch (e) {
      console.error(e);
      alert("Demo delegation flow. In real implementation: initialize onchain StrategyConfig first, then send the delegate CPI on the base connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastUpdate = async () => {
    if (!publicKey || !isDelegated) {
      alert("Delegate the strategy first to unlock the ER fast path.");
      return;
    }

    setIsLoading(true);
    setStatus("er");

    await new Promise(r => setTimeout(r, 380));

    const fakeSig = "ER_FAST_" + Math.random().toString(36).slice(2, 10).toUpperCase();
    setLastTx(fakeSig);
    setCopyPct(Math.min(200, copyPct + 10));

    setIsLoading(false);
    alert("Fast ER tx simulated. In production: build the updateParams instruction with your Anchor program (ER/router connection) and sendTransaction.");
  };

  const handleCommit = () => {
    if (!isDelegated) return;
    setStatus("base");
    setIsDelegated(false);
    setLastTx("COMMIT_" + Math.random().toString(36).slice(2, 8).toUpperCase());
    alert("Commit simulated. Real flow uses commit_accounts (or scheduled) + undelegate on base layer so FlashTrade can see the final state.");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#ededed]">
      {/* Top Nav */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#22c55e]" />
              <div>
                <span className="font-semibold tracking-tighter text-xl">ForgeFlow</span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#22c55e]">v0.1 • Blitz v5</span>
              </div>
            </div>
            <div className="hidden sm:block text-xs text-[#a1a1aa] pl-3 border-l border-white/10">
              Real-time perps automation on <span className="text-white">FlashTrade</span> + <span className="text-[#22c55e]">MagicBlock ER</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={HACKATHON_LINKS.docs} 
              target="_blank" 
              className="text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1"
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
            <WalletMultiButton className="!bg-white/10 !text-white !border !border-white/20 hover:!bg-white/20 !h-9 !text-sm !px-4" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-24">
        {/* Hero */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="er-badge er-delegated flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> +50% FLASHTRADE BOOST ACTIVE
              </div>
              <div className="text-xs px-2 py-0.5 bg-white/5 rounded">Solana Blitz v5 • Trading Track</div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tighter">
              Forge strategies at the speed of thought.<br />
              Execute on real FlashTrade liquidity.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[#a1a1aa]">
              Delegate strategy accounts to MagicBlock Ephemeral Rollups for &lt;50ms reactive execution, 
              automation, and optional TEE privacy — then settle atomically with FlashTrade on Solana.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button 
                onClick={() => window.open(HACKATHON_LINKS.register, "_blank")}
                className="btn-primary px-6 h-11 rounded-xl flex items-center gap-2 text-sm"
              >
                Register for Blitz v5 <Rocket className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(HACKATHON_LINKS.examples, "_blank")}
                className="btn-secondary px-5 h-11 rounded-xl flex items-center gap-2 text-sm"
              >
                Study official examples
              </button>
            </div>
          </div>

          <div className="trading-card rounded-2xl p-5 w-full lg:w-80 text-sm">
            <div className="section-title mb-3">Current Stack</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span>MagicBlock ER</span><span className="text-[#22c55e]">devnet-router.magicblock.app</span></div>
              <div className="flex justify-between"><span>FlashTrade</span><span className="text-[#22c55e]">Live perps DEX (pool-to-peer)</span></div>
              <div className="flex justify-between"><span>Integration</span><span>Deep delegation + SDK</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-[#a1a1aa]">
              This demo shows the exact delegation + fast-path patterns from the official repo.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* FlashTrade Live Panel */}
          <div className="xl:col-span-5 trading-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-title">FlashTrade • Live Markets</div>
                <div className="text-xs text-[#a1a1aa] mt-0.5">Real data via SDK / WS (mock for scaffold)</div>
              </div>
              <div className="text-[10px] px-2 py-1 bg-emerald-950 text-emerald-400 rounded">Powered by FlashTrade</div>
            </div>

            <div className="space-y-3">
              {mockMarkets.map((m, i) => (
                <div key={i} className="flex items-center justify-between bg-black/30 rounded-2xl px-4 py-3 text-sm">
                  <div className="font-medium">{m.symbol}</div>
                  <div className="font-mono tabular-nums">{m.price}</div>
                  <div className={m.change.startsWith("+") ? "text-[#22c55e]" : "text-[#ef4444]"}>{m.change}</div>
                  <div className="text-[#a1a1aa] tabular-nums text-xs hidden sm:block">Vol {m.volume}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-[11px] text-[#a1a1aa]">
              Next: Replace mocks with <span className="code">@flash-trade/flash-trade-sdk</span> + onchain reads from <span className="code">FLASH6Lo...</span>.
            </div>
          </div>

          {/* Strategy + Delegation Core */}
          <div className="xl:col-span-7 trading-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              <div className="section-title">Strategy Config (Delegatable to ER)</div>
            </div>

            {!connected ? (
              <div className="py-8 text-center border border-dashed border-white/15 rounded-2xl">
                <p className="text-[#a1a1aa] mb-4">Connect a wallet to create &amp; delegate a strategy account</p>
                <WalletMultiButton className="!bg-[#22c55e] !text-black !font-semibold" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Strategy ID</label>
                    <input 
                      type="number" value={strategyId} onChange={e => setStrategyId(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Copy %</label>
                    <input type="number" value={copyPct} onChange={e => setCopyPct(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Max Leverage (x)</label>
                    <input type="number" value={maxLev} onChange={e => setMaxLev(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Auto SL (bps)</label>
                    <input type="number" value={slBps} onChange={e => setSlBps(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDelegate}
                    disabled={isLoading || isDelegated}
                    className="btn-primary flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? "Building tx..." : isDelegated ? "DELEGATED TO ER" : "DELEGATE STRATEGY TO EPHEMERAL ROLLUP"}
                    <Zap className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleFastUpdate}
                    disabled={!isDelegated || isLoading}
                    className="btn-secondary flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    FAST UPDATE IN ER <Play className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleCommit}
                    disabled={!isDelegated}
                    className="btn-secondary px-6 h-12 rounded-2xl flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    COMMIT + UNDELEGATE
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`er-badge ${isDelegated ? "er-delegated" : "er-base"}`}>
                      {isDelegated ? "LIVE IN EPHEMERAL ROLLUP" : "ON SOLANA BASE LAYER"}
                    </span>
                    <span className="text-[#a1a1aa]">PDA: {strategyPda?.toBase58().slice(0, 12)}...</span>
                  </div>
                  {lastTx && <span className="font-mono text-[#22c55e]">{lastTx}</span>}
                </div>

                <div className="text-[11px] leading-snug text-[#a1a1aa] bg-black/30 p-3 rounded-2xl">
                  This constructs a real <span className="code">createDelegateInstruction</span> from the official TS SDK.
                  Send the delegate on the base RPC, then perform fast updates against the Magic Router / ER endpoint.
                </div>
              </div>
            )}
          </div>

          {/* Explainer */}
          <div className="xl:col-span-5 trading-card rounded-3xl p-6">
            <div className="section-title mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Why This Wins
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="mt-1"><Zap className="w-4 h-4 text-[#22c55e]" /></div>
                <div><span className="font-medium">Sub-50ms reactive execution</span><br />Trailing stops, copy mirrors, and risk engines run inside the dedicated SVM.</div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1"><Shield className="w-4 h-4 text-[#22c55e]" /></div>
                <div><span className="font-medium">Optional TEE privacy (PER)</span><br />Hide strategy logic until settlement. No signal leakage or front-running.</div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1"><Rocket className="w-4 h-4 text-[#22c55e]" /></div>
                <div><span className="font-medium">Real FlashTrade liquidity</span><br />Everything settles against actual perps pools. No fragmentation.</div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 text-xs text-[#a1a1aa]">
              Official pattern: <a href={HACKATHON_LINKS.examples} target="_blank" className="underline">magicblock-engine-examples/anchor-counter</a>
            </div>
          </div>

          <div className="xl:col-span-7 trading-card rounded-3xl p-6 text-sm">
            <div className="section-title mb-3">Weekend Roadmap</div>
            <ol className="list-decimal pl-5 space-y-1.5 text-[#a1a1aa]">
              <li>Deploy real flashforge program (Anchor + ephemeral-rollups-sdk) and update IDs.</li>
              <li>Integrate actual FlashTrade SDK + allow triggering real positions from delegated state.</li>
              <li>Copy-trading simulation or watcher → mirror flow.</li>
              <li>PER toggle, latency comparison UI, production commit/undelegate.</li>
              <li>Demo video + polished submission assets.</li>
            </ol>
            <div className="mt-4 text-xs">Full research, links, and best-practice notes live in the root <span className="code">README.md</span>.</div>
          </div>
        </div>

        <div className="mt-16 text-center text-xs text-[#a1a1aa]">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href={HACKATHON_LINKS.magicblock} target="_blank" className="hover:text-white">Hackathon site</a>
            <a href={HACKATHON_LINKS.flashTradeBuild} target="_blank" className="hover:text-white">FlashTrade Build Docs</a>
            <a href={HACKATHON_LINKS.sdk} target="_blank" className="hover:text-white">MagicBlock SDK</a>
            <a href={HACKATHON_LINKS.flashOrg} target="_blank" className="hover:text-white">FlashTrade GitHub</a>
            <a href="https://www.magicblock.xyz/blog/flashtrade" target="_blank" className="hover:text-white">Partnership post</a>
          </div>
          <div className="mt-3">Professional scaffolding for Solana Blitz v5. Deep integration from the first commit.</div>
        </div>
      </div>
    </div>
  );
}
