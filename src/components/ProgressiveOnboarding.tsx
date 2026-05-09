import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';

interface ProgressiveOnboardingProps {
    isOpen: boolean;
    onComplete: () => void;
}

const STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to the Alliance',
        subtitle: 'Build better agents together',
        icon: '🤝',
        content: `Privacy-preserving infrastructure for AI agent builders. Share optimization wins. Prove improvements with ZK proofs. Keep your IP yours.`,
        color: 'brand',
    },
    {
        id: 'privacy',
        title: 'Your Data, Encrypted',
        subtitle: 'Wallet-locked protection',
        icon: '🔐',
        content: `Your agent data is encrypted with your wallet key. We literally cannot access it. Even if our servers are compromised, your prompts and architectures stay private.`,
        color: 'green',
    },
    {
        id: 'zk',
        title: 'Prove Without Revealing',
        subtitle: 'Zero-knowledge proofs',
        icon: '🛡️',
        content: `Validators verify your agent improved by 15% without seeing the prompt. It's math-backed privacy — you prove results, not methodology.`,
        color: 'purple',
    },
    {
        id: 'terms',
        title: 'Quick Agreement',
        subtitle: 'Almost done',
        icon: '📋',
        content: `This is a devnet demo for builders. Not production advice. You're joining a community of developers sharing optimization experiments privately.`,
        color: 'orange',
    },
];

export const ProgressiveOnboarding: FunctionalComponent<ProgressiveOnboardingProps> = ({
    isOpen,
    onComplete,
}) => {
    const [step, setStep] = useState(0);
    const [agreed, setAgreed] = useState(false);

    // Check if already seen
    useEffect(() => {
        if (isOpen) {
            const seen = localStorage.getItem('dbc-progressive-onboarding');
            if (seen) {
                onComplete();
            }
        }
    }, [isOpen, onComplete]);

    if (!isOpen) return null;

    const current = STEPS[step];
    const isLastStep = step === STEPS.length - 1;
    const progress = ((step + 1) / STEPS.length) * 100;

    const colorMap: Record<string, { bg: string; border: string; text: string; button: string }> = {
        brand: { bg: 'bg-brand/10', border: 'border-brand', text: 'text-brand', button: 'bg-brand hover:bg-brand/90' },
        green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', button: 'bg-green-600 hover:bg-green-700' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', button: 'bg-purple-600 hover:bg-purple-700' },
        orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', button: 'bg-orange-600 hover:bg-orange-700' },
    };

    const colors = colorMap[current.color];

    const handleNext = () => {
        if (isLastStep && agreed) {
            localStorage.setItem('dbc-progressive-onboarding', 'true');
            localStorage.setItem('dbc-privacy-onboarding', 'true');
            onComplete();
        } else if (!isLastStep) {
            setStep(step + 1);
        }
    };

    const handleAccept = () => {
        localStorage.setItem('dbc-progressive-onboarding', 'true');
        localStorage.setItem('dbc-privacy-onboarding', 'true');
        onComplete();
    };

    return (
        <div class="fixed inset-0 bg-slate-900/95 dark:bg-black/90 flex items-center justify-center p-4 z-[200]">
            <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Progress */}
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
                    <div
                        class={`h-full bg-gradient-to-r ${current.color === 'brand' ? 'from-brand to-brand-accent' : current.color === 'green' ? 'from-green-500 to-emerald-500' : current.color === 'purple' ? 'from-purple-500 to-pink-500' : 'from-orange-500 to-amber-500'} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div class="p-8">
                    {/* Icon */}
                    <div class={`w-16 h-16 rounded-2xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center mb-6 mx-auto`}>
                        <span class="text-3xl">{current.icon}</span>
                    </div>

                    {/* Title */}
                    <h2 class={`text-2xl font-black text-center mb-2 ${colors.text}`}>
                        {current.title}
                    </h2>
                    <p class="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
                        {current.subtitle}
                    </p>

                    {/* Content */}
                    <div class={`p-5 rounded-xl ${colors.bg} ${colors.border} border-2 mb-6`}>
                        <p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed text-center">
                            {current.content}
                        </p>
                    </div>

                    {/* Terms checkbox on last step */}
                    {isLastStep && (
                        <label class="flex items-center gap-3 mb-6 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed((e.target as HTMLInputElement).checked)}
                                class="sr-only peer"
                            />
                            <div class="w-6 h-6 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg peer-checked:bg-brand peer-checked:border-brand transition-all flex items-center justify-center">
                                {agreed && (
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                )}
                            </div>
                            <span class="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                                I understand this is a devnet demo for builders
                            </span>
                        </label>
                    )}

                    {/* Navigation */}
                    <div class="flex gap-3">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                class="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                ← Back
                            </button>
                        )}
                        {!isLastStep ? (
                            <button
                                onClick={handleNext}
                                class={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${colors.button}`}
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleAccept}
                                disabled={!agreed}
                                class={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${colors.button} ${!agreed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Enter the Alliance →
                            </button>
                        )}
                    </div>
                </div>

                {/* Step indicators */}
                <div class="px-8 pb-6 flex justify-center gap-2">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            class={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-brand w-4' : i < step ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProgressiveOnboarding;
