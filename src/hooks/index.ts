/**
 * Hooks Index - Centralized Hook Exports
 * 
 * Core Principles:
 * - DRY: Single import point for all hooks
 * - CLEAN: Clear organization
 * - MODULAR: Easy to discover and use
 */

// Wallet & Blockchain
export { useWallet } from '../context/WalletContext';
export { useDbcToken } from './useDbcToken';
export { useValidatorStaking } from './useValidatorStaking';

// Privacy & Security
export { useConsent } from './useConsent';

// Agents & MCP
export { useAgentNetwork } from './useAgentNetwork';
export { useEdenlayerIntegration } from './useEdenlayerIntegration';

// Performance
export { usePagination } from './usePagination';
export { 
  useLazyImage, 
  useLazyComponent, 
  useLazyGallery,
  useZKProofWorker,
  ImageSkeleton,
  CardSkeleton,
  TextSkeleton,
} from './useLazyLoad';

// Mobile
// Mobile
export {
  useNotification,
  usePullToRefresh,
  useViewportHeight,
  useIsMobile,
  useTouchFeedback,
} from '../components/MobileEnhancements';

// Re-export preact hooks for convenience
export { useState, useEffect, useCallback, useRef, useContext } from 'preact/hooks';

// Re-export types
export type { UseDbcTokenReturn } from './useDbcToken';
export type { UseValidatorStakingReturn, ValidatorStakingState } from './useValidatorStaking';
export type { UsePaginationReturn } from './usePagination';
