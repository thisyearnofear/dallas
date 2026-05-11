/**
 * Components Index - Centralized Component Exports
 * 
 * Core Principles:
 * - DRY: Single import point for all components
 * - CLEAN: Clear organization by category
 * - MODULAR: Easy to discover and use
 */

// Layout Components
export { Header } from './Header';
export { Footer } from './Footer';
export { Navbar } from './Navbar';
export { MobileNav } from './MobileNav';

// Dashboard Components
export { PrivacyDashboard } from './PrivacyDashboard';
export { ValidatorDashboard } from './ValidatorDashboard';
export { ValidatorReputationSystem } from './ValidatorReputationSystem';

// Mobile Components
export {
  NotificationToast,
  FloatingActionButton,
  ScrollToTop,
  LiveCounter,
  ProgressTracker,
  SwipeGestures,
  OfflineIndicator,
  MobileContainer,
  TouchButton,
  SafeAreaStyles,
  useNotification,
  usePullToRefresh,
  useViewportHeight,
  useIsMobile,
  useTouchFeedback,
} from './MobileEnhancements';

export type { NotificationProps, TouchButtonProps } from './MobileEnhancements';

// Wallet Components
export { WalletButton } from './WalletButton';

// Form Components
export { EncryptedOptimizationLogForm } from './EncryptedOptimizationLogForm';

// Display Components
export { OptimizationLogGallery } from './OptimizationLogGallery';
export { LiveActivityFeed, AllianceTicker } from './LiveActivityFeed';
export { ProtocolCard } from './ProtocolCard';
export { ProductCard } from './ProductCard';

// Token Components
export { AttentionTokenMarket } from './AttentionTokenMarket';
export { AttentionTokenCreation } from './AttentionTokenCreation';
export { AttentionTokenLeaderboard } from './AttentionTokenLeaderboard';
export { AttentionTokenPortfolio } from './AttentionTokenPortfolio';
export { AttentionTokenAnalyticsDashboard } from './AttentionTokenAnalyticsDashboard';

// Membership Components
export { MembershipSystem } from './MembershipSystem';

// Privacy Components
export { PrivacyTooltip } from './PrivacyTooltip';
export { PrivacyOnboardingModal } from './PrivacyOnboardingModal';
export { PrivacyScorePreview } from './PrivacyScorePreview';
export { ServiceReadinessPanel } from './ServiceReadinessPanel';

// Achievement Components
export { AchievementSystem } from './AchievementSystem';

// Referral Components
export { ReferralSystem } from './ReferralSystem';

// Retro/Theme Components
export { InfomercialPopup, RetroButton, RetroModal, RetroTerminal } from './RetroAesthetics';
export { Authentic90sPopups, LiveActivityNotifications, WinnerPopup } from './Authentic90sPopups';

// Shared UI Components (from decomposed modules)
export {
  TermsAcceptanceModal,
  DisclaimerBanner,
} from './LegalComponents';
export { ProgressIndicator } from './ProgressIndicator';

// Error Handling
export { ErrorBoundary } from './ErrorBoundary';
export { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';

// Loading Components
export { NetworkStatus } from './NetworkStatus';
export { TransactionHistory } from './TransactionHistory';
export { SettingsPanel } from './SettingsPanel';
export { ViralSidebar } from './ViralSidebar';
