/**
 * ForgeFlow - VPS / Headless Test Script
 *
 * Run this on your VPS (or any terminal) to exercise the core MagicBlock + delegation flows
 * without needing a browser or wallet UI.
 *
 * Usage:
 *   npx tsx scripts/test-magicblock-flow.ts
 *   # or after tsx installed: tsx scripts/test-magicblock-flow.ts
 *
 * It demonstrates:
 * - Two execution environments (base Solana vs MagicBlock Router/ER)
 * - Real blockhash + "speed" feel comparison
 * - PDA derivation for a StrategyConfig
 * - Building real delegate / undelegate instructions using the official SDK
 * - Connection health
 *
 * This is excellent for:
 * - Verifying your env has the right deps and network access
 * - Generating real-looking tx examples for your demo video / judges
 * - Testing latency difference (base vs ER) on the actual network
 *
 * For full signed txs you will need a keypair (see commented section).
 */

import { Keypair, PublicKey } from "@solana/web3.js";
import {
  deriveStrategyPda,
  buildDelegateInstruction,
  buildUndelegateInstruction,
  getMagicBlockConnections,
} from "../frontend/lib/delegation"; // adjust path if you move the script
import { FLASHFORGE_PROGRAM_ID, MAGICBLOCK_ROUTER_RPC, SOLANA_BASE_RPC } from "../frontend/lib/constants";

async function main() {
  console.log("=== ForgeFlow MagicBlock Flow Test (VPS-friendly) ===");
  console.log("Target program:", FLASHFORGE_PROGRAM_ID);
  console.log("Base RPC:", SOLANA_BASE_RPC);
  console.log("ER / Router:", MAGICBLOCK_ROUTER_RPC);
  console.log("");

  const { base, er: router } = getMagicBlockConnections();

  // 1. Connection health + blockhashes (this shows the "two worlds")
  console.log("Fetching latest blockhash from BASE...");
  const baseStart = Date.now();
  const baseBh = await base.getLatestBlockhash("confirmed");
  const baseMs = Date.now() - baseStart;
  console.log(`  Base blockhash: ${baseBh.blockhash.slice(0, 16)}... (took ${baseMs}ms)`);

  console.log("Fetching latest blockhash from MAGIC ROUTER / ER...");
  const erStart = Date.now();
  const erBh = await router.getLatestBlockhash("confirmed");
  const erMs = Date.now() - erStart;
  console.log(`  ER/Router blockhash: ${erBh.blockhash.slice(0, 16)}... (took ${erMs}ms)`);

  console.log(`\nLatency feel: ER path is typically much faster for execution once delegated.`);
  console.log(`Base: ~${baseMs}ms | Router/ER: ~${erMs}ms (numbers vary by network conditions)`);

  // 2. PDA derivation (exactly what the frontend does)
  const dummyOwner = Keypair.generate().publicKey;
  const strategyId = 42;
  const pda = deriveStrategyPda(dummyOwner, strategyId);
  console.log(`\nDerived Strategy PDA for owner ${dummyOwner.toBase58().slice(0,8)}... id=${strategyId}:`);
  console.log(`  ${pda.toBase58()}`);

  // 3. Build the actual delegate + undelegate instructions (real SDK usage)
  const delegateTx = buildDelegateInstruction({
    payer: dummyOwner,
    delegatedAccount: pda,
    ownerProgram: new PublicKey(FLASHFORGE_PROGRAM_ID),
  });
  console.log(`\nDelegate instruction built successfully (will be sent on BASE connection in real flow).`);
  console.log(`  Instructions in tx: ${delegateTx.instructions.length}`);

  const undelegateTx = buildUndelegateInstruction({
    payer: dummyOwner,
    delegatedAccount: pda,
    ownerProgram: new PublicKey(FLASHFORGE_PROGRAM_ID),
  });
  console.log(`Undelegate instruction built successfully.`);

  // Optional: real signed tx example (uncomment + provide keypair file for full end-to-end test)
  /*
  import fs from "fs";
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(process.env.ANCHOR_WALLET || "~/.config/solana/id.json", "utf8")))
  );
  const { base } = getMagicBlockConnections();
  delegateTx.feePayer = keypair.publicKey;
  delegateTx.recentBlockhash = (await base.getLatestBlockhash()).blockhash;
  delegateTx.sign(keypair);
  const sig = await base.sendRawTransaction(delegateTx.serialize());
  console.log("Real delegate sig (if funded):", sig);
  */

  console.log("\n=== Test complete ===");
  console.log("Next steps on VPS:");
  console.log("- Deploy the program with `anchor build && anchor deploy` once CLIs are installed.");
  console.log("- Run the Next.js app (when you have browser/tunnel access) to see the polished UI.");
  console.log("- Replace the fake discriminators in sendFastStrategyUpdate with real IDL once program is live.");
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
