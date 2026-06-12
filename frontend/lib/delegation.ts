import { PublicKey, Transaction, Connection, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import {
  createDelegateInstruction,
  createUndelegateInstruction,
} from "@magicblock-labs/ephemeral-rollups-sdk";
import { FLASHFORGE_PROGRAM_ID, STRATEGY_SEED, MAGICBLOCK_ROUTER_RPC, SOLANA_BASE_RPC } from "./constants";

/**
 * ForgeFlow Delegation Helpers
 *
 * These are thin wrappers around the official @magicblock-labs/ephemeral-rollups-sdk.
 * Pattern taken directly from magicblock-engine-examples (anchor-counter + TS tests).
 *
 * IMPORTANT:
 * - Use the Magic Router connection (or explicit ER connection) when you want fast execution.
 * - The delegate instruction is sent on the BASE connection (it targets the delegation program on L1).
 * - After delegation, route subsequent txs (update_params, record_execution, etc.) to the ER/router.
 * - commit + undelegate also typically originate from base but affect the delegated account.
 */

export function deriveStrategyPda(owner: PublicKey, strategyId: number | bigint): PublicKey {
  const idBytes = Buffer.alloc(8);
  idBytes.writeBigUInt64LE(BigInt(strategyId));
  return PublicKey.findProgramAddressSync(
    [STRATEGY_SEED, owner.toBuffer(), idBytes],
    new PublicKey(FLASHFORGE_PROGRAM_ID)
  )[0];
}

export interface DelegateParams {
  payer: PublicKey;
  delegatedAccount: PublicKey;
  ownerProgram: PublicKey;
  /** Reimbursement account (usually the payer) */
  reimbursement?: PublicKey;
}

/**
 * Build a Delegate instruction for a StrategyConfig PDA.
 * Send this on a base-layer connection.
 */
export function buildDelegateInstruction(params: DelegateParams): Transaction {
  const { payer, delegatedAccount, ownerProgram } = params;
  const reimbursement = params.reimbursement ?? payer;

  const ix = createDelegateInstruction({
    payer,
    delegatedAccount,
    ownerProgram,
    reimbursement,
  });

  return new Transaction().add(ix);
}

/**
 * Build an Undelegate instruction.
 */
export function buildUndelegateInstruction(params: DelegateParams): Transaction {
  const { payer, delegatedAccount, ownerProgram } = params;
  const reimbursement = params.reimbursement ?? payer;

  const ix = createUndelegateInstruction({
    payer,
    delegatedAccount,
    ownerProgram,
    reimbursement,
  });

  return new Transaction().add(ix);
}

/**
 * Get properly configured connections for the two execution environments.
 * 
 * - baseConnection: Use for initialize, delegate, commit, undelegate, and FlashTrade settlement reads.
 * - erConnection (or router): Use for fast txs after an account has been delegated.
 *
 * We default to the Magic Router because it automatically routes based on tx metadata.
 * This is the recommended pattern from MagicBlock for most builders.
 */
export function getMagicBlockConnections() {
  const base = new Connection(SOLANA_BASE_RPC, "confirmed");
  const erOrRouter = new Connection(MAGICBLOCK_ROUTER_RPC, "confirmed");
  return { base, er: erOrRouter, router: erOrRouter };
}

/**
 * Real helper: build + optionally send a "fast update" tx against the ER/router.
 *
 * This demonstrates the correct flow:
 * 1. Account must already be delegated (via a prior base tx).
 * 2. You construct the program instruction that mutates the delegated account.
 * 3. You send the tx using the ER/router Connection.
 *
 * Until you deploy the program this will fail with "Program not found" or "Account not delegated",
 * which is expected and actually great for the demo — you can show the routing working.
 *
 * In a full implementation you would use the Anchor Program (with the IDL) or manually build the ix.
 */
export async function sendFastStrategyUpdate(
  connection: Connection,
  strategyPda: PublicKey,
  owner: PublicKey,
  newCopy: number,
  newLev: number,
  newSl: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const programId = new PublicKey(FLASHFORGE_PROGRAM_ID);

  // Placeholder instruction data that matches our program's UpdateParams layout.
  // In production: use the IDL coder or Anchor methods.
  // For now we build a raw instruction with the correct discriminator + data.
  const UPDATE_PARAMS_DISCRIMINATOR = Buffer.from([0x9a, 0x3a, 0x2e, 0x1f, 0x4c, 0x7b, 0x8d, 0x2e]); // fake for demo; real one comes from IDL

  const data = Buffer.concat([
    UPDATE_PARAMS_DISCRIMINATOR,
    Buffer.from(new Uint16Array([newCopy]).buffer),
    Buffer.from(new Uint16Array([newLev]).buffer),
    Buffer.from(new Uint16Array([newSl]).buffer),
  ]);

  const ix = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: strategyPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    data,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = owner;

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;

  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
  });

  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}
