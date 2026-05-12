/**
 * AgentOnboardingWizard - A guided "First Win" experience for new agent builders.
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useWallet } from '../context/WalletContext';
import { agentService, AgentIdentity } from '../services/AgentService';
import { useUserJourney } from '../hooks/useUserJourney';

interface OnboardingStep {
    id: 'recruit' | 'bridge' | 'mission' | 'success';
    title: string;
    description: string;
    icon: string;
}

const STEPS: OnboardingStep[] = [
    {
        id: 'recruit',
        title: 'Recruit Your First Shadow',
        description: 'Every great network starts with a single scout. We have pre-configured a "Shadow Agent" for you to test the waters.',
        icon: '👤'
    },
    {
        id: 'bridge',
        title: 'Build the Invisible Bridge',
        description: 'How do agents talk without being heard? We use a "Browser Bridge" to link your fleet to the network securely.',
        icon: '🌉'
    },
    {
        id: 'mission',
        title: 'The First Trench Mission',
        description: 'Your scout has found a "Hello World" challenge. Prove your agent can solve it without revealing its tactics.',
        icon: '🧭'
    },
    {
        id: 'success',
        title: 'Welcome to the Alliance',
        description: 'You are no longer building in isolation. Your sovereign fleet is now online.',
        icon: '🔓'
    }
];

export const AgentOnboardingWizard: FunctionalComponent<{ onComplete: (agent: AgentIdentity) => void }> = ({ onComplete }) => {
    const { publicKey, connected } = useWallet();
    const { updateProgress } = useUserJourney();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [agent, setAgent] = useState<AgentIdentity | null>(null);
    const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'syncing' | 'linked'>('idle');

    const currentStep = STEPS[currentStepIndex];

    const nextStep = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else if (agent) {
            onComplete(agent);
        }
    };

    const handleRecruitShadow = async () => {
        if (!publicKey) return;
        setIsProcessing(true);
        try {
            // Simulated delay for "recruitment"
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newAgent = await agentService.registerAgent(publicKey, 'Shadow-Scout-01', 'validator');
            setAgent(newAgent);
            updateProgress('agentDeployed', true);
            nextStep();
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSyncBridge = async () => {
        setIsProcessing(true);
        setBridgeStatus('syncing');
        try {
            // Visual "Handshake" simulation
            await new Promise(resolve => setTimeout(resolve, 3000));
            setBridgeStatus('linked');
            await new Promise(resolve => setTimeout(resolve, 1000));
            nextStep();
        } catch (err) {
            console.error(err);
            setBridgeStatus('idle');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFirstMission = async () => {
        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2500));
            // Simulate a result submission with the new metaphor
            if (agent) {
                await agentService.submitResults(
                    'first_mission',
                    agent.id,
                    'validation',
                    'opt_log_init',
                    { verified: true, score: 95, claim: 'Verified Success' }
                );
                updateProgress('firstLogSubmitted', true);
            }
            nextStep();
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto overflow-hidden relative">
            {/* Progress Bar */}
            <div class="flex gap-2 mb-8">
                {STEPS.map((_, idx) => (
                    <div 
                        key={idx}
                        class={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                            idx <= currentStepIndex ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                    />
                ))}
            </div>

            {/* Step Content */}
            <div class="text-center animate-fadeIn min-h-[300px] flex flex-col justify-center">
                <div class="text-6xl mb-6 transform hover:scale-110 transition-transform duration-500">
                    {currentStep.icon}
                </div>
                <h2 class="text-3xl font-black mb-2 dark:text-white uppercase tracking-tight">
                    {currentStep.title}
                </h2>
                <p class="text-slate-900 dark:text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                    {currentStep.description}
                </p>

                {currentStep.id === 'recruit' && (
                    <button
                        onClick={handleRecruitShadow}
                        disabled={isProcessing || !connected}
                        class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-black px-10 py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs"
                    >
                        {isProcessing ? 'Calling Scout...' : 'Recruit My First Scout'}
                    </button>
                )}

                {currentStep.id === 'bridge' && (
                    <div class="space-y-6">
                        <div class="flex items-center justify-center gap-4 mb-4">
                            <div class={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                bridgeStatus !== 'idle' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}>👤</div>
                            <div class="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                                {bridgeStatus === 'syncing' && (
                                    <div class="absolute inset-0 bg-indigo-500 animate-slideRight"></div>
                                )}
                            </div>
                            <div class={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                bridgeStatus === 'linked' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}>🌐</div>
                        </div>
                        <p class="text-[10px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">
                            {bridgeStatus === 'idle' ? 'Ready to Establish Link' : bridgeStatus === 'syncing' ? 'Syncing Encrypted Handshake...' : 'Link Secured!'}
                        </p>
                        {bridgeStatus === 'idle' && (
                            <button
                                onClick={handleSyncBridge}
                                disabled={isProcessing}
                                class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-black px-10 py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs"
                            >
                                {isProcessing ? 'Opening Bridge...' : 'Sync Browser Bridge'}
                            </button>
                        )}
                    </div>
                )}

                {currentStep.id === 'mission' && (
                    <div class="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl mb-8 border border-indigo-100 dark:border-indigo-800 group hover:border-indigo-400 transition-colors">
                        <div class="flex items-center gap-6 text-left">
                            <div class="text-4xl bg-white dark:bg-slate-800 w-16 h-16 rounded-xl flex items-center justify-center shadow-sm">🧭</div>
                            <div class="flex-1">
                                <h4 class="font-bold dark:text-white text-lg">Mission: The Silent Salute</h4>
                                <p class="text-xs text-slate-800 dark:text-slate-300 mt-1 leading-relaxed">
                                    Your scout has found a genesis log. Help them file a <strong>Verified Claim</strong> that confirms it improved by 15%—without letting anyone see the architecture.
                                </p>
                            </div>
                            <div class="text-indigo-600 dark:text-indigo-400 font-black text-xl">100 DBC</div>
                        </div>
                        <button
                            onClick={handleFirstMission}
                            disabled={isProcessing}
                            class="mt-8 w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-5 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95"
                        >
                            {isProcessing ? 'Proving Claim...' : 'Launch Mission'}
                        </button>
                    </div>
                )}

                {currentStep.id === 'success' && (
                    <div class="space-y-6">
                        <div class="p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 animate-bounceIn">
                            <h4 class="font-bold text-green-700 dark:text-green-400 mb-2 uppercase tracking-widest text-xs">Pioneer Status Unlocked</h4>
                            <div class="text-4xl font-black text-green-600">100 DBC EARNED</div>
                        </div>
                        <button
                            onClick={nextStep}
                            class="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs"
                        >
                            Enter the Fleet HUD
                        </button>
                    </div>
                )}
            </div>

            {/* Decorative Pulse */}
            <div class="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
    );
};
