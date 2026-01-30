// Symptom Improvement Circuit
// Proves that symptom severity improved by at least a threshold percentage
// without revealing the actual severity scores
//
// Private inputs: baseline_severity, outcome_severity (not revealed on-chain)
// Public inputs: min_improvement_percent (e.g., 20 for 20%)
// Output: Boolean proving improvement met threshold

fn main(
    baseline_severity: u8,           // Private: Initial symptom severity (1-10)
    outcome_severity: u8,            // Private: Final symptom severity (1-10)
    min_improvement_percent: u8,     // Public: Minimum required improvement %
) -> pub bool {
    // Constraint: Severity scores must be in valid range (1-10)
    assert(baseline_severity >= 1);
    assert(baseline_severity <= 10);
    assert(outcome_severity >= 1);
    assert(outcome_severity <= 10);
    
    // Constraint: Minimum improvement must be 0-100%
    assert(min_improvement_percent <= 100);
    
    // Calculate improvement amount
    // Note: We expect outcome < baseline for improvement
    let improvement = if baseline_severity > outcome_severity {
        baseline_severity - outcome_severity
    } else {
        0  // No improvement or worsened
    };
    
    // Calculate threshold: baseline * min_improvement / 100
    // Example: baseline=8, min_improvement=20% -> threshold=1.6 -> need improvement >= 2
    // Use u16 to prevent overflow (10 * 100 = 1000, well within u16)
    let threshold = ((baseline_severity as u16) * (min_improvement_percent as u16)) / 100;
    let threshold_u8 = threshold as u8;
    
    // Ensure at least 1 point improvement if threshold rounds to 0
    let min_required = if threshold_u8 < 1 { 1 } else { threshold_u8 };
    
    // Return true if improvement meets or exceeds threshold
    improvement >= min_required
}

// Tests for the circuit
#[test]
fn test_significant_improvement() {
    // Baseline 8, outcome 4 = 50% improvement, threshold 20% -> should pass
    let result = main(8, 4, 20);
    assert(result == true);
}

#[test]
fn test_exact_threshold() {
    // Baseline 10, outcome 8 = 20% improvement, threshold 20% -> should pass
    let result = main(10, 8, 20);
    assert(result == true);
}

#[test]
fn test_below_threshold() {
    // Baseline 10, outcome 9 = 10% improvement, threshold 20% -> should fail
    let result = main(10, 9, 20);
    assert(result == false);
}

#[test]
fn test_no_improvement() {
    // Baseline 5, outcome 5 = 0% improvement, threshold 10% -> should fail
    let result = main(5, 5, 10);
    assert(result == false);
}

#[test]
fn test_worsening() {
    // Baseline 5, outcome 7 = worsening, threshold 10% -> should fail
    let result = main(5, 7, 10);
    assert(result == false);
}

#[test]
fn test_high_threshold_met() {
    // Baseline 10, outcome 5 = 50% improvement, threshold 50% -> should pass
    let result = main(10, 5, 50);
    assert(result == true);
}
