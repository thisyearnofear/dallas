/**
 * Progress Indicator Components
 * 
 * Visual feedback for multi-step async operations.
 * Essential for UX - users need to see progress.
 */

import { FunctionalComponent } from 'preact';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export type StepStatus = 'pending' | 'loading' | 'complete' | 'error';

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  stepStatuses: StepStatus[];
  title?: string;
}

export const ProgressIndicator: FunctionalComponent<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  stepStatuses,
  title,
}) => {
  return (
    <div class="w-full max-w-md mx-auto">
      {title && (
        <h3 class="text-lg font-semibold text-center mb-6 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      
      <div class="space-y-4">
        {steps.map((step, index) => {
          const status = stepStatuses[index] || 'pending';
          const isActive = index === currentStep;
          const isComplete = status === 'complete';
          const isError = status === 'error';
          const isLoading = status === 'loading';

          return (
            <div 
              key={step.id}
              class={`flex items-start gap-4 transition-opacity duration-300 ${
                index > currentStep ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Step Indicator */}
              <div class="flex flex-col items-center">
                <div 
                  class={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isComplete 
                      ? 'bg-green-500 text-white' 
                      : isError
                        ? 'bg-red-500 text-white'
                        : isActive
                          ? 'bg-blue-500 text-white animate-pulse'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {isComplete ? '✓' : isError ? '!' : isLoading ? '◌' : index + 1}
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div 
                    class={`w-0.5 h-8 mt-2 transition-colors duration-300 ${
                      isComplete ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>

              {/* Step Content */}
              <div class="flex-1 pt-2">
                <h4 
                  class={`font-medium transition-colors duration-300 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : isComplete
                        ? 'text-green-600 dark:text-green-400'
                        : isError
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {step.label}
                </h4>
                
                {step.description && (
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                )}
                
                {isLoading && (
                  <div class="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============= SIMPLIFIED LOADING STATES =============

interface LoadingStateProps {
  message: string;
  submessage?: string;
  progress?: number; // 0-100
}

export const LoadingState: FunctionalComponent<LoadingStateProps> = ({
  message,
  submessage,
  progress,
}) => {
  return (
    <div class="flex flex-col items-center justify-center p-8">
      <div class="relative w-16 h-16 mb-4">
        <div class="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
        <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      
      <p class="text-lg font-medium text-gray-900 dark:text-white">{message}</p>
      
      {submessage && (
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{submessage}</p>
      )}
      
      {progress !== undefined && (
        <div class="w-full max-w-xs mt-4">
          <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p class="text-center text-sm text-gray-500 mt-2">{progress}%</p>
        </div>
      )}
    </div>
  );
};

// ============= SKELETON LOADING =============

interface SkeletonProps {
  lines?: number;
  className?: string;
}

export const Skeleton: FunctionalComponent<SkeletonProps> = ({ 
  lines = 3,
  className = '' 
}) => {
  return (
    <div class={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          class="h-4 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

// ============= TRANSACTION STEPS PRESETS =============

export const VALIDATION_STEPS: Step[] = [
  { id: 'stake', label: 'Stake DBC', description: 'Locking 100 DBC as collateral' },
  { id: 'validate', label: 'Submit Validation', description: 'Sending ZK proof to blockchain' },
  { id: 'confirm', label: 'Confirmation', description: 'Waiting for network confirmation' },
  { id: 'reward', label: 'Earn Reward', description: 'Receiving DBC for accurate validation' },
];

export const SUBMISSION_STEPS: Step[] = [
  { id: 'encrypt', label: 'Encrypt Data', description: 'Securing your case study with ZK encryption' },
  { id: 'upload', label: 'Upload to IPFS', description: 'Storing encrypted data on decentralized storage' },
  { id: 'submit', label: 'Submit On-Chain', description: 'Creating case study record on Solana' },
  { id: 'validate', label: 'Await Validation', description: 'Waiting for community validators' },
];

export const STAKING_STEPS: Step[] = [
  { id: 'approve', label: 'Approve DBC', description: 'Authorizing DBC token transfer' },
  { id: 'stake', label: 'Stake Tokens', description: 'Locking DBC in validator stake account' },
  { id: 'confirm', label: 'Confirmation', description: 'Finalizing stake on blockchain' },
];

export default ProgressIndicator;
