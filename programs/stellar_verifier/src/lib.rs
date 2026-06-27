#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    symbol_short, Bytes, BytesN, Env, String, Symbol,
};
use ultrahonk_soroban_verifier::{UltraHonkVerifier, VkLoadError, PROOF_BYTES};

/// An on-chain attestation created when a ZK proof is verified.
///
/// Each attestation records the **public outputs** of the verified circuit
/// (whether the optimization passed and at what improvement threshold),
/// along with metadata (which alliance, which ledger, which timestamp).
/// Once created, attestations are immutable and publicly queryable —
/// they form the on-chain "receipt" for a verified optimization submission.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Attestation {
    pub submission_id: BytesN<32>,
    pub alliance_id: String,
    pub passed: bool,
    pub threshold: u32,
    pub ledger: u32,
    pub timestamp: u64,
}

#[contracterror]
#[repr(u32)]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    VkInvalidLength = 1,
    VkInvalidParameters = 2,
    ProofParseError = 3,
    VerificationFailed = 4,
    VkNotSet = 5,
    AlreadyInitialized = 6,
    AlreadyAttested = 7,
    PublicInputsTooShort = 8,
}

#[contract]
pub struct OptimizationAttestation;

#[contractimpl]
impl OptimizationAttestation {
    fn key_vk() -> Symbol {
        symbol_short!("vk")
    }

    fn key_attestation(env: &Env, submission_id: &BytesN<32>) -> Bytes {
        let mut key = Bytes::new(env);
        key.push_back(0x01u8);
        let mut id_bytes: Bytes = submission_id.clone().into();
        key.append(&mut id_bytes);
        key
    }

    // ── Constructor ────────────────────────────────────────────────

    /// Initialize the contract with a verification key.
    /// The VK is immutable once set — there is no admin or upgrade path.
    pub fn __constructor(env: Env, vk_bytes: Bytes) -> Result<(), Error> {
        if env.storage().instance().has(&Self::key_vk()) {
            return Err(Error::AlreadyInitialized);
        }
        let _ = UltraHonkVerifier::new(&env, &vk_bytes).map_err(|e| match e {
            VkLoadError::WrongLength => Error::VkInvalidLength,
            VkLoadError::InvalidParameters => Error::VkInvalidParameters,
        })?;
        env.storage().instance().set(&Self::key_vk(), &vk_bytes);
        Ok(())
    }

    // ── Read Functions ─────────────────────────────────────────────

    /// Return the stored VK bytes for off-chain auditability.
    pub fn vk_bytes(env: Env) -> Result<Bytes, Error> {
        env.storage()
            .instance()
            .get(&Self::key_vk())
            .ok_or(Error::VkNotSet)
    }

    /// Look up an attestation by its submission_id.
    /// Returns `None` if no attestation exists for that ID.
    pub fn get_attestation(env: Env, submission_id: BytesN<32>) -> Option<Attestation> {
        let key = Self::key_attestation(&env, &submission_id);
        env.storage().persistent().get(&key)
    }

    /// Check whether a submission_id has already been attested.
    pub fn has_attestation(env: Env, submission_id: BytesN<32>) -> bool {
        let key = Self::key_attestation(&env, &submission_id);
        env.storage().persistent().has(&key)
    }

    // ── Stateful Verify + Attest ───────────────────────────────────

    /// Verify an UltraHonk proof and, on success, **store** a permanent
    /// attestation on-chain. The attestation captures the circuit's
    /// public outputs (passed / threshold) plus ledger metadata.
    ///
    /// Every `submission_id` can be attested at most once (returns
    /// `AlreadyAttested` on duplicate).
    pub fn verify_and_attest(
        env: Env,
        alliance_id: String,
        submission_id: BytesN<32>,
        public_inputs: Bytes,
        proof_bytes: Bytes,
    ) -> Result<Attestation, Error> {
        // ── Length checks ──────────────────────────────────────────
        if proof_bytes.len() as usize != PROOF_BYTES {
            return Err(Error::ProofParseError);
        }
        if public_inputs.len() < 64 {
            return Err(Error::PublicInputsTooShort);
        }

        // ── Re-entrancy guard: no double-attestation ───────────────
        let akey = Self::key_attestation(&env, &submission_id);
        if env.storage().persistent().has(&akey) {
            return Err(Error::AlreadyAttested);
        }

        // ── Load VK ────────────────────────────────────────────────
        let vk_bytes: Bytes = env
            .storage()
            .instance()
            .get(&Self::key_vk())
            .ok_or(Error::VkNotSet)?;

        let verifier = UltraHonkVerifier::new(&env, &vk_bytes).map_err(|e| match e {
            VkLoadError::WrongLength => Error::VkInvalidLength,
            VkLoadError::InvalidParameters => Error::VkInvalidParameters,
        })?;

        // ── ZK verification ───────────────────────────────────────
        verifier
            .verify(&env, &proof_bytes, &public_inputs)
            .map_err(|_| Error::VerificationFailed)?;

        // ── Parse public outputs from the circuit ─────────────────
        // The circuit returns 2 × 32-byte BN254 field elements:
        //   [0..32]  → passed (1 = true, 0 = false)
        //   [32..64] → min_improvement_percent (u8 in last byte)
        let passed_byte = public_inputs.get(31).unwrap_or(0);
        let passed = passed_byte != 0;
        let threshold = public_inputs.get(63).unwrap_or(0) as u32;

        // ── Build attestation ──────────────────────────────────────
        let attestation = Attestation {
            submission_id: submission_id.clone(),
            alliance_id: alliance_id.clone(),
            passed,
            threshold,
            ledger: env.ledger().sequence(),
            timestamp: env.ledger().timestamp(),
        };

        // ── Persist ────────────────────────────────────────────────
        env.storage().persistent().set(&akey, &attestation);
        env.storage()
            .persistent()
            .extend_ttl(&akey, 100_000, 535_679);

        // ── Emit event ────────────────────────────────────────────
        env.events().publish(
            (symbol_short!("ATST"), alliance_id, submission_id),
            (passed, threshold, attestation.ledger, attestation.timestamp),
        );

        Ok(attestation)
    }
}
