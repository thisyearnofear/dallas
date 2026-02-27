/**
 * Community Types - Unified with Attention Tokens
 * Follows Core Principles: DRY, CLEAN, MODULAR
 * 
 * Communities ARE attention tokens with additional metadata.
 * No separate token system - communities use Bags API bonding curves.
 */

import { PublicKey } from '@solana/web3.js';
import { AttentionToken } from './attentionToken';

/**
 * Community Category Taxonomy
 * Aligns with agent challenges and optimization domains
 */
export type CommunityCategory = 
  | 'context_management'  // context window, memory, RAG, chunking
  | 'tool_calling'        // function calling, API integration, tool use
  | 'evaluation'          // benchmarks, evals, testing frameworks
  | 'orchestration';      // multi-agent, workflows, pipelines

/**
 * Community - Extended Attention Token
 * Every community is an attention token with additional governance/social features
 */
export interface Community extends AttentionToken {
  // Category
  category: CommunityCategory;
  
  // Governance
  creator: string;              // Wallet address of community founder
  createdAt: number;            // Unix timestamp
  
  // Social (Farcaster - optional)
  farcasterChannel?: string;    // e.g., '/context-masters'
  socialEnabled: boolean;       // Whether community has social layer
  
  // Stats (derived from on-chain data)
  memberCount: number;          // Token holders
  optimizationLogCount: number;       // Submitted optimization logs
  validatedCount: number;       // Validator-approved submissions
  treasuryBalance: number;      // SOL in community treasury
  
  // Metadata
  longDescription?: string;     // Extended mission statement
  guidelines?: string[];        // Community rules/expectations
  researchGoals?: string[];     // What the community aims to prove/discover
}

/**
 * Community Creation Request
 * Minimal data needed to launch a community
 */
export interface CreateCommunityRequest {
  // Identity
  name: string;                 // e.g., "Collagen Community"
  symbol: string;               // e.g., "COLLA"
  category: CommunityCategory;
  
  // Description
  description: string;          // Short pitch (1-2 sentences)
  longDescription?: string;     // Extended description
  imageUrl?: string;            // Logo/banner
  
  // Social
  enableSocial: boolean;        // Create Farcaster channel?
  
  // Governance
  guidelines?: string[];        // Community rules (optional)
  researchGoals?: string[];     // Research objectives (optional)
}

/**
 * Community Discovery Filters
 * Used for browsing/searching alliances
 */
export interface CommunityFilters {
  category?: CommunityCategory;
  minMembers?: number;
  minCaseStudies?: number;
  sortBy?: 'members' | 'volume' | 'recent' | 'success';
  searchQuery?: string;
}

/**
 * Helper: Get category display info
 */
export const CATEGORY_INFO: Record<CommunityCategory, { 
  icon: string; 
  label: string; 
  description: string;
  examples: string[];
}> = {
  context_management: {
    icon: '🧠',
    label: 'Context Management',
    description: 'Context window optimization, memory systems, RAG pipelines',
    examples: ['Context Chunking', 'Long-term Memory', 'RAG Optimization', 'Token Budgeting']
  },
  tool_calling: {
    icon: '🔧',
    label: 'Tool Calling',
    description: 'Function calling patterns, API integration, tool orchestration',
    examples: ['Function Routing', 'API Chaining', 'Error Recovery', 'Schema Design']
  },
  evaluation: {
    icon: '📊',
    label: 'Evaluation',
    description: 'Benchmarks, eval frameworks, testing infrastructure',
    examples: ['Custom Evals', 'A/B Testing', 'Regression Detection', 'Safety Scoring']
  },
  orchestration: {
    icon: '⚙️',
    label: 'Orchestration',
    description: 'Multi-agent workflows, pipelines, coordination patterns',
    examples: ['Agent Handoffs', 'Pipeline Design', 'Parallel Execution', 'State Management']
  }
};

/**
 * Helper: Validate community name
 */
export function validateCommunityName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Name must be 50 characters or less' };
  }
  return { valid: true };
}

/**
 * Helper: Generate symbol from name
 */
export function generateSymbol(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
}
