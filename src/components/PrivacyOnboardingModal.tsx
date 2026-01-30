import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { PrivacyTooltip } from './PrivacyTooltip';

interface PrivacyOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to the Club',
    subtitle: 'Your health data belongs to you',
    icon: '🤝',
    content: [
      {
        title: 'What makes us different?',
        text: 'Unlike Facebook groups or Reddit, your health data is encrypted with your wallet. We literally cannot access it.',
      },
      {
        title: 'Why this matters',
        text: 'Health data is valuable. Big tech sells it. We protect it. Your experiments, your control.',
      },
    ],
    color: 'blue',
  },
  {
    id: 'encryption',
    title: 'Wallet-Locked Encryption',
    subtitle: 'Only you hold the key',
    icon: '🔐',
    content: [
      {
        title: 'How it works',
        text: 'When you connect your wallet, we derive an encryption key. This key never leaves your device.',
      },
      {
        title: 'What this means',
        text: 'Even if our servers are compromised, your health data remains secure. Only your wallet can decrypt it.',
      },
    ],
    color: 'green',
  },
  {
    id: 'validation',
    title: 'Verify Without Revealing',
    subtitle: 'Zero-knowledge proofs',
    icon: '🛡️',
    content: [
      {
        title: 'The problem',
        text: 'How do validators check data quality without seeing sensitive health details?',
      },
      {
        title: 'Our solution',
        text: 'Zero-knowledge proofs let validators verify "this data is complete" without seeing what the data actually is.',
      },
    ],
    color: 'purple',
  },
  {
    id: 'committee',
    title: 'Committee-Based Access',
    subtitle: 'No single point of failure',
    icon: '👥',
    content: [
      {
        title: 'Multi-party security',
        text: 'Researchers need approval from 3 of 5 committee members to access decrypted data.',
      },
      {
        title: 'Your control',
        text: 'You can revoke access at any time. No single person can view your data alone.',
      },
    ],
    color: 'orange',
  },
  {
    id: 'ready',
    title: 'You\'re Ready',
    subtitle: 'Start your health sovereignty journey',
    icon: '🚀',
    content: [
      {
        title: 'Your privacy score',
        text: 'As you use privacy features, you\'ll see a live privacy score (0-100). Aim for maximum protection!',
      },
      {
        title: 'What\'s next',
        text: 'Explore communities, share your experiences, or validate others. All with privacy built-in.',
      },
    ],
    color: 'green',
  },
];

export const PrivacyOnboardingModal: FunctionalComponent<PrivacyOnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  // Check if user has seen onboarding
  useEffect(() => {
    const seen = localStorage.getItem('dbc-privacy-onboarding');
    setHasSeenOnboarding(!!seen);
  }, []);

  if (!isOpen || hasSeenOnboarding) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem('dbc-privacy-onboarding', 'true');
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('dbc-privacy-onboarding', 'true');
    onComplete();
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string; button: string }> = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-200 dark:border-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
      button: 'bg-green-600 hover:bg-green-700',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-800 dark:text-purple-200',
      border: 'border-purple-200 dark:border-purple-800',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-800 dark:text-orange-200',
      border: 'border-orange-200 dark:border-orange-800',
      button: 'bg-orange-600 hover:bg-orange-700',
    },
  };

  const colors = colorClasses[step.color];

  return (
    <div class="fixed inset-0 bg-slate-900/90 dark:bg-black/95 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-200 dark:border-slate-700">
        {/* Progress Bar */}
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-t-3xl overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div class="p-8">
          {/* Header */}
          <div class="text-center mb-8">
            <div class={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${colors.bg} ${colors.border} border-2 mb-4`}>
              <span class="text-5xl">{step.icon}</span>
            </div>
            <h2 class={`text-3xl font-black ${colors.text} uppercase tracking-tight mb-2`}>
              {step.title}
            </h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg font-medium">
              {step.subtitle}
            </p>
          </div>

          {/* Content */}
          <div class="space-y-4 mb-8">
            {step.content.map((item, idx) => (
              <div
                key={idx}
                class={`p-5 rounded-2xl ${colors.bg} ${colors.border} border-2`}
              >
                <h3 class={`font-black text-sm uppercase tracking-widest mb-2 ${colors.text}`}>
                  {item.title}
                </h3>
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Step Indicators */}
          <div class="flex justify-center gap-2 mb-8">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                class={`w-3 h-3 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-slate-800 dark:bg-white w-8'
                    : idx < currentStep
                    ? 'bg-green-500'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div class="flex gap-4">
            {!isLastStep && (
              <button
                onClick={handleSkip}
                class="flex-1 py-4 px-6 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-sm"
              >
                Skip Tour
              </button>
            )}
            <button
              onClick={handleNext}
              class={`flex-1 py-4 px-6 rounded-xl font-black text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl uppercase tracking-widest text-sm ${colors.button}`}
            >
              {isLastStep ? '🚀 Get Started' : 'Continue →'}
            </button>
          </div>

          {/* Privacy Promise Footer */}
          <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p class="text-xs text-slate-500 dark:text-slate-500 font-medium">
              🔐 We never track your activity. This onboarding is stored only on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyOnboardingModal;
