// SolPG global type declarations
// This file provides TypeScript types for Solana Playground globals

declare const pg: {
  program: any;
  wallet: { publicKey: any; signTransaction: (tx: any) => Promise<any> };
  connection: any;
};

declare namespace web3 {
  class PublicKey {
    constructor(value: string | Uint8Array);
    toBuffer(): Uint8Array;
    toString(): string;
    static findProgramAddressSync(seeds: Uint8Array[], programId: PublicKey): [PublicKey, number];
  }
  class Keypair {
    static generate(): Keypair;
    publicKey: PublicKey;
  }
  class Transaction {
    add(...items: TransactionInstruction[]): Transaction;
    feePayer: PublicKey;
    recentBlockhash: string;
    partialSign(keypair: Keypair): void;
    serialize(): Uint8Array;
  }
  class TransactionInstruction {
    constructor(opts: { keys: any[]; programId: PublicKey; data: Uint8Array });
  }
  namespace SystemProgram {
    const programId: PublicKey;
    function createAccount(opts: any): TransactionInstruction;
  }
}

declare namespace BN {
  class BN {
    constructor(value: number | string);
    toNumber(): number;
    toString(): string;
  }
}

declare const Buffer: {
  from(data: string | number[] | Uint8Array): Uint8Array;
  alloc(size: number): Uint8Array & number[];
  concat(list: Uint8Array[]): Uint8Array;
};
