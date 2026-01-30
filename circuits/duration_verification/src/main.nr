// Duration Verification Circuit
// Proves that treatment duration is within acceptable bounds
// without revealing exact start/end dates
//
// Private inputs: start_timestamp, end_timestamp
// Public inputs: min_days, max_days
// Output: Boolean proving duration is within range

fn main(
    duration_days: u16,       // Private: Actual treatment duration in days
    min_days: u16,            // Public: Minimum acceptable duration
    max_days: u16,            // Public: Maximum acceptable duration
) -> pub bool {
    // Constraint: Duration must be positive
    assert(duration_days > 0);
    
    // Constraint: Min must be less than or equal to max
    assert(min_days <= max_days);
    
    // Constraint: Duration must be at least min_days
    let meets_minimum = duration_days >= min_days;
    
    // Constraint: Duration must be at most max_days
    let meets_maximum = duration_days <= max_days;
    
    // Both constraints must be satisfied
    meets_minimum & meets_maximum
}

// Tests for the circuit
#[test]
fn test_valid_duration() {
    // 30 days within 7-90 day range -> should pass
    let result = main(30, 7, 90);
    assert(result == true);
}

#[test]
fn test_exact_minimum() {
    // 7 days exactly at minimum -> should pass
    let result = main(7, 7, 90);
    assert(result == true);
}

#[test]
fn test_exact_maximum() {
    // 90 days exactly at maximum -> should pass
    let result = main(90, 7, 90);
    assert(result == true);
}

#[test]
fn test_below_minimum() {
    // 3 days below 7 day minimum -> should fail
    let result = main(3, 7, 90);
    assert(result == false);
}

#[test]
fn test_above_maximum() {
    // 100 days above 90 day maximum -> should fail
    let result = main(100, 7, 90);
    assert(result == false);
}

#[test]
fn test_short_protocol() {
    // 3 days within 1-7 day range (short protocol) -> should pass
    let result = main(3, 1, 7);
    assert(result == true);
}

#[test]
fn test_long_protocol() {
    // 180 days within 90-365 day range (long protocol) -> should pass
    let result = main(180, 90, 365);
    assert(result == true);
}
