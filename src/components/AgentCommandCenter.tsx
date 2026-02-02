/**
 * AgentCommandCenter - The Future of Agentic Health Sovereignty
 * 
 * A premium interface for managing autonomous AI agents (OpenClaw) 
 * on the Solana blockchain.
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { WalletContext, type WalletContextType } from '../context/WalletContext';
import { agentService, AgentIdentity, AgentTask } from '../services/AgentService';
import { useTheme } from '../context/ThemeContext';

export const AgentCommandCenter: FunctionalComponent = () => {
    const { publicKey, connected } = useContext(WalletContext) as WalletContextType;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [agents, setAgents] = useState<AgentIdentity[]>([]);
    const [tasks, setTasks] = useState<AgentTask[]>([]);
    const [isRegistering, setIsRegistering] = useState(false);
    const [activeView, setActiveView] = useState<'fleet' | 'missions' | 'intelligence'>('fleet');
    const [newAgentName, setNewAgentName] = useState('');

    useEffect(() => {
        if (publicKey) {
            setAgents(agentService.getActiveAgents(publicKey.toString()));
            setTasks(agentService.getTasks());
        }
    }, [publicKey]);

    const handleDeployAgent = async () => {
        if (!publicKey || !newAgentName) return;
        setIsRegistering(true);
        try {
            const agent = await agentService.registerAgent(publicKey, newAgentName, 'validator');
            setAgents(prev => [...prev, agent]);
            setNewAgentName('');
            setIsRegistering(false);
        } catch (err) {
            console.error(err);
            setIsRegistering(false);
        }
    };

    if (!connected) {
        return (
            <div class="p-8 text-center bg-slate-100 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <div class="text-6xl mb-4">🤖</div>
                <h2 class="text-2xl font-black mb-2 dark:text-white">Agentic Command Center</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">Connect your wallet to deploy autonomous OpenClaw agents.</p>
            </div>
        );
    }

    return (
        <div class="w-full max-w-6xl mx-auto animate-fadeIn">
            {/* Header / HUD */}
            <div class="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 mb-8 text-white shadow-2xl">
                <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                Operational Status: Active
                            </span>
                        </div>
                        <h1 class="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
                            Fleet Intelligence
                        </h1>
                        <p class="text-indigo-100 font-medium max-w-md">
                            Managing autonomous agentic interactions for health sovereignty and privacy-preserving validation.
                        </p>
                    </div>

                    <div class="flex gap-4">
                        <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-center min-w-[120px]">
                            <div class="text-3xl font-black">{agents.length}</div>
                            <div class="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Active Agents</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-center min-w-[120px]">
                            <div class="text-3xl font-black">{agents.reduce((acc, curr) => acc + curr.earningsDbc, 0)}</div>
                            <div class="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Total DBC Earned</div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div class="absolute -left-20 -top-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Navigation Tabs */}
            <div class="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit mx-auto border border-slate-200 dark:border-slate-700">
                {(['fleet', 'missions', 'intelligence'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveView(tab)}
                        class={`
                            px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                            ${activeView === tab
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-105'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* View Content */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Fleet Management */}
                <div class="lg:col-span-2 space-y-6">
                    {activeView === 'fleet' && (
                        <>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {agents.map(agent => (
                                    <div
                                        key={agent.id}
                                        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:border-indigo-500 transition-all group shadow-sm hover:shadow-xl"
                                    >
                                        <div class="flex justify-between items-start mb-4">
                                            <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                {agent.role === 'validator' ? '⚖️' : '🔬'}
                                            </div>
                                            <div class={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${agent.status === 'idle' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 animate-pulse'
                                                }`}>
                                                {agent.status}
                                            </div>
                                        </div>
                                        <h3 class="text-xl font-bold dark:text-white mb-1">{agent.name}</h3>
                                        <p class="text-xs text-slate-500 font-mono mb-4">{agent.publicKey}</p>

                                        <div class="space-y-2 mb-6">
                                            <div class="flex justify-between text-xs">
                                                <span class="text-slate-500">Reputation Score</span>
                                                <span class="font-bold text-indigo-500">85%</span>
                                            </div>
                                            <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div class="w-[85%] h-full bg-indigo-500"></div>
                                            </div>
                                        </div>

                                        <div class="flex flex-wrap gap-2 mb-6">
                                            {agent.capabilities.map(cap => (
                                                <span key={cap} class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    {cap.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>

                                        <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                                            <div class="text-xs">
                                                <span class="font-bold text-indigo-600 dark:text-indigo-400">{agent.earningsDbc} DBC</span>
                                                <span class="text-slate-400 ml-1">earned</span>
                                            </div>
                                            <button class="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:tracking-widest transition-all">
                                                Configure →
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Deploy New Agent Card */}
                                <div class="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-indigo-500/50 transition-all">
                                    <div class="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">🚀</div>
                                    <h3 class="font-bold mb-4 dark:text-white">Deploy OpenClaw Agent</h3>
                                    <input
                                        type="text"
                                        value={newAgentName}
                                        onInput={(e) => setNewAgentName((e.target as HTMLInputElement).value)}
                                        placeholder="Agent Name..."
                                        class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={handleDeployAgent}
                                        disabled={isRegistering || !newAgentName}
                                        class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all"
                                    >
                                        {isRegistering ? 'Initializing...' : 'Deploy to Solana'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeView === 'missions' && (
                        <div class="space-y-4">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:shadow-lg transition-all"
                                >
                                    <div class="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl">
                                                {task.type === 'validation' ? '🛡️' : task.type === 'research' ? '🔬' : '📊'}
                                            </div>
                                            <div>
                                                <h4 class="font-black text-slate-800 dark:text-slate-100">{task.description}</h4>
                                                <div class="flex gap-2 mt-1">
                                                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                        ID: {task.targetId}
                                                    </span>
                                                    <span class={`text-[10px] font-bold uppercase ${task.complexity === 'high' ? 'text-red-500' : task.complexity === 'medium' ? 'text-orange-500' : 'text-green-500'
                                                        }`}>
                                                        {task.complexity} complexity
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-xl font-black text-indigo-600 dark:text-indigo-400">{task.rewardDbc} DBC</div>
                                            <div class="text-[10px] font-bold text-slate-400 uppercase">Commission</div>
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-between mt-6">
                                        <div class="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} class="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                                                    👤
                                                </div>
                                            ))}
                                            <div class="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">
                                                +12
                                            </div>
                                        </div>
                                        <button class="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                                            Assign Agent
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Intelligence Feed */}
                <div class="space-y-6">
                    <div class="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl">
                        <h3 class="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span>📡</span> Live Intel Feed
                        </h3>
                        <div class="space-y-4">
                            <div class="border-l-2 border-white/30 pl-4 py-1">
                                <p class="text-xs font-bold text-indigo-200">2 minutes ago</p>
                                <p class="text-sm font-medium">Claw-Validator-Alpha verified Noir Proof for #cs_peptide_t_156.</p>
                            </div>
                            <div class="border-l-2 border-white/30 pl-4 py-1 opacity-80">
                                <p class="text-xs font-bold text-indigo-200">15 minutes ago</p>
                                <p class="text-sm font-medium">New statistical validation mission posted by "Oura Community".</p>
                            </div>
                            <div class="border-l-2 border-white/30 pl-4 py-1 opacity-60">
                                <p class="text-xs font-bold text-indigo-200">1 hour ago</p>
                                <p class="text-sm font-medium">Agent session 0xD9... delegated by RonWoodroof.</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <h3 class="text-lg font-black uppercase tracking-widest mb-4 dark:text-white flex items-center gap-2">
                            <span>🛠️</span> OpenClaw Integration
                        </h3>
                        <p class="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                            Connect your local OpenClaw instance to the Dallas Buyers Club network to enable autonomous research and validation.
                        </p>
                        <div class="space-y-3">
                            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:border-indigo-500 transition-all">
                                <span class="text-xs font-bold dark:text-white">Download Skill Manifest</span>
                                <span>📥</span>
                            </div>
                            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:border-indigo-500 transition-all">
                                <span class="text-xs font-bold dark:text-white">Copy API Bridge Key</span>
                                <span>🔑</span>
                            </div>
                            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:border-indigo-500 transition-all">
                                <span class="text-xs font-bold dark:text-white">OpenClaw Documentation</span>
                                <span>📚</span>
                            </div>
                        </div>
                    </div>

                    {/* Agentic Privacy Tip */}
                    <div class="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 text-white border border-slate-800">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-yellow-500 text-sm">💡</span>
                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Agentic Ethics</span>
                        </div>
                        <p class="text-xs text-slate-300 leading-relaxed font-medium">
                            Your agents use <strong>Privacy-First Enclave Analysis</strong>. They never see raw patient data; they only interact with <strong>ZK-compressed state</strong> and <strong>MPC shares</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
