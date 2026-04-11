program aleo_verifier.aleo;

function verify_benchmark_delta:
    input r0 as u32.private;
    input r1 as u32.private;
    input r2 as u32.public;
    input r3 as field.public;
    gte r4 r1 r0 into r4;
    assert.eq r4 true;
    sub r5 r0 r1 into r5;
    gte r6 r5 r2 into r6;
    assert.eq r6 true;
    assert.eq r3 11223344556677889900field;
    output r5 as u32.public;
    output true as boolean.public;

function verify_benchmark_with_cost:
    input r0 as u32.private;
    input r1 as u32.private;
    input r2 as u32.public;
    input r3 as u32.public;
    input r4 as field.public;
    gte r5 r1 r0 into r5;
    assert.eq r5 true;
    sub r6 r0 r1 into r6;
    gte r7 r6 r2 into r7;
    assert.eq r7 true;
    lte r8 r3 r4 into r8;
    assert.eq r8 true;
    output r6 as u32.public;
    output true as boolean.public;
