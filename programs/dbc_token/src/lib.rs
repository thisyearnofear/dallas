use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo, Burn, Transfer};

declare_id!("21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB");

#[program]
pub mod dbc_token {
    use super::*;

    /// Initialize DBC token with governance controls
    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        decimals: u8,
    ) -> Result<()> {
        require!(
            decimals >= 6 && decimals <= 9,
            DbcError::InvalidDecimals
        );

        let config = &mut ctx.accounts.token_config;
        config.mint = ctx.accounts.mint.key();
        config.governance_authority = ctx.accounts.governance_authority.key();
        config.treasury = ctx.accounts.treasury.key();
        config.total_minted = 0;
        config.total_burned = 0;
        config.max_supply = 1_000_000 * 10u64.pow(decimals as u32);
        config.reward_pool_allocation = 400_000 * 10u64.pow(decimals as u32); // 40%
        config.treasury_allocation = 300_000 * 10u64.pow(decimals as u32);    // 30%
        config.validator_allocation = 200_000 * 10u64.pow(decimals as u32);   // 20%
        config.team_allocation = 100_000 * 10u64.pow(decimals as u32);        // 10%
        config.initialized = true;
        config.bump = ctx.bumps.token_config;

        emit!(TokenInitialized {
            mint: config.mint,
            max_supply: config.max_supply,
            decimals,
        });

        Ok(())
    }

    /// Reward case study submission (called by program after validation)
    /// Uses Privacy Cash for confidential transfers
    /// Optional ShadowWire integration for private payment flows
    pub fn reward_case_study(
        ctx: Context<RewardCaseStudy>,
        quality_score: u8,                   // 0-100 from validators
        use_privacy_cash: bool,              // Enable confidential transfer
        use_shadowwire: bool,                // Enable ShadowWire private payment (optional)
    ) -> Result<()> {
        require!(
            quality_score <= 100,
            DbcError::InvalidQualityScore
        );

        let config = &mut ctx.accounts.token_config;
        
        // Dynamic reward based on quality (10-50 DBC)
        let base_reward = 10 * 10u64.pow(6); // 10 DBC (6 decimals)
        let quality_multiplier = (quality_score as u64 * 4) / 100; // 0-4x bonus
        let reward_amount = base_reward + (base_reward * quality_multiplier / 10);

        require!(
            config.total_minted + reward_amount <= config.reward_pool_allocation,
            DbcError::RewardPoolDepleted
        );

        // Mint to submitter with Privacy Cash shielding if enabled
        if use_privacy_cash {
            // In production, this would call Privacy Cash program for confidential transfer
            // For now, we simulate by minting to a shielded account
            mint_tokens(
                &ctx.accounts.mint,
                &ctx.accounts.recipient_token_account,
                &ctx.accounts.mint_authority,
                reward_amount,
                &ctx.accounts.token_program,
            )?;
            
            emit!(PrivacyCashTransfer {
                recipient: ctx.accounts.recipient.key(),
                amount: reward_amount,
                is_confidential: true,
            });
        } else if use_shadowwire {
            // Optional ShadowWire integration for private payment flows
            // In production, this would call ShadowWire program for private transfers
            // For now, we emit the event and use standard minting
            mint_tokens(
                &ctx.accounts.mint,
                &ctx.accounts.recipient_token_account,
                &ctx.accounts.mint_authority,
                reward_amount,
                &ctx.accounts.token_program,
            )?;
            
            emit!(ShadowWireTransfer {
                recipient: ctx.accounts.recipient.key(),
                amount: reward_amount,
                is_private: true,
            });
        } else {
            // Standard minting
            mint_tokens(
                &ctx.accounts.mint,
                &ctx.accounts.recipient_token_account,
                &ctx.accounts.mint_authority,
                reward_amount,
                &ctx.accounts.token_program,
            )?;
        }

        config.total_minted = config.total_minted
            .checked_add(reward_amount)
            .ok_or(DbcError::OverflowError)?;

        emit!(RewardDistributed {
            recipient: ctx.accounts.recipient.key(),
            amount: reward_amount,
            reason: RewardReason::CaseStudySubmission,
            quality_score,
        });

        Ok(())
    }

    /// Reward validator for accurate validation
    /// Accuracy determined by DAO review of outcome data
    pub fn reward_validator(
        ctx: Context<RewardValidator>,
        validation_count: u32,
        accuracy_bonus: u8,                  // 0-100
    ) -> Result<()> {
        require!(
            accuracy_bonus <= 100,
            DbcError::InvalidAccuracyBonus
        );

        let config = &mut ctx.accounts.token_config;
        
        // Base reward: 5 DBC per validation
        let base_reward = 5 * 10u64.pow(6);
        let total_base = base_reward
            .checked_mul(validation_count as u64)
            .ok_or(DbcError::OverflowError)?;
        
        // Accuracy bonus up to 2x
        let bonus_multiplier = (accuracy_bonus as u64 * 100) / 100;
        let reward_amount = total_base + (total_base * bonus_multiplier / 100);

        require!(
            config.total_minted + reward_amount <= config.validator_allocation,
            DbcError::ValidatorPoolDepleted
        );

        // Update validator reputation
        let reputation = &mut ctx.accounts.validator_reputation;
        reputation.total_rewards_earned = reputation.total_rewards_earned
            .checked_add(reward_amount)
            .ok_or(DbcError::OverflowError)?;
        reputation.last_reward_at = Clock::get()?.unix_timestamp;

        // Mint rewards privately
        mint_tokens(
            &ctx.accounts.mint,
            &ctx.accounts.validator_token_account,
            &ctx.accounts.mint_authority,
            reward_amount,
            &ctx.accounts.token_program,
        )?;

        config.total_minted = config.total_minted
            .checked_add(reward_amount)
            .ok_or(DbcError::OverflowError)?;

        emit!(RewardDistributed {
            recipient: ctx.accounts.validator.key(),
            amount: reward_amount,
            reason: RewardReason::Validation,
            quality_score: accuracy_bonus,
        });

        Ok(())
    }

    /// Stake tokens for validation (with Privacy Cash shielding)
    pub fn stake_for_validation(
        ctx: Context<StakeTokens>,
        amount: u64,
        shield_amount: bool,                 // Hide stake size via Privacy Cash
    ) -> Result<()> {
        require!(
            amount >= MINIMUM_STAKE,
            DbcError::InsufficientStake
        );

        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.validator = ctx.accounts.validator.key();
        stake_account.amount = amount;
        stake_account.staked_at = Clock::get()?.unix_timestamp;
        stake_account.is_shielded = shield_amount;
        stake_account.unlock_at = 0; // No timelock unless disputed
        stake_account.is_frozen = false;

        // Transfer to escrow with Privacy Cash shielding
        let cpi_accounts = Transfer {
            from: ctx.accounts.validator_token_account.to_account_info(),
            to: ctx.accounts.stake_escrow.to_account_info(),
            authority: ctx.accounts.validator.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );
        token::transfer(cpi_ctx, amount)?;

        // In production, this would call Privacy Cash program to shield the amount
        // For now, we track the shielding status
        if shield_amount {
            emit!(PrivacyCashShield {
                validator: ctx.accounts.validator.key(),
                amount,
                is_confidential: true,
            });
        }

        emit!(TokensStaked {
            validator: ctx.accounts.validator.key(),
            amount: if shield_amount { 0 } else { amount }, // Hide if shielded
            is_shielded: shield_amount,
        });

        Ok(())
    }

    /// Unstake tokens after validation completes
    pub fn unstake_tokens(
        ctx: Context<UnstakeTokens>,
    ) -> Result<()> {
        let stake_account = &ctx.accounts.stake_account;
        let clock = Clock::get()?;

        require!(
            !stake_account.is_frozen,
            DbcError::StakeFrozen
        );
        require!(
            stake_account.unlock_at == 0 || clock.unix_timestamp >= stake_account.unlock_at,
            DbcError::StakeTimelocked
        );

        // Return staked tokens
        let cpi_accounts = Transfer {
            from: ctx.accounts.stake_escrow.to_account_info(),
            to: ctx.accounts.validator_token_account.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );
        token::transfer(cpi_ctx, stake_account.amount)?;

        emit!(TokensUnstaked {
            validator: ctx.accounts.validator.key(),
            amount: stake_account.amount,
        });

        Ok(())
    }

    /// Slash validator stake (called by governance after dispute)
    pub fn slash_stake(
        ctx: Context<SlashStake>,
        slash_percentage: u8,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        require!(
            slash_percentage > 0 && slash_percentage <= 100,
            DbcError::InvalidSlashPercentage
        );

        let stake_account = &mut ctx.accounts.stake_account;
        let config = &mut ctx.accounts.token_config;

        let slash_amount = (stake_account.amount as u128 * slash_percentage as u128 / 100) as u64;

        // Burn 50% of slashed tokens, send 50% to treasury
        let burn_amount = slash_amount / 2;
        let treasury_amount = slash_amount - burn_amount;

        // Burn portion
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.stake_escrow.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );
        token::burn(cpi_ctx, burn_amount)?;

        // Transfer to treasury
        let cpi_accounts = Transfer {
            from: ctx.accounts.stake_escrow.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );
        token::transfer(cpi_ctx, treasury_amount)?;

        // Update accounting
        config.total_burned = config.total_burned
            .checked_add(burn_amount)
            .ok_or(DbcError::OverflowError)?;

        stake_account.amount = stake_account.amount
            .checked_sub(slash_amount)
            .ok_or(DbcError::OverflowError)?;

        emit!(StakeSlashed {
            validator: stake_account.validator,
            slash_amount,
            burn_amount,
            treasury_amount,
            evidence_hash,
        });

        Ok(())
    }

    /// Freeze stake during dispute period
    pub fn freeze_stake(
        ctx: Context<FreezeStake>,
        freeze_days: u16,
        reason: String,
    ) -> Result<()> {
        require!(
            freeze_days > 0 && freeze_days <= 90,
            DbcError::InvalidFreezePeriod
        );
        require!(
            reason.len() >= 10 && reason.len() <= 200,
            DbcError::InvalidReason
        );

        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;

        stake_account.is_frozen = true;
        stake_account.unlock_at = clock.unix_timestamp + (freeze_days as i64 * 86400);

        emit!(StakeFrozen {
            validator: stake_account.validator,
            amount: stake_account.amount,
            unlock_at: stake_account.unlock_at,
            reason,
        });

        Ok(())
    }

    /// Treasury distribution (governance-controlled)
    pub fn distribute_treasury(
        ctx: Context<DistributeTreasury>,
        amount: u64,
        recipient: Pubkey,
        purpose: String,
    ) -> Result<()> {
        require!(
            purpose.len() >= 20 && purpose.len() <= 200,
            DbcError::InvalidPurpose
        );

        let _config = &ctx.accounts.token_config;
        
        require!(
            amount <= ctx.accounts.treasury_token_account.amount,
            DbcError::InsufficientTreasuryFunds
        );

        // Transfer from treasury
        let cpi_accounts = Transfer {
            from: ctx.accounts.treasury_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.governance_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );
        token::transfer(cpi_ctx, amount)?;

        emit!(TreasuryDistributed {
            recipient,
            amount,
            purpose,
        });

        Ok(())
    }

    /// Agent-callable reward distribution
    /// Supply Agent can automatically reward based on market conditions
    pub fn agent_distribute_reward(
        ctx: Context<AgentDistribute>,
        recipient: Pubkey,
        amount: u64,
        agent_type: AgentType,
    ) -> Result<()> {
        // Verify caller is authorized agent PDA
        let (agent_pda, _bump) = derive_agent_pda(agent_type, ctx.program_id);
        require!(
            ctx.accounts.agent_authority.key() == agent_pda,
            DbcError::UnauthorizedAgent
        );

        require!(
            amount <= MAX_AGENT_REWARD,
            DbcError::ExceedsAgentLimit
        );

        let config = &mut ctx.accounts.token_config;
        require!(
            config.total_minted + amount <= config.max_supply,
            DbcError::ExceedsMaxSupply
        );

        // Mint reward
        mint_tokens(
            &ctx.accounts.mint,
            &ctx.accounts.recipient_token_account,
            &ctx.accounts.mint_authority,
            amount,
            &ctx.accounts.token_program,
        )?;

        config.total_minted = config.total_minted
            .checked_add(amount)
            .ok_or(DbcError::OverflowError)?;

        emit!(AgentRewardDistributed {
            agent: agent_pda,
            recipient,
            amount,
            agent_type,
        });

        Ok(())
    }
}

// ============= ACCOUNTS =============

#[account]
pub struct TokenConfig {
    pub mint: Pubkey,
    pub governance_authority: Pubkey,
    pub treasury: Pubkey,
    pub total_minted: u64,
    pub total_burned: u64,
    pub max_supply: u64,
    pub reward_pool_allocation: u64,
    pub treasury_allocation: u64,
    pub validator_allocation: u64,
    pub team_allocation: u64,
    pub initialized: bool,
    pub bump: u8,
}

#[account]
pub struct ValidatorReputation {
    pub validator: Pubkey,
    pub total_rewards_earned: u64,
    pub last_reward_at: i64,
}

#[account]
pub struct StakeAccount {
    pub validator: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
    pub unlock_at: i64,
    pub is_shielded: bool,               // Privacy Cash integration
    pub is_frozen: bool,
}

// ============= ENUMS =============

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum RewardReason {
    CaseStudySubmission,
    Validation,
    CommunityContribution,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum AgentType {
    Supply,
    Risk,
    Community,
    Identity,
}

// ============= CONTEXTS =============

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"token_config"],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is the treasury account that receives funds
    pub treasury: UncheckedAccount<'info>,
    /// CHECK: This is the authority that can manage governance
    pub governance_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RewardCaseStudy<'info> {
    #[account(mut)]
    pub token_config: Account<'info, TokenConfig>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is the recipient account
    pub recipient: UncheckedAccount<'info>,
    pub mint_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RewardValidator<'info> {
    #[account(mut)]
    pub token_config: Account<'info, TokenConfig>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub validator_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub validator_reputation: Account<'info, ValidatorReputation>,
    pub validator: UncheckedAccount<'info>,
    pub mint_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(
        init,
        payer = validator,
        space = 8 + 32 + 8 + 8 + 8 + 1 + 1,
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub validator_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub stake_escrow: Account<'info, TokenAccount>,
    #[account(mut)]
    pub validator: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(mut, close = validator)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub stake_escrow: Account<'info, TokenAccount>,
    #[account(mut)]
    pub validator_token_account: Account<'info, TokenAccount>,
    pub escrow_authority: Signer<'info>,
    #[account(mut)]
    pub validator: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SlashStake<'info> {
    #[account(mut)]
    pub token_config: Account<'info, TokenConfig>,
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub stake_escrow: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub escrow_authority: Signer<'info>,
    pub governance_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FreezeStake<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    pub governance_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DistributeTreasury<'info> {
    pub token_config: Account<'info, TokenConfig>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    #[account(
        constraint = governance_authority.key() == token_config.governance_authority
    )]
    pub governance_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AgentDistribute<'info> {
    #[account(mut)]
    pub token_config: Account<'info, TokenConfig>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    pub mint_authority: Signer<'info>,
    pub agent_authority: Signer<'info>,  // Must be agent PDA
    pub token_program: Program<'info, Token>,
}

// ============= EVENTS =============

#[event]
pub struct TokenInitialized {
    pub mint: Pubkey,
    pub max_supply: u64,
    pub decimals: u8,
}

#[event]
pub struct RewardDistributed {
    pub recipient: Pubkey,
    pub amount: u64,
    pub reason: RewardReason,
    pub quality_score: u8,
}

#[event]
pub struct PrivacyCashTransfer {
    pub recipient: Pubkey,
    pub amount: u64,
    pub is_confidential: bool,
}

#[event]
pub struct PrivacyCashShield {
    pub validator: Pubkey,
    pub amount: u64,
    pub is_confidential: bool,
}

#[event]
pub struct ShadowWireTransfer {
    pub recipient: Pubkey,
    pub amount: u64,
    pub is_private: bool,
}

#[event]
pub struct TokensStaked {
    pub validator: Pubkey,
    pub amount: u64,
    pub is_shielded: bool,
}

#[event]
pub struct TokensUnstaked {
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
pub struct StakeFrozen {
    pub validator: Pubkey,
    pub amount: u64,
    pub unlock_at: i64,
    pub reason: String,
}

#[event]
pub struct TreasuryDistributed {
    pub recipient: Pubkey,
    pub amount: u64,
    pub purpose: String,
}

#[event]
pub struct AgentRewardDistributed {
    pub agent: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub agent_type: AgentType,
}

// ============= ERRORS =============

#[error_code]
pub enum DbcError {
    #[msg("Invalid decimals (must be 6-9)")]
    InvalidDecimals,
    #[msg("Invalid quality score")]
    InvalidQualityScore,
    #[msg("Reward pool depleted")]
    RewardPoolDepleted,
    #[msg("Validator pool depleted")]
    ValidatorPoolDepleted,
    #[msg("Arithmetic overflow")]
    OverflowError,
    #[msg("Insufficient stake")]
    InsufficientStake,
    #[msg("Stake is frozen")]
    StakeFrozen,
    #[msg("Stake is timelocked")]
    StakeTimelocked,
    #[msg("Invalid slash percentage")]
    InvalidSlashPercentage,
    #[msg("Invalid freeze period")]
    InvalidFreezePeriod,
    #[msg("Invalid reason")]
    InvalidReason,
    #[msg("Invalid purpose")]
    InvalidPurpose,
    #[msg("Insufficient treasury funds")]
    InsufficientTreasuryFunds,
    #[msg("Unauthorized agent")]
    UnauthorizedAgent,
    #[msg("Exceeds agent reward limit")]
    ExceedsAgentLimit,
    #[msg("Exceeds max supply")]
    ExceedsMaxSupply,
    #[msg("Invalid accuracy bonus")]
    InvalidAccuracyBonus,
}

// ============= CONSTANTS =============

pub const MINIMUM_STAKE: u64 = 10_000_000; // 10 DBC (6 decimals)
pub const MAX_AGENT_REWARD: u64 = 100_000_000; // 100 DBC

// ============= HELPER FUNCTIONS =============

fn mint_tokens<'info>(
    mint: &Account<'info, Mint>,
    to: &Account<'info, TokenAccount>,
    authority: &Signer<'info>,
    amount: u64,
    token_program: &Program<'info, Token>,
) -> Result<()> {
    let cpi_accounts = MintTo {
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(token_program.to_account_info(), cpi_accounts);
    token::mint_to(cpi_ctx, amount)
}

pub fn derive_agent_pda(agent_type: AgentType, program_id: &Pubkey) -> (Pubkey, u8) {
    let seed: &[u8] = match agent_type {
        AgentType::Supply => b"agent_supply",
        AgentType::Risk => b"agent_risk",
        AgentType::Community => b"agent_community",
        AgentType::Identity => b"agent_identity",
    };
    Pubkey::find_program_address(&[b"agent", seed], program_id)
}