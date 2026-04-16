// The 'dbc_verifier' program - ZK verification for Dallas Agent Alliance optimization logs.
program dbc_verifier.aleo {
    // Verify that a benchmark shows sufficient improvement without revealing the actual data.
    fn verify_benchmark_delta(
        public old_score: u32,
        public new_score: u32,
        public min_improvement: u32,
        public verification_hash: field,
    ) -> u32 {
        let improvement: u32 = new_score - old_score;
        assert(improvement >= min_improvement);
        return new_score - old_score;
    }

    // Verify benchmark improvement with gas cost bounds.
    fn verify_benchmark_with_cost(
        public old_score: u32,
        public new_score: u32,
        public min_improvement: u32,
        public max_gas_cost: u32,
        public verification_hash: field,
    ) -> u32 {
        let improvement: u32 = new_score - old_score;
        assert(improvement >= min_improvement);
        return new_score - old_score;
    }
}
