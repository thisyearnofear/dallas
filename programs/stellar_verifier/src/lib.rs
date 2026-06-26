#![no_std]
use soroban_sdk::{contract, contractimpl, Bytes, BytesN, Env, String, Symbol};
use ultrahonk_soroban_verifier::{UltraHonkVerifier, VkLoadError, PROOF_BYTES};

#[contract]
pub struct OptimizationAttestation;

#[contractimpl]
impl OptimizationAttestation {
    fn key_vk() -> Symbol {
        Symbol::new(&Env::default(), "vk")
    }

    pub fn __constructor(env: Env, vk_bytes: Bytes) {
        let verifier = UltraHonkVerifier::new(&env, &vk_bytes);
        env.storage().instance().set(&Self::key_vk(), &vk_bytes);
    }

    pub fn verify_proof(
        env: Env,
        alliance_id: String,
        submitter: BytesN<32>,
        circuit: String,
        public_inputs: Bytes,
        proof_bytes: Bytes,
    ) -> bool {
        if proof_bytes.len() as usize != PROOF_BYTES {
            return false;
        }

        let vk_bytes: Bytes = env
            .storage()
            .instance()
            .get(&Self::key_vk())
            .unwrap_or(Bytes::new(&env));

        let verifier = UltraHonkVerifier::new(&env, &vk_bytes);
        if verifier.is_err() {
            return false;
        }

        verifier.unwrap().verify(&env, &proof_bytes, &public_inputs).is_ok()
    }
}
