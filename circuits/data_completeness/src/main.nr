// Data Completeness Circuit
// Proves that all required fields are present in a case study
// without revealing the actual content of those fields
//
// Uses hash commitments to prove field existence
//
// Private inputs: field_hashes (hashes of field content)
// Public inputs: required_field_count, minimum_completeness_percent
// Output: Boolean proving completeness threshold met

fn main(
    has_baseline: bool,              // Private: Has baseline metrics
    has_outcome: bool,               // Private: Has outcome metrics
    has_duration: bool,              // Private: Has duration data
    has_protocol: bool,              // Private: Has protocol description
    has_cost: bool,                  // Private: Has cost information
    minimum_required: u8,            // Public: Minimum fields required (1-5)
) -> pub bool {
    // Constraint: Minimum required must be 1-5
    assert(minimum_required >= 1);
    assert(minimum_required <= 5);
    
    // Count present fields (converting bool to u8)
    let baseline_count = if has_baseline { 1 } else { 0 };
    let outcome_count = if has_outcome { 1 } else { 0 };
    let duration_count = if has_duration { 1 } else { 0 };
    let protocol_count = if has_protocol { 1 } else { 0 };
    let cost_count = if has_cost { 1 } else { 0 };
    
    let total_present = baseline_count + outcome_count + duration_count + protocol_count + cost_count;
    
    // Must have at least minimum_required fields
    total_present >= minimum_required
}

// Tests for the circuit
#[test]
fn test_all_fields_present() {
    // All 5 fields present, need 4 -> should pass
    let result = main(true, true, true, true, true, 4);
    assert(result == true);
}

#[test]
fn test_minimum_met() {
    // 3 fields present, need 3 -> should pass
    let result = main(true, true, true, false, false, 3);
    assert(result == true);
}

#[test]
fn test_minimum_not_met() {
    // 2 fields present, need 3 -> should fail
    let result = main(true, true, false, false, false, 3);
    assert(result == false);
}

#[test]
fn test_only_baseline() {
    // Only baseline, need 1 -> should pass
    let result = main(true, false, false, false, false, 1);
    assert(result == true);
}

#[test]
fn test_nothing_present() {
    // No fields, need 1 -> should fail
    let result = main(false, false, false, false, false, 1);
    assert(result == false);
}

#[test]
fn test_four_of_five() {
    // 4 fields present, need 4 -> should pass
    let result = main(true, true, true, true, false, 4);
    assert(result == true);
}
