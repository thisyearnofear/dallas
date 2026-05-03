// Barrel re-export - All components decomposed into individual modular files
// Re-exports maintain backward compatibility with all existing importers

// Modal
export { AgentEnhancedModal } from './Modal';
export { AgentEnhancedModal as Modal } from './Modal';

// Loading Screen
export { AgentLoadingScreen } from './LoadingScreen';
export { AgentLoadingScreen as LoadingScreen } from './LoadingScreen';

// Network Status
export { EnhancedNetworkStatus } from './EnhancedNetworkStatus';
export { EnhancedNetworkStatus as NetworkStatus } from './EnhancedNetworkStatus';

// Danger Indicator
export { AgentEnhancedDangerIndicator } from './DangerIndicator';
export { AgentEnhancedDangerIndicator as DangerIndicator } from './DangerIndicator';

// Terminal
export { EnhancedTerminalInterface } from './Terminal';
export { EnhancedTerminalInterface as Terminal } from './Terminal';

// Legal Components
export {
  DisclaimerBanner,
  SubmissionConsentCheckboxes,
  TermsOfServiceContent,
  PrivacyPolicyContent,
  TermsAcceptanceModal,
  DiscoveryDisclaimer
} from './LegalComponents';