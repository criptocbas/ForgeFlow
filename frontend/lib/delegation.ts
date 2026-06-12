import { PublicKey, Transaction, Connection } from "@solana/web3.js";
import {
  createDelegateInstruction,
  createUndelegateInstruction,
  DELEGATION_PROGRAM_ID,
} from "@magicblock-labs/ephemeral-rollups-sdk";
import { FLASHFORGE_PROGRAM_ID, STRATEGY_SEED } from "./constants";

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
 * Helper to get two connections:
 * - base: for delegation, undelegation, FlashTrade reads, commits
 * - er: for fast execution while account is delegated (or use the router for both)
 */
export function getConnections(baseRpc: string, erRpc: string) {
  return {
    base: new Connection(baseRpc, "confirmed"),
    er: new Connection(erRpc, "confirmed"),
  };
}

/**
 * Example: after delegation, build a simple "update params" transaction
 * that you would send via the ER connection / router.
 *
 * In a real implementation you would use the generated Anchor program methods:
 *   program.methods.updateParams(...).accounts({ strategy: pda }).transaction()
 * Then sign + send on the ER provider.
 */
export async function buildExampleFastUpdateTx(
  strategyPda: PublicKey,
  programId: PublicKey,
  // In real code: the Anchor program instance + methods
): Promise<Transaction> {
  // Placeholder — replace with real Anchor instruction once IDL is generated.
  // The point of this helper is to show the *mental model*:
  //   1. You already delegated via base tx.
  //   2. Now create a tx that touches the (now delegated) account.
  //   3. Send it to the ER/router endpoint for speed.

  const tx = new Transaction();
  // tx.add( actualUpdateParamsInstruction(...) );
  return tx;
}
