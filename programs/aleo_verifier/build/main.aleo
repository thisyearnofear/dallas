program dbc_verifier.aleo;

function verify_benchmark_delta:
    input r0 as u32.private;
    input r1 as u32.private;
    input r2 as u32.private;
    input r3 as field.private;
    gte r1 r0 into r4;
    assert.eq r4 true;
    sub r1 r0 into r5;
    gte r5 r2 into r6;
    assert.eq r6 true;
    output r5 as u32.private;
    output true as boolean.private;

function verify_benchmark_with_cost:
    input r0 as u32.private;
    input r1 as u32.private;
    input r2 as u32.private;
    input r3 as u32.private;
    input r4 as u32.private;
    gte r1 r0 into r5;
    assert.eq r5 true;
    sub r1 r0 into r6;
    gte r6 r2 into r7;
    assert.eq r7 true;
    lte r3 r4 into r8;
    assert.eq r8 true;
    output r6 as u32.private;
    output true as boolean.private;

constructor:
    assert.eq edition 0u16;
