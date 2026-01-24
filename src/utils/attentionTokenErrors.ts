/**
 * Attention Token Error Handling
 * Centralized error handling for attention token operations
 */

export enum AttentionTokenErrorCode {
  // API Errors
  BAGS_API_NOT_CONFIGURED = 'BAGS_API_NOT_CONFIGURED',
  BAGS_API_RATE_LIMIT = 'BAGS_API_RATE_LIMIT',
  BAGS_API_INVALID_KEY = 'BAGS_API_INVALID_KEY',
  BAGS_API_REQUEST_FAILED = 'BAGS_API_REQUEST_FAILED',
  
  // Eligibility Errors
  INSUFFICIENT_REPUTATION = 'INSUFFICIENT_REPUTATION',
  INSUFFICIENT_VALIDATORS = 'INSUFFICIENT_VALIDATORS',
  TOKEN_ALREADY_EXISTS = 'TOKEN_ALREADY_EXISTS',
  CASE_STUDY_NOT_APPROVED = 'CASE_STUDY_NOT_APPROVED',
  
  // Creation Errors
  TOKEN_CREATION_FAILED = 'TOKEN_CREATION_FAILED',
  FEE_CONFIG_FAILED = 'FEE_CONFIG_FAILED',
  ON_CHAIN_LINK_FAILED = 'ON_CHAIN_LINK_FAILED',
  
  // Wallet Errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_SOL = 'INSUFFICIENT_SOL',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  RPC_ERROR = 'RPC_ERROR',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AttentionTokenError extends Error {
  constructor(
    public code: AttentionTokenErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AttentionTokenError';
  }
}

/**
 * Parse error and return user-friendly message
 */
export function parseAttentionTokenError(error: any): {
  code: AttentionTokenErrorCode;
  message: string;
  userMessage: string;
  details?: any;
} {
  // Handle AttentionTokenError
  if (error instanceof AttentionTokenError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: getErrorUserMessage(error.code, error.details),
      details: error.details,
    };
  }

  // Handle HTTP errors
  if (error.status) {
    switch (error.status) {
      case 429:
        return {
          code: AttentionTokenErrorCode.BAGS_API_RATE_LIMIT,
          message: 'Rate limit exceeded',
          userMessage: 'Too many requests. Please try again in an hour.',
        };
      case 401:
        return {
          code: AttentionTokenErrorCode.BAGS_API_INVALID_KEY,
          message: 'Invalid API key',
          userMessage: 'API authentication failed. Please check your configuration.',
        };
      case 400:
        return {
          code: AttentionTokenErrorCode.BAGS_API_REQUEST_FAILED,
          message: error.message || 'Bad request',
          userMessage: 'Invalid request. Please check your input and try again.',
          details: error.details,
        };
      default:
        return {
          code: AttentionTokenErrorCode.BAGS_API_REQUEST_FAILED,
          message: `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`,
          userMessage: 'API request failed. Please try again later.',
        };
    }
  }

  // Handle wallet errors
  if (error.message?.includes('User rejected') || error.code === 4001) {
    return {
      code: AttentionTokenErrorCode.TRANSACTION_REJECTED,
      message: 'Transaction rejected by user',
      userMessage: 'You rejected the transaction. Please try again and approve it.',
    };
  }

  if (error.message?.includes('insufficient funds') || error.message?.includes('Insufficient SOL')) {
    return {
      code: AttentionTokenErrorCode.INSUFFICIENT_SOL,
      message: 'Insufficient SOL balance',
      userMessage: 'You need at least 1 SOL for initial liquidity. Please add funds to your wallet.',
    };
  }

  // Handle network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
    return {
      code: AttentionTokenErrorCode.NETWORK_ERROR,
      message: 'Network connection failed',
      userMessage: 'Network error. Please check your connection and try again.',
    };
  }

  // Handle program errors
  if (error.message?.includes('not approved')) {
    return {
      code: AttentionTokenErrorCode.CASE_STUDY_NOT_APPROVED,
      message: 'Case study not approved',
      userMessage: 'Your case study must be approved before creating an attention token.',
    };
  }

  if (error.message?.includes('already exists')) {
    return {
      code: AttentionTokenErrorCode.TOKEN_ALREADY_EXISTS,
      message: 'Attention token already exists',
      userMessage: 'This case study already has an attention token.',
    };
  }

  if (error.message?.includes('reputation')) {
    return {
      code: AttentionTokenErrorCode.INSUFFICIENT_REPUTATION,
      message: 'Insufficient reputation score',
      userMessage: 'Your case study needs a reputation score of 75+ to create an attention token.',
    };
  }

  if (error.message?.includes('validators')) {
    return {
      code: AttentionTokenErrorCode.INSUFFICIENT_VALIDATORS,
      message: 'Insufficient validators',
      userMessage: 'Your case study needs at least 5 validators to create an attention token.',
    };
  }

  // Default unknown error
  return {
    code: AttentionTokenErrorCode.UNKNOWN_ERROR,
    message: error.message || 'Unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
    details: error,
  };
}

/**
 * Get user-friendly error message for error code
 */
function getErrorUserMessage(code: AttentionTokenErrorCode, details?: any): string {
  switch (code) {
    case AttentionTokenErrorCode.BAGS_API_NOT_CONFIGURED:
      return 'Attention token features are not configured. Please contact the administrator.';
    
    case AttentionTokenErrorCode.BAGS_API_RATE_LIMIT:
      return 'Too many requests. Please wait an hour before trying again.';
    
    case AttentionTokenErrorCode.BAGS_API_INVALID_KEY:
      return 'API authentication failed. Please check your configuration.';
    
    case AttentionTokenErrorCode.BAGS_API_REQUEST_FAILED:
      return details?.message || 'API request failed. Please try again.';
    
    case AttentionTokenErrorCode.INSUFFICIENT_REPUTATION:
      return 'Your case study needs a reputation score of 75+ to create an attention token.';
    
    case AttentionTokenErrorCode.INSUFFICIENT_VALIDATORS:
      return 'Your case study needs at least 5 validators to create an attention token.';
    
    case AttentionTokenErrorCode.TOKEN_ALREADY_EXISTS:
      return 'This case study already has an attention token.';
    
    case AttentionTokenErrorCode.CASE_STUDY_NOT_APPROVED:
      return 'Your case study must be approved before creating an attention token.';
    
    case AttentionTokenErrorCode.TOKEN_CREATION_FAILED:
      return 'Failed to create attention token. Please try again.';
    
    case AttentionTokenErrorCode.FEE_CONFIG_FAILED:
      return 'Failed to configure fee distribution. Please contact support.';
    
    case AttentionTokenErrorCode.ON_CHAIN_LINK_FAILED:
      return 'Failed to link token on-chain. Please try again.';
    
    case AttentionTokenErrorCode.WALLET_NOT_CONNECTED:
      return 'Please connect your wallet to continue.';
    
    case AttentionTokenErrorCode.INSUFFICIENT_SOL:
      return 'You need at least 1 SOL for initial liquidity. Please add funds to your wallet.';
    
    case AttentionTokenErrorCode.TRANSACTION_REJECTED:
      return 'You rejected the transaction. Please try again and approve it.';
    
    case AttentionTokenErrorCode.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';
    
    case AttentionTokenErrorCode.RPC_ERROR:
      return 'Blockchain RPC error. Please try again or switch RPC endpoint.';
    
    case AttentionTokenErrorCode.UNKNOWN_ERROR:
    default:
      return 'An unexpected error occurred. Please try again or contact support.';
  }
}

/**
 * Validate attention token creation parameters
 */
export function validateAttentionTokenParams(params: {
  treatmentName: string;
  description: string;
  reputationScore: number;
  validatorCount: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.treatmentName || params.treatmentName.trim().length < 3) {
    errors.push('Treatment name must be at least 3 characters');
  }

  if (params.treatmentName && params.treatmentName.length > 50) {
    errors.push('Treatment name must be less than 50 characters');
  }

  if (!params.description || params.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }

  if (params.description && params.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (params.reputationScore < 75) {
    errors.push('Reputation score must be at least 75');
  }

  if (params.validatorCount < 5) {
    errors.push('At least 5 validators are required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log attention token error for debugging
 */
export function logAttentionTokenError(
  operation: string,
  error: any,
  context?: any
): void {
  const parsedError = parseAttentionTokenError(error);
  
  console.error(`[AttentionToken][${operation}] Error:`, {
    code: parsedError.code,
    message: parsedError.message,
    userMessage: parsedError.userMessage,
    details: parsedError.details,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: any): boolean {
  const parsedError = parseAttentionTokenError(error);
  
  const recoverableCodes = [
    AttentionTokenErrorCode.NETWORK_ERROR,
    AttentionTokenErrorCode.RPC_ERROR,
    AttentionTokenErrorCode.BAGS_API_REQUEST_FAILED,
  ];
  
  return recoverableCodes.includes(parsedError.code);
}

/**
 * Get retry delay for recoverable errors
 */
export function getRetryDelay(attemptNumber: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
  return Math.min(1000 * Math.pow(2, attemptNumber), 16000);
}
