/**
 * Governance Service - On-chain Governance for DBC
 * 
 * Single source of truth for all governance operations.
 * 
 * Core Principles:
 * - DRY: Centralized governance logic
 * - MODULAR: Composable functions
 * - CLEAN: Clear separation of concerns
 */

import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { SOLANA_CONFIG } from '../config/solana';

export const GOVERNANCE_PROGRAM_ID = new PublicKey(
  SOLANA_CONFIG.blockchain.governanceProgramId || 'DBCGoVFq5xGnD1WNCLauKoFG4Y4Rw3xPp3z3t8X6w3x'
);

export const GOVERNANCE_CONFIG = {
  PROPOSAL_THRESHOLD: 1_000_000, // 1M DBC to create proposal
  VOTING_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
  EXECUTION_DELAY: 2 * 24 * 60 * 60, // 2 days in seconds
  QUORUM_THRESHOLD: 10, // 10% of supply must vote
};

export enum ProposalType {
  ParameterChange = 0,
  TreasuryDistribution = 1,
  CommunityGrant = 2,
  ProtocolUpgrade = 3,
  Emergency = 4,
}

export enum ProposalState {
  Draft = 0,
  Active = 1,
  Executed = 2,
  Canceled = 3,
  Vetoed = 4,
}

export enum Vote {
  For = 0,
  Against = 1,
  Abstain = 2,
}

export interface Proposal {
  pubkey: PublicKey;
  proposer: PublicKey;
  title: string;
  description: string;
  proposalType: ProposalType;
  state: ProposalState;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  voterCount: number;
  createdAt: number;
  votingStartsAt: number;
  votingEndsAt: number;
  executionAt: number;
}

export interface VoteRecord {
  proposal: PublicKey;
  voter: PublicKey;
  vote: Vote;
  votes: number;
  votedAt: number;
}

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  executedProposals: number;
  totalVoters: number;
}

function getProposalPDA(proposalIndex: number, governance: PublicKey): PublicKey {
  const seeds = [
    Buffer.from('proposal'),
    governance.toBuffer(),
    Buffer.from(proposalIndex.toString()),
  ];
  return PublicKey.findProgramAddressSync(seeds, GOVERNANCE_PROGRAM_ID)[0];
}

function getVoteRecordPDA(proposal: PublicKey, voter: PublicKey): PublicKey {
  const seeds = [
    Buffer.from('vote'),
    proposal.toBuffer(),
    voter.toBuffer(),
  ];
  return PublicKey.findProgramAddressSync(seeds, GOVERNANCE_PROGRAM_ID)[0];
}

function getDelegatePDA(delegator: PublicKey): PublicKey {
  const seeds = [Buffer.from('delegate'), delegator.toBuffer()];
  return PublicKey.findProgramAddressSync(seeds, GOVERNANCE_PROGRAM_ID)[0];
}

export async function createProposal(
  connection: Connection,
  proposer: PublicKey,
  title: string,
  description: string,
  proposalType: ProposalType,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<{ signature: string; proposal: PublicKey }> {
  const governance = GOVERNANCE_PROGRAM_ID;
  const proposalIndex = 0; // Would fetch from program in production
  const proposal = getProposalPDA(proposalIndex, governance);

  const transaction = new Transaction();

  // Create proposal instruction (simplified - actual IDL needed)
  const data = Buffer.alloc(8);
  data.writeUInt32LE(0, 0); // create_proposal discriminator

  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: governance, isSigner: false, isWritable: true },
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: proposer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: GOVERNANCE_PROGRAM_ID,
      data,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = proposer;

  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());

  return { signature, proposal };
}

export async function castVote(
  connection: Connection,
  voter: PublicKey,
  proposal: PublicKey,
  vote: Vote,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const governance = GOVERNANCE_PROGRAM_ID;
  const voteRecord = getVoteRecordPDA(proposal, voter);

  const transaction = new Transaction();

  const data = Buffer.alloc(8);
  data.writeUInt32LE(1, 0); // cast_vote discriminator

  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: governance, isSigner: false, isWritable: true },
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: voteRecord, isSigner: false, isWritable: true },
        { pubkey: voter, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: GOVERNANCE_PROGRAM_ID,
      data,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = voter;

  const signed = await signTransaction(transaction);
  return await connection.sendRawTransaction(signed.serialize());
}

export async function executeProposal(
  connection: Connection,
  executor: PublicKey,
  proposal: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const governance = GOVERNANCE_PROGRAM_ID;

  const transaction = new Transaction();

  const data = Buffer.alloc(8);
  data.writeUInt32LE(2, 0); // execute_proposal discriminator

  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: governance, isSigner: false, isWritable: true },
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: executor, isSigner: true, isWritable: true },
      ],
      programId: GOVERNANCE_PROGRAM_ID,
      data,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = executor;

  const signed = await signTransaction(transaction);
  return await connection.sendRawTransaction(signed.serialize());
}

export async function delegateVotes(
  connection: Connection,
  delegator: PublicKey,
  delegate: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const delegateRecord = getDelegatePDA(delegator);

  const transaction = new Transaction();

  const data = Buffer.alloc(8);
  data.writeUInt32LE(3, 0); // delegate_votes discriminator

  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: delegateRecord, isSigner: false, isWritable: true },
        { pubkey: delegator, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: GOVERNANCE_PROGRAM_ID,
      data,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = delegator;

  const signed = await signTransaction(transaction);
  return await connection.sendRawTransaction(signed.serialize());
}

export function formatProposalType(type: ProposalType): string {
  const labels = {
    [ProposalType.ParameterChange]: 'Parameter Change',
    [ProposalType.TreasuryDistribution]: 'Treasury Distribution',
    [ProposalType.CommunityGrant]: 'Community Grant',
    [ProposalType.ProtocolUpgrade]: 'Protocol Upgrade',
    [ProposalType.Emergency]: 'Emergency',
  };
  return labels[type] || 'Unknown';
}

export function formatProposalState(state: ProposalState): string {
  const labels = {
    [ProposalState.Draft]: 'Draft',
    [ProposalState.Active]: 'Active',
    [ProposalState.Executed]: 'Executed',
    [ProposalState.Canceled]: 'Canceled',
    [ProposalState.Vetoed]: 'Vetoed',
  };
  return labels[state] || 'Unknown';
}

export function formatVote(vote: Vote): string {
  const labels = {
    [Vote.For]: 'For',
    [Vote.Against]: 'Against',
    [Vote.Abstain]: 'Abstain',
  };
  return labels[vote] || 'Unknown';
}

export function calculateQuorum(totalSupply: number, quorumThreshold: number): number {
  return (totalSupply * quorumThreshold) / 100;
}

export function hasReachedQuorum(
  forVotes: number,
  againstVotes: number,
  abstainVotes: number,
  totalSupply: number,
  quorumThreshold: number
): boolean {
  const totalVotes = forVotes + againstVotes + abstainVotes;
  return totalVotes >= calculateQuorum(totalSupply, quorumThreshold);
}

export function hasPassed(forVotes: number, againstVotes: number): boolean {
  return forVotes > againstVotes;
}
