//! Dallas Buyers Club - Common Library
//! 
//! Single source of truth for constants, types, and utilities
//! across all programs. Eliminates hardcoded values.

use anchor_lang::prelude::*;

// ============= TOKEN CONSTANTS =============

/// DBC Token Mint (DALLAS BUYERS CLUB)
/// Fixed supply, community-owned, Token-2022
// NOTE: Using devnet token for testing. Change to mainnet token for production:
// pub const DBC_MINT: &str = "J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump";  // Mainnet pump.fun
pub const DBC_MINT: &str = "8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT";  // Devnet token
pub const DBC_DECIMALS: u8 = 6;
pub const DBC_MULTIPLIER: u64 = 1_000_000; // 10^6

/// Token-2022 Program ID
pub const TOKEN_2022_PROGRAM_ID: &str = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

// ============= PROGRAM IDS =============

/// Treasury Program (deployed via SolPG)
// Treasury program ID - deployed on devnet
pub const TREASURY_PROGRAM_ID: &str = "C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk";

/// Case Study Program
pub const CASE_STUDY_PROGRAM_ID: &str = "EqtUtzoDUq8fQSdQATey5wJgmZHm4bEpDsKb24vHmPd6";

// ============= STAKING CONFIG =============

pub const STAKING_CONFIG: StakingConfig = StakingConfig {
    minimum_stake_dbc: 100,           // 100 DBC
    minimum_stake_base: 100_000_000,  // 100 * 10^6
    lock_days: 7,
    lock_seconds: 7 * 86400,
    slash_burn_percent: 50,
    slash_treasury_percent: 50,
};

#[derive(Clone, Copy)]
pub struct StakingConfig {
    pub minimum_stake_dbc: u64,
    pub minimum_stake_base: u64,
    pub lock_days: u16,
    pub lock_seconds: i64,
    pub slash_burn_percent: u8,
    pub slash_treasury_percent: u8,
}

// ============= REWARD CONFIG =============

pub const REWARD_CONFIG: RewardConfig = RewardConfig {
    // Case study submission (base + quality bonus)
    base_submission_dbc: 50,          // Increased from 10
    base_submission_base: 50_000_000,
    max_submission_dbc: 100,          // 2x for perfect quality
    max_submission_base: 100_000_000,
    
    // Validation rewards
    base_validation_dbc: 25,          // Increased from 5
    base_validation_base: 25_000_000,
    max_validation_dbc: 50,           // 2x for 100% accuracy
    max_validation_base: 50_000_000,
    
    // Referral rewards
    referral_dbc: 100,
    referral_base: 100_000_000,
    
    // Quality bonus calculation
    quality_bonus_percent: 100,       // Up to 100% bonus (2x total)
};

#[derive(Clone, Copy)]
pub struct RewardConfig {
    pub base_submission_dbc: u64,
    pub base_submission_base: u64,
    pub max_submission_dbc: u64,
    pub max_submission_base: u64,
    pub base_validation_dbc: u64,
    pub base_validation_base: u64,
    pub max_validation_dbc: u64,
    pub max_validation_base: u64,
    pub referral_dbc: u64,
    pub referral_base: u64,
    pub quality_bonus_percent: u64,
}

// ============= EMISSION SCHEDULE =============

/// Emission schedule for 10-year distribution
/// Total: ~10% of supply (100M DBC) distributed via rewards
pub const EMISSION_SCHEDULE: [EmissionYear; 10] = [
    EmissionYear { year: 1, daily_case_study_pool: 5_000, daily_validation_pool: 2_500, description: "Bootstrap" },
    EmissionYear { year: 2, daily_case_study_pool: 10_000, daily_validation_pool: 5_000, description: "Growth" },
    EmissionYear { year: 3, daily_case_study_pool: 15_000, daily_validation_pool: 7_500, description: "Expansion" },
    EmissionYear { year: 4, daily_case_study_pool: 12_000, daily_validation_pool: 6_000, description: "Stabilize" },
    EmissionYear { year: 5, daily_case_study_pool: 10_000, daily_validation_pool: 5_000, description: "Mature" },
    EmissionYear { year: 6, daily_case_study_pool: 8_000, daily_validation_pool: 4_000, description: "Sustain" },
    EmissionYear { year: 7, daily_case_study_pool: 6_000, daily_validation_pool: 3_000, description: "Sustain" },
    EmissionYear { year: 8, daily_case_study_pool: 5_000, daily_validation_pool: 2_500, description: "Long-term" },
    EmissionYear { year: 9, daily_case_study_pool: 4_000, daily_validation_pool: 2_000, description: "Long-term" },
    EmissionYear { year: 10, daily_case_study_pool: 3_000, daily_validation_pool: 1_500, description: "Legacy" },
];

#[derive(Clone, Copy)]
pub struct EmissionYear {
    pub year: u8,
    pub daily_case_study_pool: u64,
    pub daily_validation_pool: u64,
    pub description: &'static str,
}

/// Get current emission year based on timestamp
pub fn get_current_emission_year(start_timestamp: i64, current_timestamp: i64) -> &'static EmissionYear {
    let seconds_elapsed = current_timestamp - start_timestamp;
    let years_elapsed = (seconds_elapsed / (365 * 86400)) as usize;
    
    EMISSION_SCHEDULE.get(years_elapsed.min(9)).unwrap_or(&EMISSION_SCHEDULE[9])
}

// ============= VALIDATION CONFIG =============

pub const VALIDATION_CONFIG: ValidationConfig = ValidationConfig {
    min_validators_for_approval: 3,
    max_validators_for_approval: 5,
    approval_threshold_percent: 75,  // 75% approval needed
    auto_approve_threshold: 90,      // 90% = instant approval
    auto_reject_threshold: 25,       // Below 25% = auto reject
    validation_timeout_days: 30,
};

#[derive(Clone, Copy)]
pub struct ValidationConfig {
    pub min_validators_for_approval: u8,
    pub max_validators_for_approval: u8,
    pub approval_threshold_percent: u8,
    pub auto_approve_threshold: u8,
    pub auto_reject_threshold: u8,
    pub validation_timeout_days: u16,
}

// ============= TIER SYSTEM =============

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ValidatorTier {
    Bronze = 0,   // 0-24 validations
    Silver = 1,   // 25-99
    Gold = 2,     // 100-499
    Platinum = 3, // 500+
}

impl ValidatorTier {
    pub fn from_validations(total_validations: u32) -> Self {
        match total_validations {
            0..=24 => ValidatorTier::Bronze,
            25..=99 => ValidatorTier::Silver,
            100..=499 => ValidatorTier::Gold,
            _ => ValidatorTier::Platinum,
        }
    }
    
    pub fn weight(&self) -> u32 {
        match self {
            ValidatorTier::Bronze => 1,
            ValidatorTier::Silver => 2,
            ValidatorTier::Gold => 3,
            ValidatorTier::Platinum => 5,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            ValidatorTier::Bronze => "Bronze",
            ValidatorTier::Silver => "Silver",
            ValidatorTier::Gold => "Gold",
            ValidatorTier::Platinum => "Platinum",
        }
    }
    
    pub fn color(&self) -> &'static str {
        match self {
            ValidatorTier::Bronze => "#CD7F32",
            ValidatorTier::Silver => "#C0C0C0",
            ValidatorTier::Gold => "#FFD700",
            ValidatorTier::Platinum => "#E5E4E2",
        }
    }
}

// ============= SEEDS =============

pub const TREASURY_SEED: &[u8] = b"treasury";
pub const STAKE_SEED: &[u8] = b"stake";
pub const REPUTATION_SEED: &[u8] = b"reputation";
pub const CASE_STUDY_SEED: &[u8] = b"case_study";
pub const DAILY_DIST_SEED: &[u8] = b"daily_dist";

// ============= TIME CONSTANTS =============

pub const SECONDS_PER_DAY: i64 = 86400;
pub const SECONDS_PER_WEEK: i64 = 604800;
pub const SECONDS_PER_YEAR: i64 = 31536000;

// ============= ERROR CODES =============

#[error_code]
pub enum CommonError {
    #[msg("Invalid DBC amount")]
    InvalidDbcAmount,
    #[msg("Calculation overflow")]
    Overflow,
    #[msg("Invalid percentage (must be 0-100)")]
    InvalidPercentage,
    #[msg("Invalid tier")]
    InvalidTier,
}

// ============= HELPERS =============

/// Convert DBC to base units
pub fn dbc_to_base(dbc: u64) -> u64 {
    dbc.checked_mul(DBC_MULTIPLIER).expect("Overflow in dbc_to_base")
}

/// Convert base units to DBC (truncates decimals)
pub fn base_to_dbc(base: u64) -> u64 {
    base / DBC_MULTIPLIER
}

/// Calculate quality bonus
pub fn calculate_quality_bonus(base_amount: u64, quality_score: u8, max_bonus_percent: u64) -> u64 {
    let clamped_score = quality_score.min(100) as u64;
    let bonus = base_amount
        .checked_mul(clamped_score)
        .and_then(|v| v.checked_mul(max_bonus_percent))
        .and_then(|v| v.checked_div(10000)) // score * percent / 10000
        .unwrap_or(0);
    
    base_amount.checked_add(bonus).unwrap_or(base_amount)
}

/// Calculate slash amounts
/// Returns: (slash_amount, burn_amount, remaining_amount)
pub fn calculate_slash(amount: u64, percentage: u8) -> (u64, u64, u64) {
    let slash_amount = (amount as u128)
        .checked_mul(percentage as u128)
        .unwrap_or(0) as u64 / 100;
    
    let burn = slash_amount / 2;
    let remaining = amount - slash_amount;
    
    (slash_amount, burn, remaining)
}
