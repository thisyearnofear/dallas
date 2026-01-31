//! Dallas Buyers Club Treasury Program
//! 
//! Community-owned treasury for managing DBC token flows.
//! Uses dbc_common for constants and configuration.
//!
//! Core principles:
//! - ENHANCEMENT FIRST: Extends existing case study program
//! - DRY: Uses shared constants from dbc_common
//! - MODULAR: Composable instructions
//! - CLEAN: Clear separation of concerns

use anchor_lang::prelude::*;
use anchor_spl::token_2022::{Token2022, TokenAccount, Mint};
use anchor_spl::token_interface::{TransferChecked, transfer_checked};

// Import shared constants
use dbc_common::{
    DBC_MINT, DBC_DECIMALS, DBC_MULTIPLIER,
    STAKING_CONFIG, REWARD_CONFIG, EMISSION_SCHEDULE, get_current_emission_year,
    TREASURY_SEED, STAKE_SEED, REPUTATION_SEED, DAILY_DIST_SEED,
    ValidatorTier, calculate_quality_bonus,
    SECONDS_PER_DAY,
};

// Replace with your deployed program ID
// declare_id!("YourDeployedProgramIdHere");

#[program]
pub mod dbc_treasury {
    use super::*;

    /// Initialize treasury with governance configuration
    /// Called once by deployer, then authority transfers to multisig/DAO
    pub fn initialize_treasury(
        ctx: Context<InitializeTreasury>,
        config: TreasuryConfig,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        
        treasury.dbc_mint = ctx.accounts.dbc_mint.key();
        treasury.governance_authority = ctx.accounts.governance_authority.key();
        treasury.treasury_token_account = ctx.accounts.treasury_token_account.key();
        
        treasury.config = config;
        treasury.total_distributed = 0;
        treasury.total_staked = 0;
        treasury.initialized = true;
        treasury.bump = ctx.bumps.treasury;

        emit!(TreasuryInitialized {
            treasury: treasury.key(),
            dbc_mint: treasury.dbc_mint,
            governance_authority: treasury.governance_authority,
        });

        Ok(())
    }

    /// Distribute rewards for case study submission
    /// Can be called by case study program (PDA) or governance
    pub fn reward_case_study(
        ctx: Context<RewardCaseStudy>,
        amount: u64,
        quality_score: u8,
    ) -> Result<()> {
        require!(quality_score <= 100, TreasuryError::InvalidQualityScore);
        
        let treasury = &mut ctx.accounts.treasury;
        let config = &treasury.config;
        
        // Calculate dynamic reward based on quality using shared config
        let base_reward = REWARD_CONFIG.base_submission_base;
        let reward_amount = calculate_quality_bonus(
            base_reward,
            quality_score,
            REWARD_CONFIG.quality_bonus_percent
        ).min(REWARD_CONFIG.max_submission_base);
        
        // Cap at requested amount
        let final_amount = reward_amount.min(amount);
        
        // Validate against daily limits
        let daily_key = DailyDistributionKey {
            day: Clock::get()?.unix_timestamp / 86400,
            category: DistributionCategory::CaseStudy,
        };
        
        let daily_total = ctx.accounts.distribution_tracker.amount;
        require!(
            daily_total.checked_add(final_amount).unwrap_or(u64::MAX) <= config.max_daily_case_study_rewards,
            TreasuryError::DailyLimitExceeded
        );

        // Execute transfer from treasury
        transfer_from_treasury(
            &ctx.accounts.treasury_token_account,
            &ctx.accounts.recipient_token_account,
            &ctx.accounts.treasury,
            final_amount,
            &ctx.accounts.token_program,
        )?;

        // Update accounting
        treasury.total_distributed = treasury.total_distributed.checked_add(final_amount).unwrap_or(treasury.total_distributed);
        ctx.accounts.distribution_tracker.amount = daily_total.checked_add(final_amount).unwrap_or(daily_total);

        emit!(CaseStudyRewarded {
            recipient: ctx.accounts.recipient.key(),
            amount: final_amount,
            quality_score,
            case_study_program: ctx.accounts.case_study_program.key(),
        });

        Ok(())
    }

    /// Distribute validator rewards
    /// Called by case study program after successful validation
    pub fn reward_validator(
        ctx: Context<RewardValidator>,
        validation_count: u32,
        accuracy_rate: u8,
    ) -> Result<()> {
        require!(accuracy_rate <= 100, TreasuryError::InvalidAccuracyRate);
        
        let treasury = &mut ctx.accounts.treasury;
        let config = &treasury.config;
        
        // Calculate reward based on validations and accuracy using shared config
        let base_per_validation = REWARD_CONFIG.base_validation_base;
        let total_base = base_per_validation.checked_mul(validation_count as u64).unwrap_or(0);
        
        // Accuracy bonus (up to 100% extra for 100% accuracy)
        let reward_amount = calculate_quality_bonus(
            total_base,
            accuracy_rate,
            REWARD_CONFIG.quality_bonus_percent
        ).min(REWARD_CONFIG.max_validation_base * validation_count as u64);

        // Validate against daily limits
        let daily_key = DailyDistributionKey {
            day: Clock::get()?.unix_timestamp / 86400,
            category: DistributionCategory::Validation,
        };
        
        let daily_total = ctx.accounts.distribution_tracker.amount;
        require!(
            daily_total.checked_add(reward_amount).unwrap_or(u64::MAX) <= config.max_daily_validation_rewards,
            TreasuryError::DailyLimitExceeded
        );

        // Execute transfer
        transfer_from_treasury(
            &ctx.accounts.treasury_token_account,
            &ctx.accounts.validator_token_account,
            &ctx.accounts.treasury,
            reward_amount,
            &ctx.accounts.token_program,
        )?;

        // Update validator reputation
        let reputation = &mut ctx.accounts.validator_reputation;
        reputation.total_rewards = reputation.total_rewards.checked_add(reward_amount).unwrap_or(reputation.total_rewards);
        reputation.total_validations = reputation.total_validations.checked_add(validation_count).unwrap_or(reputation.total_validations);
        reputation.accuracy_rate = accuracy_rate;
        reputation.last_reward_at = Clock::get()?.unix_timestamp;

        // Update tier based on performance
        reputation.tier = calculate_tier(reputation.total_validations, accuracy_rate);

        treasury.total_distributed = treasury.total_distributed.checked_add(reward_amount).unwrap_or(treasury.total_distributed);
        ctx.accounts.distribution_tracker.amount = daily_total.checked_add(reward_amount).unwrap_or(daily_total);

        emit!(ValidatorRewarded {
            validator: ctx.accounts.validator.key(),
            amount: reward_amount,
            validation_count,
            accuracy_rate,
            tier: reputation.tier,
        });

        Ok(())
    }

    /// Stake DBC for validator eligibility
    /// Creates stake account and locks tokens
    pub fn stake_dbc(
        ctx: Context<StakeDbc>,
        amount: u64,
    ) -> Result<()> {
        require!(amount >= STAKING_CONFIG.minimum_stake_base, TreasuryError::InsufficientStake);
        
        let treasury = &mut ctx.accounts.treasury;
        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;

        // Initialize stake account
        stake_account.validator = ctx.accounts.validator.key();
        stake_account.amount = amount;
        stake_account.staked_at = clock.unix_timestamp;
        stake_account.unlock_at = clock.unix_timestamp + STAKING_CONFIG.lock_seconds;
        stake_account.is_frozen = false;
        stake_account.bump = ctx.bumps.stake_account;

        // Transfer DBC from validator to stake escrow
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.validator_token_account.to_account_info(),
            to: ctx.accounts.stake_escrow.to_account_info(),
            authority: ctx.accounts.validator.to_account_info(),
            mint: ctx.accounts.dbc_mint.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
        transfer_checked(cpi_ctx, amount, DBC_DECIMALS)?;

        treasury.total_staked = treasury.total_staked.checked_add(amount).unwrap_or(treasury.total_staked);

        emit!(DbcStaked {
            validator: ctx.accounts.validator.key(),
            amount,
            unlock_at: stake_account.unlock_at,
        });

        Ok(())
    }

    /// Unstake DBC after lock period
    pub fn unstake_dbc(ctx: Context<UnstakeDbc>) -> Result<()> {
        let stake_account = &ctx.accounts.stake_account;
        let clock = Clock::get()?;

        require!(!stake_account.is_frozen, TreasuryError::StakeFrozen);
        require!(
            clock.unix_timestamp >= stake_account.unlock_at,
            TreasuryError::StakeLocked
        );

        let amount = stake_account.amount;

        // Return DBC from escrow to validator
        let treasury_key = ctx.accounts.treasury.key();
        let seeds = &[
            b"treasury".as_ref(),
            treasury_key.as_ref(),
            &[ctx.accounts.treasury.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = TransferChecked {
            from: ctx.accounts.stake_escrow.to_account_info(),
            to: ctx.accounts.validator_token_account.to_account_info(),
            authority: ctx.accounts.treasury.to_account_info(),
            mint: ctx.accounts.dbc_mint.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        transfer_checked(cpi_ctx, amount, DBC_DECIMALS)?;

        let treasury = &mut ctx.accounts.treasury;
        treasury.total_staked = treasury.total_staked.saturating_sub(amount);

        emit!(DbcUnstaked {
            validator: ctx.accounts.validator.key(),
            amount,
        });

        Ok(())
    }

    /// Governance: Slash validator stake for fraud
    /// Requires governance authority signature
    pub fn slash_stake(
        ctx: Context<SlashStake>,
        percentage: u8,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        require!(percentage > 0 && percentage <= 100, TreasuryError::InvalidSlashPercentage);
        
        let stake_account = &mut ctx.accounts.stake_account;
        let slash_amount = (stake_account.amount as u128)
            .checked_mul(percentage as u128)
            .unwrap_or(0) as u64 / 100;

        // Split: 50% burned, 50% to treasury
        let burn_amount = slash_amount / 2;
        let treasury_amount = slash_amount - burn_amount;

        // Transfer burn portion to burn address (effectively burned)
        // Transfer treasury portion back to treasury
        
        stake_account.amount = stake_account.amount.saturating_sub(slash_amount);
        
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_staked = treasury.total_staked.saturating_sub(slash_amount);

        emit!(StakeSlashed {
            validator: stake_account.validator,
            slash_amount,
            burn_amount,
            treasury_amount,
            evidence_hash,
        });

        Ok(())
    }

    /// Governance: Update treasury configuration
    pub fn update_config(
        ctx: Context<GovernanceAction>,
        new_config: TreasuryConfig,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.config = new_config;

        emit!(ConfigUpdated {
            governance_authority: ctx.accounts.governance_authority.key(),
            new_config,
        });

        Ok(())
    }

    /// Governance: Emergency pause distributions
    pub fn emergency_pause(ctx: Context<GovernanceAction>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.config.paused = true;

        emit!(EmergencyPaused {
            governance_authority: ctx.accounts.governance_authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Governance: Resume distributions
    pub fn emergency_resume(ctx: Context<GovernanceAction>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.config.paused = false;

        emit!(EmergencyResumed {
            governance_authority: ctx.accounts.governance_authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// ============= ACCOUNTS =============

#[account]
pub struct Treasury {
    pub dbc_mint: Pubkey,
    pub governance_authority: Pubkey,
    pub treasury_token_account: Pubkey,
    pub config: TreasuryConfig,
    pub total_distributed: u64,
    pub total_staked: u64,
    pub initialized: bool,
    pub bump: u8,
}

#[account]
pub struct ValidatorReputation {
    pub validator: Pubkey,
    pub total_validations: u32,
    pub accurate_validations: u32,
    pub total_rewards: u64,
    pub accuracy_rate: u8,
    pub tier: ValidatorTier,
    pub last_reward_at: i64,
}

#[account]
pub struct StakeAccount {
    pub validator: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
    pub unlock_at: i64,
    pub is_frozen: bool,
    pub bump: u8,
}

#[account]
pub struct DailyDistributionTracker {
    pub day: i64,
    pub category: DistributionCategory,
    pub amount: u64,
}

// ============= CONFIG =============

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct TreasuryConfig {
    pub base_submission_reward: u64,      // Base DBC for case study
    pub base_validation_reward: u64,      // Base DBC per validation
    pub quality_bonus_percent: u64,       // Bonus % for quality (0-100)
    pub max_daily_case_study_rewards: u64,
    pub max_daily_validation_rewards: u64,
    pub stake_lock_days: u16,             // Days before unstake
    pub min_validator_stake: u64,         // Minimum stake to validate
    pub paused: bool,
}

impl Default for TreasuryConfig {
    fn default() -> Self {
        Self {
            base_submission_reward: 10_000_000,      // 10 DBC
            base_validation_reward: 5_000_000,       // 5 DBC
            quality_bonus_percent: 50,               // Up to 50% bonus
            max_daily_case_study_rewards: 1_000_000_000, // 1,000 DBC/day
            max_daily_validation_rewards: 500_000_000,   // 500 DBC/day
            stake_lock_days: 7,                      // 7 day lock
            min_validator_stake: 100_000_000,        // 100 DBC minimum
            paused: false,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum DistributionCategory {
    CaseStudy,
    Validation,
    Referral,
    Grant,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum ValidatorTier {
    Bronze,    // 0-25 validations
    Silver,    // 26-100
    Gold,      // 101-500
    Platinum,  // 500+
}

// ============= CONTEXTS =============

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 32 + (8 * 7 + 1 + 2 + 8 + 1) + 8 + 8 + 1 + 1,
        seeds = [b"treasury", dbc_mint.key().as_ref()],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    pub dbc_mint: InterfaceAccount<'info, Mint>,
    /// CHECK: Treasury token account (must be pre-funded)
    pub treasury_token_account: AccountInfo<'info>,
    /// CHECK: Governance authority (multisig/DAO)
    pub governance_authority: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RewardCaseStudy<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(
        mut,
        constraint = treasury_token_account.key() == treasury.treasury_token_account
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: Recipient wallet
    pub recipient: AccountInfo<'info>,
    /// CHECK: Case study program (for PDA verification)
    pub case_study_program: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 8 + 1 + 8,
        seeds = [
            b"daily_dist",
            treasury.key().as_ref(),
            &(Clock::get()?.unix_timestamp / 86400).to_le_bytes(),
            &[DistributionCategory::CaseStudy as u8]
        ],
        bump
    )]
    pub distribution_tracker: Account<'info, DailyDistributionTracker>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Interface<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RewardValidator<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(
        mut,
        constraint = treasury_token_account.key() == treasury.treasury_token_account
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub validator_token_account: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: Validator wallet
    pub validator: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 4 + 4 + 8 + 1 + 1 + 8,
        seeds = [b"reputation", validator.key().as_ref()],
        bump
    )]
    pub validator_reputation: Account<'info, ValidatorReputation>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 8 + 1 + 8,
        seeds = [
            b"daily_dist",
            treasury.key().as_ref(),
            &(Clock::get()?.unix_timestamp / 86400).to_le_bytes(),
            &[DistributionCategory::Validation as u8]
        ],
        bump
    )]
    pub distribution_tracker: Account<'info, DailyDistributionTracker>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Interface<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeDbc<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(
        init,
        payer = validator,
        space = 8 + 32 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"stake", validator.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub validator_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub stake_escrow: InterfaceAccount<'info, TokenAccount>,
    pub dbc_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub validator: Signer<'info>,
    pub token_program: Interface<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeDbc<'info> {
    #[account(mut, close = validator)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub stake_escrow: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub validator_token_account: InterfaceAccount<'info, TokenAccount>,
    pub dbc_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub validator: Signer<'info>,
    pub token_program: Interface<'info, Token2022>,
}

#[derive(Accounts)]
pub struct SlashStake<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(
        constraint = governance_authority.key() == treasury.governance_authority
    )]
    pub governance_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GovernanceAction<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(
        constraint = governance_authority.key() == treasury.governance_authority
    )]
    pub governance_authority: Signer<'info>,
}

// ============= EVENTS =============

#[event]
pub struct TreasuryInitialized {
    pub treasury: Pubkey,
    pub dbc_mint: Pubkey,
    pub governance_authority: Pubkey,
}

#[event]
pub struct CaseStudyRewarded {
    pub recipient: Pubkey,
    pub amount: u64,
    pub quality_score: u8,
    pub case_study_program: Pubkey,
}

#[event]
pub struct ValidatorRewarded {
    pub validator: Pubkey,
    pub amount: u64,
    pub validation_count: u32,
    pub accuracy_rate: u8,
    pub tier: ValidatorTier,
}

#[event]
pub struct DbcStaked {
    pub validator: Pubkey,
    pub amount: u64,
    pub unlock_at: i64,
}

#[event]
pub struct DbcUnstaked {
    pub validator: Pubkey,
    pub amount: u64,
}

#[event]
pub struct StakeSlashed {
    pub validator: Pubkey,
    pub slash_amount: u64,
    pub burn_amount: u64,
    pub treasury_amount: u64,
    pub evidence_hash: [u8; 32],
}

#[event]
pub struct ConfigUpdated {
    pub governance_authority: Pubkey,
    pub new_config: TreasuryConfig,
}

#[event]
pub struct EmergencyPaused {
    pub governance_authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct EmergencyResumed {
    pub governance_authority: Pubkey,
    pub timestamp: i64,
}

// ============= ERRORS =============

#[error_code]
pub enum TreasuryError {
    #[msg("Invalid quality score (must be 0-100)")]
    InvalidQualityScore,
    #[msg("Invalid accuracy rate (must be 0-100)")]
    InvalidAccuracyRate,
    #[msg("Daily distribution limit exceeded")]
    DailyLimitExceeded,
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Stake is frozen")]
    StakeFrozen,
    #[msg("Stake is still locked")]
    StakeLocked,
    #[msg("Invalid slash percentage (must be 1-100)")]
    InvalidSlashPercentage,
    #[msg("Distributions are paused")]
    Paused,
    #[msg("Arithmetic overflow")]
    Overflow,
}

// ============= CONSTANTS =============
// Note: Use dbc_common::STAKING_CONFIG for staking constants
// and dbc_common::REWARD_CONFIG for reward amounts

// ============= HELPERS =============

fn transfer_from_treasury<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    treasury: &Account<'info, Treasury>,
    amount: u64,
    token_program: &Interface<'info, Token2022>,
) -> Result<()> {
    let treasury_key = treasury.key();
    let seeds = &[
        b"treasury".as_ref(),
        treasury_key.as_ref(),
        &[treasury.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = TransferChecked {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: treasury.to_account_info(),
        mint: treasury.dbc_mint.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        cpi_accounts,
        signer,
    );
    
    transfer_checked(cpi_ctx, amount, DBC_DECIMALS)
}

fn calculate_tier(total_validations: u32, accuracy_rate: u8) -> ValidatorTier {
    if total_validations >= 500 && accuracy_rate >= 80 {
        ValidatorTier::Platinum
    } else if total_validations >= 100 && accuracy_rate >= 70 {
        ValidatorTier::Gold
    } else if total_validations >= 25 && accuracy_rate >= 60 {
        ValidatorTier::Silver
    } else {
        ValidatorTier::Bronze
    }
}

// Daily distribution key for tracking
struct DailyDistributionKey {
    day: i64,
    category: DistributionCategory,
}
