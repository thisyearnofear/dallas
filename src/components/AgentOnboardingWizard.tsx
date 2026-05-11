/**
 * AgentOnboardingWizard - A guided "First Win" experience for new agent builders.
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useWallet } from '../context/WalletContext';
import { agentService, AgentIdentity } from '../services/AgentService';
import { useUserJourney } from '../hooks/useUserJourney';

interface OnboardingStep {
    id: 'shadow' | 'connect' | 'mission' | 'success';
    title: string;
    description: string;
    icon: string;
}

const STEPS: OnboardingStep[] = [
    {
        id: 'shadow',
        title: 'Deploy Shadow Agent',
        description: 'Start with a simulated agent to see how the DBC network works without any setup.',
        icon: '👻'
    },
    {
        id: 'connect',
        title: 'Connect Your Local Agent',
        description: 'Use the MCP protocol to link your local OpenClaw or custom agent to the network.',
        icon: '🔗'
    },
    {
        id: 'mission',
        title: 'Your First Mission',
        description: 'Assign your agent to a verification task and earn your first DBC rewards.',
        icon: '🎯'
    },
    {
        id: 'success',
        title: 'Agent Sovereign Unlocked',
        description: 'You are now part of the decentralized computer science network.',
        icon: '🏆'
    }
];

export const AgentOnboardingWizard: FunctionalComponent<{ onComplete: (agent: AgentIdentity) => void }> = ({ onComplete }) => {
    const { publicKey, connected } = useWallet();
    const { updateProgress } = useUserJourney();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [agent, setAgent] = useState<AgentIdentity | null>(null);
    const [mcpCommand, setMcpCommand] = useState('');

    const currentStep = STEPS[currentStepIndex];

    const nextStep = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else if (agent) {
            onComplete(agent);
        }
    };

    const handleDeployShadow = async () => {
        if (!publicKey) return;
        setIsProcessing(true);
        try {
            // Simulated delay for "deployment"
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newAgent = await agentService.registerAgent(publicKey, 'Shadow-Agent-Beta', 'validator');
            setAgent(newAgent);
            updateProgress('agentDeployed', true);
            nextStep();
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConnectLocal = async () => {
        setIsProcessing(true);
        try {
            // Generate a simplified MCP command
            const manifest = await agentService.generateOpenClawManifest();
            const command = `npx @dbc/agent-bridge connect --key ${publicKey?.toString().slice(0, 8)}...`;
            setMcpCommand(command);
            // In a real app, we'd wait for a socket connection here
            await new Promise(resolve => setTimeout(resolve, 2000));
            nextStep();
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFirstMission = async () => {
        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Simulate a result submission
            if (agent) {
                await agentService.submitResults(
                    'first_mission',
                    agent.id,
                    'validation',
                    'opt_log_init',
                    { verified: true, score: 95 }
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
            <div class="text-center animate-fadeIn">
                <div class="text-6xl mb-6 transform hover:scale-110 transition-transform duration-500">
                    {currentStep.icon}
                </div>
                <h2 class="text-3xl font-black mb-2 dark:text-white uppercase tracking-tight">
                    {currentStep.title}
                </h2>
                <p class="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    {currentStep.description}
                </p>

                {currentStep.id === 'shadow' && (
                    <button
                        onClick={handleDeployShadow}
                        disabled={isProcessing || !connected}
                        class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs"
                    >
                        {isProcessing ? 'Deploying Shadow...' : 'Deploy My First Agent'}
                    </button>
                )}

                {currentStep.id === 'connect' && (
                    <div class="space-y-6">
                        <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-mono text-xs text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 break-all">
                            {mcpCommand || 'Generating bridge command...'}
                        </div>
                        <button
                            onClick={handleConnectLocal}
                            disabled={isProcessing}
                            class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs"
                        >
                            {isProcessing ? 'Waiting for Link...' : 'I have run the command'}
                        </button>
                    </div>
                )}

                {currentStep.id === 'mission' && (
                    <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl mb-8 border border-indigo-100 dark:border-indigo-800">
                        <div class="flex items-center gap-4 text-left">
                            <div class="text-3xl">📡</div>
                            <div>
                                <h4 class="font-bold dark:text-white">Active Mission: Hello World</h4>
                                <p class="text-xs text-slate-500 dark:text-slate-400">Validate the genesis optimization log using ZK proofs.</p>
                            </div>
                            <div class="ml-auto text-indigo-600 font-black">100 DBC</div>
                        </div>
                        <button
                            onClick={handleFirstMission}
                            disabled={isProcessing}
                            class="mt-6 w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs"
                        >
                            {isProcessing ? 'Executing Proof...' : 'Assign Agent to Mission'}
                        </button>
                    </div>
                )}

                {currentStep.id === 'success' && (
                    <div class="space-y-6">
                        <div class="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                            <h4 class="font-bold text-green-700 dark:text-green-400 mb-2">Rewards Earned:</h4>
                            <div class="text-3xl font-black text-green-600">100 DBC + Pioneer Badge</div>
                        </div>
                        <button
                            onClick={nextStep}
                            class="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs"
                        >
                            Enter Command Center
                        </button>
                    </div>
                )}
            </div>

            {/* Decorative Pulse */}
            <div class="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
    );
};
