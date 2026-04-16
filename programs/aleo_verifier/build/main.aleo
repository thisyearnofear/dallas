program dbc_verifier.aleo;

function verify_benchmark_delta:
    input r0 as u32.public;
    input r1 as u32.public;
    input r2 as u32.public;
    input r3 as field.public;
    sub r1 r0 into r4;
    gte r4 r2 into r5;
    assert.eq r5 true;
    output r4 as u32.private;

function verify_benchmark_with_cost:
    input r0 as u32.public;
    input r1 as u32.public;
    input r2 as u32.public;
    input r3 as u32.public;
    input r4 as field.public;
    sub r1 r0 into r5;
    gte r5 r2 into r6;
    assert.eq r6 true;
    output r5 as u32.private;
