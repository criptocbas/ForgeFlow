//! ForgeFlow Program
//!
//! Strategy & automated execution engine for FlashTrade perps.
//! Core innovation: Delegate "StrategyConfig" PDAs to MagicBlock Ephemeral Rollups (ER)
//! for sub-50ms reactive updates, automation, and optional privacy (PER).
//!
//! Pattern directly adapted from the official magicblock-engine-examples/anchor-counter
//! (the canonical reference). See: https://github.com/magicblock-labs/magicblock-engine-examples
//!
//! Key flows:
//! - Initialize a StrategyConfig (owner-controlled).
//! - Delegate it (CPI to delegation program) → state moves to fast ER SVM.
//! - While delegated: fast `update_params`, `record_execution`, etc. via ER RPC/router.
//! - Commit (or scheduled) back to Solana L1 for settlement with FlashTrade program.
//! - Optional: Private variant using ephemeral permission accounts or TEE PER.
//!
//! This enables the real-time copy trading / auto-strategy features that win +50% FlashTrade boost.

use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::delegate;
use ephemeral_rollups_sdk::cpi::delegate_account;
use ephemeral_rollups_sdk::er::commit_accounts; // For commit helpers when needed

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Seed for the strategy PDA (owner, strategy_id or similar).
pub const STRATEGY_SEED: &[u8] = b"strategy";

#[program]
pub mod flashforge {
    use super::*;

    /// Initialize a new strategy config owned by the payer.
    /// This account can later be delegated to an Ephemeral Rollup.
    pub fn initialize_strategy(
        ctx: Context<InitializeStrategy>,
        strategy_id: u64,
        copy_percentage: u16, // e.g. 100 = 100%
        max_leverage: u16,
        auto_sl_bps: u16,     // stop loss in basis points
    ) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        strategy.owner = ctx.accounts.owner.key();
        strategy.strategy_id = strategy_id;
        strategy.copy_percentage = copy_percentage;
        strategy.max_leverage = max_leverage;
        strategy.auto_sl_bps = auto_sl_bps;
        strategy.last_execution_slot = 0;
        strategy.delegated = false;
        strategy.bump = ctx.bumps.strategy;

        msg!("Strategy {} initialized. Owner: {}", strategy_id, strategy.owner);
        Ok(())
    }

    /// Delegate the StrategyConfig PDA to an Ephemeral Rollup.
    /// After this, fast transactions (update_params, record fast signals) should target the ER RPC.
    ///
    /// This is the critical MagicBlock integration point.
    /// See the TS client side for creating the actual delegate instruction via @magicblock-labs/ephemeral-rollups-sdk.
    #[delegate]
    pub fn delegate_strategy(ctx: Context<DelegateStrategy>) -> Result<()> {
        let strategy = &ctx.accounts.strategy;
        let pda_seeds: &[&[u8]] = &[
            STRATEGY_SEED,
            strategy.owner.as_ref(),
            &strategy.strategy_id.to_le_bytes(),
        ];

        delegate_account(
            &ctx.accounts.owner,
            &ctx.accounts.strategy.to_account_info(),
            &ctx.accounts.owner_program,
            &ctx.accounts.buffer,
            &ctx.accounts.delegation_record,
            &ctx.accounts.delegate_account_seeds,
            &ctx.accounts.delegation_program,
            &ctx.accounts.system_program,
            pda_seeds,
            0,      // max delegation lifetime (0 = unlimited for hackathon)
            30_000, // commit interval ms (tune for your use case; 30s example)
        )?;

        // Mark locally for UI convenience (actual ownership moves to delegation program)
        let strategy_mut = &mut ctx.accounts.strategy;
        strategy_mut.delegated = true;

        msg!("Strategy delegated to Ephemeral Rollup. Fast execution enabled.");
        Ok(())
    }

    /// Example fast-path instruction that only makes sense (or is cheap/fast) while delegated.
    /// Update copy/risk params in <50ms inside the ER.
    pub fn update_params(
        ctx: Context<UpdateParams>,
        new_copy_percentage: u16,
        new_max_leverage: u16,
        new_auto_sl_bps: u16,
    ) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;

        // In real life you would also check that we are in a delegated context / correct ER.
        // For the hackathon the router + client provider choice enforces most of this.

        strategy.copy_percentage = new_copy_percentage;
        strategy.max_leverage = new_max_leverage;
        strategy.auto_sl_bps = new_auto_sl_bps;

        msg!(
            "Strategy params updated in ER: copy={}%, lev={}, sl={}bps",
            new_copy_percentage,
            new_max_leverage,
            new_auto_sl_bps
        );
        Ok(())
    }

    /// Record a fast execution / signal while in ER (e.g. a mirrored trade was fired or condition met).
    /// This state is cheap and instant inside the rollup.
    pub fn record_execution(ctx: Context<RecordExecution>, executed_at_slot: u64) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        strategy.last_execution_slot = executed_at_slot;
        msg!("Execution recorded at slot {} (ER fast path)", executed_at_slot);
        Ok(())
    }

    /// Commit strategy state back from ER to base Solana layer (L1 settlement).
    /// Call this (or let the scheduled commit handle it) before full undelegate if you want durability.
    pub fn commit_strategy(ctx: Context<CommitStrategy>) -> Result<()> {
        // Example using the SDK helper. In practice you list the accounts you want committed.
        let strategy_info = ctx.accounts.strategy.to_account_info();
        commit_accounts(
            &ctx.accounts.payer,
            vec![&strategy_info],
            &ctx.accounts.delegation_program,
            &ctx.accounts.system_program,
        )?;

        msg!("Strategy state committed from ER back to Solana L1.");
        Ok(())
    }

    // TODO for full hackathon polish:
    // - undelegate_strategy (using createUndelegateInstruction on client or CPI)
    // - integrate actual FlashTrade position instructions (CPI or client-built)
    // - private/permissioned variant (see pinocchio-private-counter and private-counter examples)
    // - VRF for randomized strategy triggers if useful
    // - Magic Actions example to trigger base-layer FlashTrade actions from inside ER
}

/// Accounts for initialize_strategy
#[derive(Accounts)]
#[instruction(strategy_id: u64)]
pub struct InitializeStrategy<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + StrategyConfig::INIT_SPACE,
        seeds = [STRATEGY_SEED, owner.key().as_ref(), &strategy_id.to_le_bytes()],
        bump
    )]
    pub strategy: Account<'info, StrategyConfig>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Accounts for the delegate instruction (must match the #[delegate] macro expectations + your CPI needs).
#[derive(Accounts)]
pub struct DelegateStrategy<'info> {
    #[account(mut)]
    pub strategy: Account<'info, StrategyConfig>,

    /// The owner who can authorize delegation.
    pub owner: Signer<'info>,

    /// CHECK: The program that owns the account being delegated (this program).
    #[account(address = crate::ID)]
    pub owner_program: UncheckedAccount<'info>,

    /// CHECK: Buffer account required by the delegation program.
    #[account(mut)]
    pub buffer: UncheckedAccount<'info>,

    /// CHECK: Delegation record (owned by delegation program).
    #[account(mut)]
    pub delegation_record: UncheckedAccount<'info>,

    /// CHECK: Seeds account for delegation.
    #[account(mut)]
    pub delegate_account_seeds: UncheckedAccount<'info>,

    /// CHECK: The delegation program itself.
    pub delegation_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateParams<'info> {
    #[account(mut, has_one = owner)]
    pub strategy: Account<'info, StrategyConfig>,

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecordExecution<'info> {
    #[account(mut)]
    pub strategy: Account<'info, StrategyConfig>,

    // In production you might require a crank or authorized executor PDA here.
    pub executor: Signer<'info>,
}

#[derive(Accounts)]
pub struct CommitStrategy<'info> {
    #[account(mut)]
    pub strategy: Account<'info, StrategyConfig>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: delegation program
    pub delegation_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

/// The core onchain state for a user's strategy / copy mirror config.
/// Designed to be delegated to ER for fast mutation.
#[account]
#[derive(InitSpace)]
pub struct StrategyConfig {
    pub owner: Pubkey,
    pub strategy_id: u64,
    pub copy_percentage: u16,
    pub max_leverage: u16,
    pub auto_sl_bps: u16,
    pub last_execution_slot: u64,
    pub delegated: bool,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Strategy is not delegated")]
    NotDelegated,
    #[msg("Unauthorized")]
    Unauthorized,
}
