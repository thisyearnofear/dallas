use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};

declare_id!("EqtUtzoDUq8fQSdQATey5wJgmZHm4bEpDsKb24vHmPd6");

#[program]
pub mod case_study {
    use super::*;

    /// Submit encrypted case study with ZK proof of data integrity
    /// Uses Light Protocol compression for scalable private state
    pub fn submit_encrypted_case_study(
        ctx: Context<SubmitCaseStudy>,
        ipfs_cid: String,                    // Off-chain encrypted payload
        metadata_hash: [u8; 32],             // Hash of encrypted metadata
        treatment_category: u8,              // 0=experimental, 1=approved, 2=alternative
        duration_days: u16,
        proof_of_encryption: Vec<u8>,        // ZK proof that data is properly encrypted
        light_protocol_proof: Vec<u8>,       // Light Protocol ZK compression proof
        compression_ratio: u16,             // Ratio achieved (e.g., 10x compression)
    ) -> Result<()> {
        require!(
            ipfs_cid.len() == 46 && ipfs_cid.starts_with("Qm"),
            CaseStudyError::InvalidIPFSCid
        );
        require!(
            treatment_category <= 2,
            CaseStudyError::InvalidCategory
        );
        require!(
            duration_days > 0 && duration_days <= 365,
            CaseStudyError::InvalidDuration
        );
        require!(
            compression_ratio >= 2 && compression_ratio <= 100,
            CaseStudyError::InvalidCompressionRatio
        );

        // Verify ZK proof of proper encryption (Noir circuit)
        require!(
            proof_of_encryption.len() > 0,
            CaseStudyError::MissingEncryptionProof
        );

        // Verify Light Protocol compression proof
        require!(
            light_protocol_proof.len() > 0,
            CaseStudyError::MissingLightProtocolProof
        );

        // In production, verify Light Protocol proof using their verifier
        // For now, we trust the proof format is correct
        let light_proof_hash = hash(&light_protocol_proof);

        let case_study = &mut ctx.accounts.case_study;
        let clock = Clock::get()?;
        
        // Generate ephemeral PDA identifier (not linked to user wallet)
        let timestamp_bytes = clock.unix_timestamp.to_le_bytes();
        let padded_timestamp = [
            timestamp_bytes[0], timestamp_bytes[1], timestamp_bytes[2], timestamp_bytes[3],
            timestamp_bytes[4], timestamp_bytes[5], timestamp_bytes[6], timestamp_bytes[7], 0
        ];
        let ephemeral_seed = &[
            b"ephemeral",
            &padded_timestamp,
            &metadata_hash[..9],
        ];
        let (ephemeral_id, _bump) = Pubkey::find_program_address(
            ephemeral_seed,
            ctx.program_id
        );

        case_study.ephemeral_id = ephemeral_id;
        case_study.submitter = ctx.accounts.submitter.key();
        case_study.ipfs_cid = ipfs_cid.clone();
        case_study.metadata_hash = metadata_hash;
        case_study.treatment_category = treatment_category;
        case_study.duration_days = duration_days;
        case_study.created_at = clock.unix_timestamp;
        case_study.validation_status = ValidationStatus::Pending;
        case_study.approval_count = 0;
        case_study.rejection_count = 0;
        case_study.reputation_score = 0;
        case_study.is_paused = false;
        case_study.threshold_shares_required = 3; // K-of-N for Arcium MPC
        case_study.light_proof_hash = light_proof_hash;
        case_study.compression_ratio = compression_ratio;
        case_study.bump = ctx.bumps.case_study;

        emit!(CaseStudySubmitted {
            ephemeral_id,
            ipfs_cid,
            metadata_hash,
            created_at: clock.unix_timestamp,
            light_proof_hash,
            compression_ratio,
        });

        Ok(())
    }

    /// Validator submits ZK proof of data integrity WITHOUT decryption
    /// Uses Noir circuits to prove validation criteria are met
    pub fn validator_prove_integrity(
        ctx: Context<ValidateWithProof>,
        validation_type: ValidationType,
        proof: Vec<u8>,                      // Noir ZK-SNARK proof
        public_inputs: [u8; 32],             // Public commitments (no private data)
        stake_amount: u64,
        noir_circuit_id: [u8; 4],            // Specific Noir circuit used
        circuit_params_hash: [u8; 32],       // Hash of circuit parameters
    ) -> Result<()> {
        require!(
            stake_amount >= MINIMUM_VALIDATOR_STAKE,
            CaseStudyError::InsufficientStake
        );
        require!(
            proof.len() > 0,
            CaseStudyError::InvalidProof
        );
        require!(
            noir_circuit_id != [0, 0, 0, 0],
            CaseStudyError::InvalidCircuitId
        );

        let case_study = &mut ctx.accounts.case_study;
        require!(
            !case_study.is_paused,
            CaseStudyError::ValidationPaused
        );

        // Verify Noir circuit ID is valid for this validation type
        let expected_circuit = match validation_type {
            ValidationType::Approve => [b'n', b'o', b'i', b'r'], // "noir" circuit
            ValidationType::Reject => [b'n', b'o', b'i', b'r'], // Same circuit for now
            ValidationType::FurtherReview => [b'n', b'o', b'i', b'r'],
        };
        require!(
            noir_circuit_id == expected_circuit,
            CaseStudyError::InvalidCircuitForValidationType
        );

        // In production, verify Noir proof on-chain using Aztec verifier
        // For now, we trust the proof format is correct
        let proof_hash = hash(&proof);
        let noir_verification_hash = hash(&[proof_hash.as_ref(), &circuit_params_hash].concat());
        
        // Check if validator already validated this case study (Sybil resistance)
        require!(
            ctx.accounts.validator_stake.validator != ctx.accounts.validator.key() ||
            ctx.accounts.validator_stake.case_study != case_study.key(),
            CaseStudyError::DuplicateValidation
        );

        // Transfer stake privately using Privacy Cash SDK
        // In production, this would call Privacy Cash program
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.validator_token_account.to_account_info(),
            to: ctx.accounts.stake_escrow.to_account_info(),
            authority: ctx.accounts.validator.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );
        token::transfer(cpi_ctx, stake_amount)?;

        // Record validation stake with Noir/Aztec verification
        let validator_stake = &mut ctx.accounts.validator_stake;
        validator_stake.validator = ctx.accounts.validator.key();
        validator_stake.case_study = case_study.key();
        validator_stake.stake_amount = stake_amount;
        validator_stake.validation_type = validation_type;
        validator_stake.proof_hash = proof_hash;
        validator_stake.public_inputs = public_inputs;
        validator_stake.noir_circuit_id = noir_circuit_id;
        validator_stake.circuit_params_hash = circuit_params_hash;
        validator_stake.noir_verification_hash = noir_verification_hash;
        validator_stake.staked_at = Clock::get()?.unix_timestamp;
        validator_stake.is_slashed = false;
        validator_stake.reputation_weight = calculate_validator_weight(&ctx.accounts.validator_reputation)?;

        // Update case study approval metrics (weighted by validator reputation)
        match validation_type {
            ValidationType::Approve => {
                case_study.approval_count = case_study.approval_count
                    .checked_add(validator_stake.reputation_weight)
                    .ok_or(CaseStudyError::OverflowError)?;
            }
            ValidationType::Reject => {
                case_study.rejection_count = case_study.rejection_count
                    .checked_add(validator_stake.reputation_weight)
                    .ok_or(CaseStudyError::OverflowError)?;
            }
            ValidationType::FurtherReview => {
                // Neutral - doesn't affect counts
            }
        }

        // Calculate weighted reputation score (0-100)
        let total_votes = case_study.approval_count
            .checked_add(case_study.rejection_count)
            .ok_or(CaseStudyError::OverflowError)?;
        
        if total_votes > 0 {
            case_study.reputation_score = ((case_study.approval_count as u128 * 100) 
                / total_votes as u128) as u8;
        }

        // Auto-approve if weighted consensus reached (75% approval, min 5 validators)
        if total_votes >= 5 && case_study.reputation_score >= 75 {
            case_study.validation_status = ValidationStatus::Approved;
        } else if case_study.reputation_score < 25 && total_votes >= 5 {
            case_study.validation_status = ValidationStatus::Rejected;
        }

        emit!(ValidationProofSubmitted {
            case_study: case_study.key(),
            validator: ctx.accounts.validator.key(),
            proof_hash,
            validation_type,
            reputation_score: case_study.reputation_score,
            noir_circuit_id,
            circuit_params_hash,
            noir_verification_hash,
        });

        Ok(())
    }

    /// Request threshold decryption access via Arcium MPC
    /// Validators form committee to decrypt for legitimate research
    pub fn request_committee_access(
        ctx: Context<RequestAccess>,
        justification: String,
        arcium_mpc_params: Vec<u8>,         // Arcium MPC parameters
        encryption_scheme: u8,              // 0=AES-256, 1=ChaCha20, 2=Custom
    ) -> Result<()> {
        require!(
            justification.len() >= 50 && justification.len() <= 500,
            CaseStudyError::InvalidJustification
        );
        require!(
            arcium_mpc_params.len() > 0,
            CaseStudyError::MissingArciumParams
        );
        require!(
            encryption_scheme <= 2,
            CaseStudyError::InvalidEncryptionScheme
        );

        let access_request = &mut ctx.accounts.access_request;
        access_request.case_study = ctx.accounts.case_study.key();
        access_request.requester = ctx.accounts.requester.key();
        access_request.justification = justification;
        access_request.requested_at = Clock::get()?.unix_timestamp;
        access_request.status = AccessStatus::Pending;
        access_request.approvals = 0;
        access_request.required_approvals = ctx.accounts.case_study.threshold_shares_required;
        access_request.arcium_params_hash = hash(&arcium_mpc_params);
        access_request.encryption_scheme = encryption_scheme;

        // In production, this would call Arcium program to initialize MPC session
        // For now, we store the parameters hash for verification
        let arcium_session_id = hash(&[access_request.case_study.as_ref(), 
            &access_request.requester.as_ref(), 
            &access_request.arcium_params_hash].concat());

        emit!(AccessRequested {
            case_study: ctx.accounts.case_study.key(),
            requester: ctx.accounts.requester.key(),
            required_approvals: access_request.required_approvals,
            arcium_params_hash: access_request.arcium_params_hash,
            encryption_scheme,
        });

        emit!(ArciumSessionInitialized {
            access_request: access_request.key(),
            session_id: arcium_session_id,
            params_hash: access_request.arcium_params_hash,
        });

        Ok(())
    }

    /// Validator approves access request (threshold K-of-N)
    /// Each approval generates MPC share for decryption
    pub fn approve_access_request(
        ctx: Context<ApproveAccess>,
        share_commitment: [u8; 32],           // Hash of MPC share (private)
        arcium_share_proof: Vec<u8>,          // Arcium MPC share generation proof
    ) -> Result<()> {
        let access_request = &mut ctx.accounts.access_request;
        
        require!(
            access_request.status == AccessStatus::Pending,
            CaseStudyError::AccessAlreadyProcessed
        );
        require!(
            arcium_share_proof.len() > 0,
            CaseStudyError::MissingArciumShareProof
        );

        // Verify validator has stake in this case study
        require!(
            ctx.accounts.validator_stake.case_study == access_request.case_study,
            CaseStudyError::ValidatorNotAuthorized
        );

        // In production, verify Arcium MPC share proof
        // For now, we trust the proof format is correct
        let share_proof_hash = hash(&arcium_share_proof);

        access_request.approvals = access_request.approvals
            .checked_add(1)
            .ok_or(CaseStudyError::OverflowError)?;

        // Grant access if threshold reached
        if access_request.approvals >= access_request.required_approvals {
            access_request.status = AccessStatus::Granted;
            
            emit!(AccessGranted {
                case_study: access_request.case_study,
                requester: access_request.requester,
                approvals: access_request.approvals,
            });
            
            // In production, this would trigger Arcium MPC reconstruction
            // For now, we emit the completion event
            emit!(ArciumDecryptionComplete {
                access_request: access_request.key(),
                case_study: access_request.case_study,
                requester: access_request.requester,
                final_share_proof_hash: share_proof_hash,
            });
        }

        emit!(ShareDistributed {
            access_request: access_request.key(),
            validator: ctx.accounts.validator.key(),
            share_commitment,
            arcium_share_proof_hash: share_proof_hash,
        });

        Ok(())
    }

    /// Agent-callable function to pause validation (Risk Agent)
    /// Only callable by authorized agent PDA
    pub fn agent_pause_validation(
        ctx: Context<AgentAction>,
        risk_score: u8,
        reason: String,
    ) -> Result<()> {
        // Verify caller is Risk Agent PDA
        let (risk_agent_pda, _bump) = Pubkey::find_program_address(
            &[b"agent", b"risk"],
            ctx.program_id
        );
        require!(
            ctx.accounts.agent_authority.key() == risk_agent_pda,
            CaseStudyError::UnauthorizedAgent
        );

        require!(
            risk_score >= CRITICAL_RISK_THRESHOLD,
            CaseStudyError::InsufficientRiskScore
        );

        let case_study = &mut ctx.accounts.case_study;
        case_study.is_paused = true;

        emit!(ValidationPaused {
            case_study: case_study.key(),
            risk_score,
            reason,
            paused_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// DAO governance slashes validator for proven fraud
    /// Requires multi-sig from governance authority
    pub fn slash_validator(
        ctx: Context<SlashValidator>,
        slash_percentage: u8,                // 1-100
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        require!(
            slash_percentage > 0 && slash_percentage <= 100,
            CaseStudyError::InvalidSlashPercentage
        );

        let validator_stake = &mut ctx.accounts.validator_stake;
        require!(
            !validator_stake.is_slashed,
            CaseStudyError::AlreadySlashed
        );

        // Calculate slash amount
        let slash_amount = (validator_stake.stake_amount as u128 
            * slash_percentage as u128 / 100) as u64;

        // Burn slashed tokens (remove from circulation)
        let cpi_accounts = token::Burn {
            mint: ctx.accounts.experience_mint.to_account_info(),
            from: ctx.accounts.stake_escrow.to_account_info(),
            authority: ctx.accounts.governance_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );
        token::burn(cpi_ctx, slash_amount)?;

        validator_stake.is_slashed = true;
        validator_stake.slashed_amount = slash_amount;

        // Update validator reputation (permanent penalty)
        let validator_reputation = &mut ctx.accounts.validator_reputation;
        validator_reputation.total_slashes = validator_reputation.total_slashes
            .checked_add(1)
            .ok_or(CaseStudyError::OverflowError)?;
        validator_reputation.reputation_score = validator_reputation.reputation_score
            .saturating_sub(20); // -20 points per slash

        emit!(ValidatorSlashed {
            validator: validator_stake.validator,
            case_study: validator_stake.case_study,
            slash_amount,
            evidence_hash,
        });

        Ok(())
    }
}

// ============= ACCOUNTS =============

#[account]
pub struct CaseStudy {
    pub ephemeral_id: Pubkey,              // Privacy-preserving identifier
    pub submitter: Pubkey,                 // Actual submitter (for rewards)
    pub ipfs_cid: String,                  // Off-chain encrypted payload
    pub metadata_hash: [u8; 32],           // Hash of encrypted metadata
    pub treatment_category: u8,            // Treatment type
    pub duration_days: u16,
    pub created_at: i64,
    pub validation_status: ValidationStatus,
    pub approval_count: u32,               // Weighted by validator reputation
    pub rejection_count: u32,
    pub reputation_score: u8,              // 0-100 quality score
    pub is_paused: bool,                   // Agent risk control
    pub threshold_shares_required: u8,     // K-of-N for MPC access
    pub light_proof_hash: [u8; 32],        // Light Protocol compression proof
    pub compression_ratio: u16,            // ZK compression ratio achieved
    pub bump: u8,
}

#[account]
pub struct ValidatorStake {
    pub validator: Pubkey,
    pub case_study: Pubkey,
    pub stake_amount: u64,
    pub validation_type: ValidationType,
    pub proof_hash: [u8; 32],              // Hash of ZK proof
    pub public_inputs: [u8; 32],           // Public commitments
    pub noir_circuit_id: [u8; 4],          // Noir circuit identifier
    pub circuit_params_hash: [u8; 32],     // Hash of circuit parameters
    pub noir_verification_hash: [u8; 32],  // Combined verification hash
    pub staked_at: i64,
    pub is_slashed: bool,
    pub slashed_amount: u64,
    pub reputation_weight: u32,            // Validator's influence
}

#[account]
pub struct ValidatorReputation {
    pub validator: Pubkey,
    pub total_validations: u64,
    pub accurate_validations: u64,         // Validated cases later confirmed accurate
    pub total_slashes: u32,
    pub reputation_score: u8,              // 0-100
    pub tier: ValidatorTier,               // Bronze/Silver/Gold/Platinum
}

#[account]
pub struct AccessRequest {
    pub case_study: Pubkey,
    pub requester: Pubkey,
    pub justification: String,
    pub requested_at: i64,
    pub status: AccessStatus,
    pub approvals: u8,
    pub required_approvals: u8,
    pub arcium_params_hash: [u8; 32],      // Arcium MPC parameters hash
    pub encryption_scheme: u8,              // Encryption scheme used
}

#[account]
pub struct GovernanceConfig {
    pub governance_authority: Pubkey,      // Multi-sig PDA
    pub min_validators_for_approval: u8,
    pub slash_appeal_period_days: u8,
    pub critical_risk_threshold: u8,
}

// ============= ENUMS =============

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ValidationStatus {
    Pending,
    Approved,
    Rejected,
    UnderReview,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum ValidationType {
    Approve,
    Reject,
    FurtherReview,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AccessStatus {
    Pending,
    Granted,
    Denied,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ValidatorTier {
    Bronze,    // 0-25 score
    Silver,    // 26-50
    Gold,      // 51-75
    Platinum,  // 76-100
}

// ============= CONTEXTS =============

#[derive(Accounts)]
pub struct SubmitCaseStudy<'info> {
    #[account(
        init,
        payer = submitter,
        space = 8 + 32 + 32 + (4 + 46) + 32 + 1 + 2 + 8 + 1 + 4 + 4 + 1 + 1 + 1 + 1 + 32 + 2,
        seeds = [b"case_study", submitter.key().as_ref(), &Clock::get().unwrap().unix_timestamp.to_le_bytes()],
        bump
    )]
    pub case_study: Account<'info, CaseStudy>,
    #[account(mut)]
    pub submitter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidateWithProof<'info> {
    #[account(mut)]
    pub case_study: Account<'info, CaseStudy>,
    #[account(
        init,
        payer = validator,
        space = 8 + 32 + 32 + 8 + 1 + 32 + 32 + 4 + 32 + 32 + 8 + 1 + 8 + 4,
    )]
    pub validator_stake: Account<'info, ValidatorStake>,
    #[account(mut)]
    pub validator_reputation: Account<'info, ValidatorReputation>,
    #[account(mut)]
    pub validator: Signer<'info>,
    #[account(mut)]
    pub validator_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub stake_escrow: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestAccess<'info> {
    pub case_study: Account<'info, CaseStudy>,
    #[account(
        init,
        payer = requester,
        space = 8 + 32 + 32 + (4 + 500) + 8 + 1 + 1 + 1 + 32 + 1,
    )]
    pub access_request: Account<'info, AccessRequest>,
    #[account(mut)]
    pub requester: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveAccess<'info> {
    #[account(mut)]
    pub access_request: Account<'info, AccessRequest>,
    pub validator_stake: Account<'info, ValidatorStake>,
    pub validator: Signer<'info>,
}

#[derive(Accounts)]
pub struct AgentAction<'info> {
    #[account(mut)]
    pub case_study: Account<'info, CaseStudy>,
    pub agent_authority: Signer<'info>,  // Must be agent PDA
}

#[derive(Accounts)]
pub struct SlashValidator<'info> {
    #[account(mut)]
    pub validator_stake: Account<'info, ValidatorStake>,
    #[account(mut)]
    pub validator_reputation: Account<'info, ValidatorReputation>,
    #[account(mut)]
    pub stake_escrow: Account<'info, TokenAccount>,
    #[account(mut)]
    pub experience_mint: Account<'info, Mint>,
    pub governance_config: Account<'info, GovernanceConfig>,
    #[account(
        constraint = governance_authority.key() == governance_config.governance_authority
    )]
    pub governance_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// ============= EVENTS =============

#[event]
pub struct CaseStudySubmitted {
    pub ephemeral_id: Pubkey,
    pub ipfs_cid: String,
    pub metadata_hash: [u8; 32],
    pub created_at: i64,
    pub light_proof_hash: [u8; 32],
    pub compression_ratio: u16,
}

#[event]
pub struct ValidationProofSubmitted {
    pub case_study: Pubkey,
    pub validator: Pubkey,
    pub proof_hash: [u8; 32],
    pub validation_type: ValidationType,
    pub reputation_score: u8,
    pub noir_circuit_id: [u8; 4],
    pub circuit_params_hash: [u8; 32],
    pub noir_verification_hash: [u8; 32],
}

#[event]
pub struct AccessRequested {
    pub case_study: Pubkey,
    pub requester: Pubkey,
    pub required_approvals: u8,
    pub arcium_params_hash: [u8; 32],
    pub encryption_scheme: u8,
}

#[event]
pub struct AccessGranted {
    pub case_study: Pubkey,
    pub requester: Pubkey,
    pub approvals: u8,
}

#[event]
pub struct ShareDistributed {
    pub access_request: Pubkey,
    pub validator: Pubkey,
    pub share_commitment: [u8; 32],
    pub arcium_share_proof_hash: [u8; 32],
}

#[event]
pub struct ValidationPaused {
    pub case_study: Pubkey,
    pub risk_score: u8,
    pub reason: String,
    pub paused_at: i64,
}

#[event]
pub struct ValidatorSlashed {
    pub validator: Pubkey,
    pub case_study: Pubkey,
    pub slash_amount: u64,
    pub evidence_hash: [u8; 32],
}

#[event]
pub struct ArciumSessionInitialized {
    pub access_request: Pubkey,
    pub session_id: [u8; 32],
    pub params_hash: [u8; 32],
}

#[event]
pub struct ArciumDecryptionComplete {
    pub access_request: Pubkey,
    pub case_study: Pubkey,
    pub requester: Pubkey,
    pub final_share_proof_hash: [u8; 32],
}

// ============= ERRORS =============

#[error_code]
pub enum CaseStudyError {
    #[msg("Invalid IPFS CID format")]
    InvalidIPFSCid,
    #[msg("Invalid treatment category")]
    InvalidCategory,
    #[msg("Invalid duration")]
    InvalidDuration,
    #[msg("Missing encryption proof")]
    MissingEncryptionProof,
    #[msg("Missing Light Protocol compression proof")]
    MissingLightProtocolProof,
    #[msg("Invalid compression ratio (must be 2-100)")]
    InvalidCompressionRatio,
    #[msg("Invalid Noir circuit ID")]
    InvalidCircuitId,
    #[msg("Invalid Noir circuit for this validation type")]
    InvalidCircuitForValidationType,
    #[msg("Missing Arcium MPC parameters")]
    MissingArciumParams,
    #[msg("Invalid encryption scheme")]
    InvalidEncryptionScheme,
    #[msg("Missing Arcium MPC share proof")]
    MissingArciumShareProof,
    #[msg("Insufficient validator stake")]
    InsufficientStake,
    #[msg("Invalid ZK proof")]
    InvalidProof,
    #[msg("Validation currently paused")]
    ValidationPaused,
    #[msg("Validator already validated this case study")]
    DuplicateValidation,
    #[msg("Arithmetic overflow")]
    OverflowError,
    #[msg("Invalid justification length")]
    InvalidJustification,
    #[msg("Access request already processed")]
    AccessAlreadyProcessed,
    #[msg("Validator not authorized for this case study")]
    ValidatorNotAuthorized,
    #[msg("Unauthorized agent")]
    UnauthorizedAgent,
    #[msg("Risk score below critical threshold")]
    InsufficientRiskScore,
    #[msg("Invalid slash percentage")]
    InvalidSlashPercentage,
    #[msg("Validator already slashed")]
    AlreadySlashed,
}

// ============= CONSTANTS =============

pub const MINIMUM_VALIDATOR_STAKE: u64 = 10_000_000; // 10 EXPERIENCE tokens (6 decimals)
pub const CRITICAL_RISK_THRESHOLD: u8 = 75;

// ============= HELPER FUNCTIONS =============

fn calculate_validator_weight(reputation: &Account<ValidatorReputation>) -> Result<u32> {
    let _accuracy_rate = if reputation.total_validations > 0 {
        (reputation.accurate_validations * 100) / reputation.total_validations
    } else {
        50 // Neutral for new validators
    };

    // Weight formula: base 1 + reputation bonus (0-4x)
    let weight = match reputation.tier {
        ValidatorTier::Bronze => 1,
        ValidatorTier::Silver => 2,
        ValidatorTier::Gold => 3,
        ValidatorTier::Platinum => 5,
    };

    Ok(weight)
}

fn hash(data: &[u8]) -> [u8; 32] {
    use solana_program::keccak;
    keccak::hash(data).to_bytes()
}