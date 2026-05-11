import { useState, useEffect } from 'preact/hooks';

export interface UserJourneyProgress {
  walletConnected: boolean;
  firstLogSubmitted: boolean;
  privacyScoreViewed: boolean;
  agentDeployed: boolean;
  firstValidationComplete: boolean;
}

export function useUserJourney() {
  const [progress, setProgress] = useState<UserJourneyProgress>({
    walletConnected: false,
    firstLogSubmitted: false,
    privacyScoreViewed: false,
    agentDeployed: false,
    firstValidationComplete: false,
  });

  const loadProgress = () => {
    const stored = localStorage.getItem('dbc-user-progress');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProgress(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse user progress', e);
      }
    }
    
    // Check wallet connection explicitly
    const walletAddr = localStorage.getItem('dbc-wallet-address');
    if (walletAddr) {
      setProgress(prev => ({ ...prev, walletConnected: true }));
    }
  };

  useEffect(() => {
    loadProgress();
    // Listen for storage changes from other tabs/components
    window.addEventListener('storage', loadProgress);
    return () => window.removeEventListener('storage', loadProgress);
  }, []);

  const updateProgress = (key: keyof UserJourneyProgress, value: boolean) => {
    setProgress(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('dbc-user-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const resetProgress = () => {
    localStorage.removeItem('dbc-user-progress');
    setProgress({
      walletConnected: false,
      firstLogSubmitted: false,
      privacyScoreViewed: false,
      agentDeployed: false,
      firstValidationComplete: false,
    });
  };

  const completedSteps = Object.values(progress).filter(Boolean).length;
  const totalSteps = Object.keys(progress).length;
  const percentage = Math.round((completedSteps / totalSteps) * 100);

  return {
    progress,
    updateProgress,
    resetProgress,
    completedSteps,
    totalSteps,
    percentage,
    isComplete: completedSteps === totalSteps
  };
}
