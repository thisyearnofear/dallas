//! Dallas Buyers Club: Governance Program
//!
//! On-chain governance for DBC token holders.
//! Allows proposals, voting, and execution of protocol changes.
//!
//! Core features:
//! - Proposal creation by token holders
//! - Voting with token weight
//! - Timelock for execution
//! - Quorum requirements

use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};

declare_id!("DBCGoVFq5xGnD1WNCLauKoFG4Y4Rw3xPp3z3t8X6w3x");

#[program]
pub mod dbc_governance {
    use super::*;

    /// Initialize governance configuration
    pub fn initialize_governance(
        ctx: Context<InitializeGovernance>,
        config: GovernanceConfig,
    ) -> Result<()> {
        let governance = &mut ctx.accounts.governance;

        governance.dbc_mint = ctx.accounts.dbc_mint.key();
        governance.governance_authority = ctx.accounts.authority.key();
        governance.config = config;
        governance.proposal_count = 0;
        governance.initialized = true;
        governance.bump = ctx.bumps.governance;

        emit!(GovernanceInitialized {
            authority: governance.governance_authority,
            proposal_threshold: config.proposal_threshold,
            voting_period: config.voting_period,
            execution_delay: config.execution_delay,
            quorum_threshold: config.quorum_threshold,
        });

        Ok(())
    }

    /// Create a new governance proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: ProposalType,
    ) -> Result<()> {
        let governance = &ctx.accounts.governance;
        let proposal = &mut ctx.accounts.proposal;

        require!(
            governance.initialized,
            GovernanceError::GovernanceNotInitialized
        );

        require!(
            title.len() >= 5 && title.len() <= 100,
            GovernanceError::InvalidTitle
        );

        require!(
            description.len() >= 20 && description.len() <= 1000,
            GovernanceError::InvalidDescription
        );

        // Check token balance for proposal threshold
        let voter_token_account = &ctx.accounts.voter_token_account;
        require!(
            voter_token_account.amount >= governance.config.proposal_threshold,
            GovernanceError::InsufficientTokensForProposal
        );

        let clock = Clock::get()?;

        proposal.proposer = ctx.accounts.proposer.key();
        proposal.governance = governance.key();
        proposal.title = title;
        proposal.description = description;
        proposal.proposal_type = proposal_type;
        proposal.state = ProposalState::Draft;
        proposal.for_votes = 0;
        proposal.against_votes = 0;
        proposal.abstain_votes = 0;
        proposal.voter_count = 0;
        proposal.created_at = clock.unix_timestamp;
        proposal.voting_starts_at = 0;
        proposal.voting_ends_at = 0;
        proposal.execution_at = 0;
        proposal.canceled_at = 0;
        proposal.executed_at = 0;
        proposal.bump = ctx.bumps.proposal;

        // Increment proposal count
        let governance = &mut ctx.accounts.governance;
        governance.proposal_count = governance
            .proposal_count
            .checked_add(1)
            .ok_or(GovernanceError::OverflowError)?;

        emit!(ProposalCreated {
            proposal: proposal.key(),
            proposer: proposal.proposer,
            proposal_type: proposal.proposal_type,
            title: proposal.title.clone(),
        });

        Ok(())
    }

    /// Publish proposal (move from Draft to Active)
    pub fn publish_proposal(ctx: Context<PublishProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;

        require!(
            proposal.state == ProposalState::Draft,
            GovernanceError::InvalidProposalState
        );

        let clock = Clock::get()?;

        proposal.state = ProposalState::Active;
        proposal.voting_starts_at = clock.unix_timestamp;
        proposal.voting_ends_at = clock
            .unix_timestamp
            .checked_add(ctx.accounts.governance.config.voting_period)
            .ok_or(GovernanceError::OverflowError)?;
        proposal.execution_at = proposal
            .voting_ends_at
            .checked_add(ctx.accounts.governance.config.execution_delay)
            .ok_or(GovernanceError::OverflowError)?;

        emit!(ProposalPublished {
            proposal: proposal.key(),
            voting_ends_at: proposal.voting_ends_at,
            execution_at: proposal.execution_at,
        });

        Ok(())
    }

    /// Cast a vote on a proposal
    pub fn cast_vote(ctx: Context<CastVote>, vote: Vote) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let governance = &ctx.accounts.governance;

        require!(
            proposal.state == ProposalState::Active,
            GovernanceError::VotingNotActive
        );

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= proposal.voting_starts_at
                && clock.unix_timestamp < proposal.voting_ends_at,
            GovernanceError::VotingPeriodEnded
        );

        // Get voter's token balance for voting weight
        let voter_tokens = ctx.accounts.voter_token_account.amount;
        require!(voter_tokens > 0, GovernanceError::NoVotingPower);

        // Check if voter has already voted
        let voter_key = ctx.accounts.voter.key();
        let has_voted = ctx.accounts.vote_record.voter == voter_key;

        if has_voted {
            // Update existing vote (remove old vote weight)
            let old_vote = ctx.accounts.vote_record.vote;
            match old_vote {
                Vote::For => {
                    proposal.for_votes = proposal
                        .for_votes
                        .checked_sub(ctx.accounts.vote_record.votes)
                        .ok_or(GovernanceError::UnderflowError)
                }
                Vote::Against => {
                    proposal.against_votes = proposal
                        .against_votes
                        .checked_sub(ctx.accounts.vote_record.votes)
                        .ok_or(GovernanceError::UnderflowError)
                }
                Vote::Abstain => {
                    proposal.abstain_votes = proposal
                        .abstain_votes
                        .checked_sub(ctx.accounts.vote_record.votes)
                        .ok_or(GovernanceError::UnderflowError)
                }
            }?;
            proposal.voter_count = proposal.voter_count.saturating_sub(1);
        }

        // Add new vote weight
        match vote {
            Vote::For => {
                proposal.for_votes = proposal
                    .for_votes
                    .checked_add(voter_tokens)
                    .ok_or(GovernanceError::OverflowError)
            }
            Vote::Against => {
                proposal.against_votes = proposal
                    .against_votes
                    .checked_add(voter_tokens)
                    .ok_or(GovernanceError::OverflowError)
            }
            Vote::Abstain => {
                proposal.abstain_votes = proposal
                    .abstain_votes
                    .checked_add(voter_tokens)
                    .ok_or(GovernanceError::OverflowError)
            }
        }?;

        if !has_voted {
            proposal.voter_count = proposal
                .voter_count
                .checked_add(1)
                .ok_or(GovernanceError::OverflowError)?;
        }

        // Update vote record
        let vote_record = &mut ctx.accounts.vote_record;
        vote_record.proposal = proposal.key();
        vote_record.voter = voter_key;
        vote_record.vote = vote;
        vote_record.votes = voter_tokens;
        vote_record.voted_at = clock.unix_timestamp;

        emit!(VoteCast {
            proposal: proposal.key(),
            voter: voter_key,
            vote: vote,
            votes: voter_tokens,
        });

        Ok(())
    }

    /// Execute a passed proposal
    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;

        require!(
            proposal.state == ProposalState::Active,
            GovernanceError::InvalidProposalState
        );

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= proposal.execution_at,
            GovernanceError::ExecutionDelayNotMet
        );

        // Check quorum
        let total_votes = proposal
            .for_votes
            .checked_add(proposal.against_votes)
            .ok_or(GovernanceError::OverflowError)?
            .checked_add(proposal.abstain_votes)
            .ok_or(GovernanceError::OverflowError)?;

        let governance = &ctx.accounts.governance;
        let total_supply = ctx.accounts.dbc_mint.supply;

        require!(
            total_votes * 100 >= total_supply * governance.config.quorum_threshold,
            GovernanceError::QuorumNotReached
        );

        // Check if for votes won
        require!(
            proposal.for_votes > proposal.against_votes,
            GovernanceError::ProposalRejected
        );

        proposal.state = ProposalState::Executed;
        proposal.executed_at = clock.unix_timestamp;

        emit!(ProposalExecuted {
            proposal: proposal.key(),
            executed_at: proposal.executed_at,
        });

        Ok(())
    }

    /// Cancel a proposal
    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;

        require!(
            proposal.state == ProposalState::Draft || proposal.state == ProposalState::Active,
            GovernanceError::InvalidProposalState
        );

        // Only proposer or governance authority can cancel
        let governance = &ctx.accounts.governance;
        let canceller = ctx.accounts.canceller.key();
        require!(
            canceller == proposal.proposer || canceller == governance.governance_authority,
            GovernanceError::Unauthorized
        );

        let clock = Clock::get()?;
        proposal.state = ProposalState::Canceled;
        proposal.canceled_at = clock.unix_timestamp;

        emit!(ProposalCanceled {
            proposal: proposal.key(),
            canceled_at: proposal.canceled_at,
        });

        Ok(())
    }

    /// Delegate voting power to another address
    pub fn delegate_votes(ctx: Context<DelegateVotes>, delegate: Pubkey) -> Result<()> {
        let delegate_record = &mut ctx.accounts.delegate_record;
        let clock = Clock::get()?;

        delegate_record.delegator = ctx.accounts.delegator.key();
        delegate_record.delegate = delegate;
        delegate_record.votes = ctx.accounts.delegator_token_account.amount;
        delegate_record.delegated_at = clock.unix_timestamp;
        delegate_record.bump = ctx.bumps.delegate_record;

        emit!(VotesDelegated {
            delegator: delegate_record.delegator,
            delegate: delegate,
            votes: delegate_record.votes,
        });

        Ok(())
    }

    /// Withdraw delegated votes
    pub fn withdraw_delegation(ctx: Context<WithdrawDelegation>) -> Result<()> {
        let delegate_record = &mut ctx.accounts.delegate_record;

        require!(
            delegate_record.delegator == ctx.accounts.delegator.key(),
            GovernanceError::Unauthorized
        );

        let zero = Pubkey::default();
        delegate_record.delegate = zero;
        delegate_record.votes = 0;

        emit!(DelegationWithdrawn {
            delegator: delegate_record.delegator,
        });

        Ok(())
    }
}

// ============= ACCOUNTS =============

#[account]
pub struct Governance {
    pub dbc_mint: Pubkey,
    pub governance_authority: Pubkey,
    pub config: GovernanceConfig,
    pub proposal_count: u32,
    pub initialized: bool,
    pub bump: u8,
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,
    pub governance: Pubkey,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub state: ProposalState,
    pub for_votes: u64,
    pub against_votes: u64,
    pub abstain_votes: u64,
    pub voter_count: u32,
    pub created_at: i64,
    pub voting_starts_at: i64,
    pub voting_ends_at: i64,
    pub execution_at: i64,
    pub canceled_at: i64,
    pub executed_at: i64,
    pub bump: u8,
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: Vote,
    pub votes: u64,
    pub voted_at: i64,
}

#[account]
pub struct DelegateRecord {
    pub delegator: Pubkey,
    pub delegate: Pubkey,
    pub votes: u64,
    pub delegated_at: i64,
    pub bump: u8,
}

// ============= STRUCTS =============

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GovernanceConfig {
    pub proposal_threshold: u64, // Min tokens to create proposal
    pub voting_period: i64,      // Seconds to vote
    pub execution_delay: i64,    // Seconds after voting ends before execution
    pub quorum_threshold: u8,    // % of supply that must vote
    pub veto_authority: Option<Pubkey>,
}

impl Default for GovernanceConfig {
    fn default() -> Self {
        Self {
            proposal_threshold: 1_000_000, // 1M DBC to create proposal
            voting_period: 7 * 86400,      // 7 days
            execution_delay: 2 * 86400,    // 2 days
            quorum_threshold: 10,          // 10% quorum
            veto_authority: None,
        }
    }
}

// ============= ENUMS =============

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum ProposalType {
    ParameterChange,
    TreasuryDistribution,
    CommunityGrant,
    ProtocolUpgrade,
    Emergency,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum ProposalState {
    Draft,
    Active,
    Executed,
    Canceled,
    Vetoed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum Vote {
    For,
    Against,
    Abstain,
}

// ============= CONTEXTS =============

#[derive(Accounts)]
pub struct InitializeGovernance<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 4 + 1 + 1 + 32,
        seeds = [b"governance"],
        bump
    )]
    pub governance: Account<'info, Governance>,
    pub dbc_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub governance: Account<'info, Governance>,
    #[account(
        init,
        payer = proposer,
        space = 8 + 32 + 32 + 100 + 1000 + 1 + 1 + 8 + 8 + 8 + 4 + 8 + 8 + 8 + 8 + 8 + 8 + 1,
        seeds = [b"proposal", governance.key().as_ref(), &(governance.proposal_count + 1).to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        mut,
        associated = proposer,
        with = dbc_mint
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    pub dbc_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PublishProposal<'info> {
    #[account(mut)]
    pub governance: Account<'info, Governance>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub proposer: Signer<'info>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub governance: Account<'info, Governance>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + 32 + 32 + 1 + 8 + 8,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(
        mut,
        associated = voter,
        with = dbc_mint
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    pub dbc_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub governance: Account<'info, Governance>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub dbc_mint: Account<'info, anchor_spl::token::Mint>,
    pub executor: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(mut)]
    pub governance: Account<'info, Governance>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub canceller: Signer<'info>,
}

#[derive(Accounts)]
pub struct DelegateVotes<'info> {
    #[account(
        init,
        payer = delegator,
        space = 8 + 32 + 32 + 8 + 8 + 1,
        seeds = [b"delegate", delegator.key().as_ref()],
        bump
    )]
    pub delegate_record: Account<'info, DelegateRecord>,
    #[account(
        mut,
        associated = delegator,
        with = dbc_mint
    )]
    pub delegator_token_account: Account<'info, TokenAccount>,
    pub dbc_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub delegator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawDelegation<'info> {
    #[account(mut)]
    pub delegate_record: Account<'info, DelegateRecord>,
    pub delegator: Signer<'info>,
}

// ============= EVENTS =============

#[event]
pub struct GovernanceInitialized {
    pub authority: Pubkey,
    pub proposal_threshold: u64,
    pub voting_period: i64,
    pub execution_delay: i64,
    pub quorum_threshold: u8,
}

#[event]
pub struct ProposalCreated {
    pub proposal: Pubkey,
    pub proposer: Pubkey,
    pub proposal_type: ProposalType,
    pub title: String,
}

#[event]
pub struct ProposalPublished {
    pub proposal: Pubkey,
    pub voting_ends_at: i64,
    pub execution_at: i64,
}

#[event]
pub struct VoteCast {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: Vote,
    pub votes: u64,
}

#[event]
pub struct ProposalExecuted {
    pub proposal: Pubkey,
    pub executed_at: i64,
}

#[event]
pub struct ProposalCanceled {
    pub proposal: Pubkey,
    pub canceled_at: i64,
}

#[event]
pub struct VotesDelegated {
    pub delegator: Pubkey,
    pub delegate: Pubkey,
    pub votes: u64,
}

#[event]
pub struct DelegationWithdrawn {
    pub delegator: Pubkey,
}

// ============= ERRORS =============

#[error_code]
pub enum GovernanceError {
    #[msg("Governance not initialized")]
    GovernanceNotInitialized,
    #[msg("Invalid title")]
    InvalidTitle,
    #[msg("Invalid description")]
    InvalidDescription,
    #[msg("Insufficient tokens to create proposal")]
    InsufficientTokensForProposal,
    #[msg("Invalid proposal state")]
    InvalidProposalState,
    #[msg("Voting not active")]
    VotingNotActive,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("No voting power")]
    NoVotingPower,
    #[msg("Execution delay not met")]
    ExecutionDelayNotMet,
    #[msg("Quorum not reached")]
    QuorumNotReached,
    #[msg("Proposal was rejected")]
    ProposalRejected,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    OverflowError,
    #[msg("Arithmetic underflow")]
    UnderflowError,
}
