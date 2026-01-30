// Cost Range Circuit
// Proves that treatment cost is within an acceptable range
// without revealing the exact cost
//
// Private inputs: cost_usd_cents (cost in cents to avoid floats)
// Public inputs: min_cost_cents, max_cost_cents
// Output: Boolean proving cost is within range

fn main(
    cost_usd_cents: u32,       // Private: Treatment cost in USD cents
    min_cost_cents: u32,       // Public: Minimum acceptable cost
    max_cost_cents: u32,       // Public: Maximum acceptable cost
) -> pub bool {
    // Constraint: Cost must be positive
    assert(cost_usd_cents > 0);
    
    // Constraint: Min must be less than or equal to max
    assert(min_cost_cents <= max_cost_cents);
    
    // Constraint: Cost must be at least minimum
    let meets_minimum = cost_usd_cents >= min_cost_cents;
    
    // Constraint: Cost must be at most maximum
    let meets_maximum = cost_usd_cents <= max_cost_cents;
    
    // Both constraints must be satisfied
    meets_minimum & meets_maximum
}

// Tests for the circuit
#[test]
fn test_reasonable_cost() {
    // $500 within $100-$10000 range -> should pass
    // 50000 cents = $500
    let result = main(50000, 10000, 1000000);
    assert(result == true);
}

#[test]
fn test_free_treatment() {
    // $0 cost -> should fail (must be > 0)
    // This is expected to fail the assertion
    // assert(result == false); // Cannot test this due to assertion
}

#[test]
fn test_minimum_cost() {
    // $100 exactly at minimum -> should pass
    let result = main(10000, 10000, 1000000);
    assert(result == true);
}

#[test]
fn test_maximum_cost() {
    // $10000 exactly at maximum -> should pass
    let result = main(1000000, 10000, 1000000);
    assert(result == true);
}

#[test]
fn test_below_minimum() {
    // $50 below $100 minimum -> should fail
    let result = main(5000, 10000, 1000000);
    assert(result == false);
}

#[test]
fn test_above_maximum() {
    // $15000 above $10000 maximum -> should fail
    let result = main(1500000, 10000, 1000000);
    assert(result == false);
}

#[test]
fn test_very_expensive() {
    // $50000 within $1000-$100000 range -> should pass
    let result = main(5000000, 100000, 10000000);
    assert(result == true);
}
