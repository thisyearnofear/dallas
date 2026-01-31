//! Dallas Buyers Club - Membership Program
//! 
//! Mint membership NFTs that grant access to token-gated features.
//! Each tier (Bronze/Silver/Gold) has different benefits.

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo};
use dbc_common::{ValidatorTier, STAKING_CONFIG};

// Replace with your deployed program ID
// declare_id!("YourDeployedProgramIdHere");

#[program]
pub mod membership {
    use super::*;

    /// Initialize membership program
    pub fn initialize(
        ctx: Context<Initialize>,
        bronze_price: u64,    // in lamports (SOL)
        silver_price: u64,
        gold_price: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = ctx.accounts.treasury.key();
        config.bronze_price = bronze_price;
        config.silver_price = silver_price;
        config.gold_price = gold_price;
        config.initialized = true;
        config.bump = ctx.bumps.config;

        emit!(ProgramInitialized {
            authority: config.authority,
            treasury: config.treasury,
            bronze_price,
            silver_price,
            gold_price,
        });

        Ok(())
    }

    /// Purchase membership - mints NFT and stores profile
    pub fn purchase_membership(
        ctx: Context<PurchaseMembership>,
        tier: MembershipTier,
        nickname: String,
        health_focus: Option<String>,
    ) -> Result<()> {
        require!(nickname.len() >= 3 && nickname.len() <= 32, MembershipError::InvalidNickname);
        
        let config = &ctx.accounts.config;
        let price = match tier {
            MembershipTier::Bronze => config.bronze_price,
            MembershipTier::Silver => config.silver_price,
            MembershipTier::Gold => config.gold_price,
        };

        // Transfer SOL to treasury
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.member.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, price)?;

        // Create membership account
        let membership = &mut ctx.accounts.membership;
        membership.member = ctx.accounts.member.key();
        membership.tier = tier;
        membership.nickname = nickname.clone();
        membership.health_focus = health_focus.clone().unwrap_or_default();
        membership.purchased_at = Clock::get()?.unix_timestamp;
        membership.expires_at = membership.purchased_at + (365 * 86400); // 1 year
        membership.is_active = true;
        membership.bump = ctx.bumps.membership;

        // Mint membership NFT
        let tier_name = tier.name();
        let seeds = &[
            b"membership_mint",
            tier_name.as_bytes(),
            &[ctx.bumps.membership_mint],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.membership_mint.to_account_info(),
            to: ctx.accounts.member_token_account.to_account_info(),
            authority: ctx.accounts.membership_mint.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::mint_to(cpi_ctx, 1)?; // NFT = 1 token

        emit!(MembershipPurchased {
            member: ctx.accounts.member.key(),
            tier,
            nickname,
            health_focus,
            price,
        });

        Ok(())
    }

    /// Renew membership (extends expiration)
    pub fn renew_membership(
        ctx: Context<RenewMembership>,
    ) -> Result<()> {
        let membership = &mut ctx.accounts.membership;
        let config = &ctx.accounts.config;
        
        require!(membership.is_active, MembershipError::MembershipExpired);

        let price = match membership.tier {
            MembershipTier::Bronze => config.bronze_price,
            MembershipTier::Silver => config.silver_price,
            MembershipTier::Gold => config.gold_price,
        };

        // Transfer SOL for renewal
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.member.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, price)?;

        // Extend expiration
        membership.expires_at = membership.expires_at + (365 * 86400);

        emit!(MembershipRenewed {
            member: ctx.accounts.member.key(),
            tier: membership.tier,
            new_expiration: membership.expires_at,
        });

        Ok(())
    }

    /// Update profile (nickname, health focus)
    pub fn update_profile(
        ctx: Context<UpdateProfile>,
        nickname: Option<String>,
        health_focus: Option<String>,
    ) -> Result<()> {
        let membership = &mut ctx.accounts.membership;

        if let Some(new_nickname) = nickname {
            require!(new_nickname.len() >= 3 && new_nickname.len() <= 32, MembershipError::InvalidNickname);
            membership.nickname = new_nickname;
        }

        if let Some(new_focus) = health_focus {
            membership.health_focus = new_focus;
        }

        emit!(ProfileUpdated {
            member: ctx.accounts.member.key(),
            nickname: membership.nickname.clone(),
            health_focus: membership.health_focus.clone(),
        });

        Ok(())
    }
}

// ============= ACCOUNTS =============

#[account]
pub struct Config {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub bronze_price: u64,    // in lamports
    pub silver_price: u64,
    pub gold_price: u64,
    pub initialized: bool,
    pub bump: u8,
}

#[account]
pub struct Membership {
    pub member: Pubkey,
    pub tier: MembershipTier,
    pub nickname: String,           // 3-32 chars
    pub health_focus: String,       // e.g., "immune", "chronic pain"
    pub purchased_at: i64,
    pub expires_at: i64,
    pub is_active: bool,
    pub bump: u8,
}

// ============= ENUMS =============

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MembershipTier {
    Bronze = 0,
    Silver = 1,
    Gold = 2,
}

impl MembershipTier {
    pub fn name(&self) -> &'static str {
        match self {
            MembershipTier::Bronze => "Bronze",
            MembershipTier::Silver => "Silver",
            MembershipTier::Gold => "Gold",
        }
    }

    pub fn discount_percent(&self) -> u8 {
        match self {
            MembershipTier::Bronze => 5,
            MembershipTier::Silver => 10,
            MembershipTier::Gold => 20,
        }
    }
}

// ============= CONTEXTS =============

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    /// CHECK: Treasury account that receives payments
    pub treasury: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tier: MembershipTier, nickname: String, health_focus: Option<String>)]
pub struct PurchaseMembership<'info> {
    #[account(mut)]
    pub config: Account<'info, Config>,
    #[account(
        init,
        payer = member,
        space = 8 + 32 + 1 + 4 + 32 + 4 + 100 + 8 + 8 + 1 + 1,
        seeds = [b"membership", member.key().as_ref()],
        bump
    )]
    pub membership: Account<'info, Membership>,
    #[account(
        init,
        payer = member,
        seeds = [b"membership_mint", tier.name().as_bytes()],
        bump,
        mint::decimals = 0,
        mint::authority = membership_mint,
    )]
    pub membership_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = member,
        associated_token::mint = membership_mint,
        associated_token::authority = member,
    )]
    pub member_token_account: Account<'info, TokenAccount>,
    /// CHECK: Treasury account
    #[account(mut, address = config.treasury)]
    pub treasury: UncheckedAccount<'info>,
    #[account(mut)]
    pub member: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RenewMembership<'info> {
    #[account(mut)]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [b"membership", member.key().as_ref()],
        bump = membership.bump,
        has_one = member,
    )]
    pub membership: Account<'info, Membership>,
    /// CHECK: Treasury account
    #[account(mut, address = config.treasury)]
    pub treasury: UncheckedAccount<'info>,
    #[account(mut)]
    pub member: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(
        mut,
        seeds = [b"membership", member.key().as_ref()],
        bump = membership.bump,
        has_one = member,
    )]
    pub membership: Account<'info, Membership>,
    pub member: Signer<'info>,
}

// ============= EVENTS =============

#[event]
pub struct ProgramInitialized {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub bronze_price: u64,
    pub silver_price: u64,
    pub gold_price: u64,
}

#[event]
pub struct MembershipPurchased {
    pub member: Pubkey,
    pub tier: MembershipTier,
    pub nickname: String,
    pub health_focus: Option<String>,
    pub price: u64,
}

#[event]
pub struct MembershipRenewed {
    pub member: Pubkey,
    pub tier: MembershipTier,
    pub new_expiration: i64,
}

#[event]
pub struct ProfileUpdated {
    pub member: Pubkey,
    pub nickname: String,
    pub health_focus: String,
}

// ============= ERRORS =============

#[error_code]
pub enum MembershipError {
    #[msg("Invalid nickname (must be 3-32 characters)")]
    InvalidNickname,
    #[msg("Membership expired")]
    MembershipExpired,
    #[msg("Already has active membership")]
    AlreadyMember,
    #[msg("Invalid tier")]
    InvalidTier,
}
