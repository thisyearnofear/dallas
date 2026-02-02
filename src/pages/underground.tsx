import { RonsOfficeExperience, MemoryWall } from "../components/RonsOffice";
import { SystemBattleboard, PropagandaPosters, ResistanceQuotes } from "../components/SystemVsUnderground";
import { 
    UndergroundNetwork, 
    SystemResistanceTimer, 
    SupplyChainStatus, 
    RebellionMeter,
    PatientCodeGenerator,
    FDAWarningBanner,
    MexicanConnectionStatus 
} from "../components/UndergroundTheme";
import { 
    DrugTestingSimulator, 
    CryptoPaymentInterface, 
    SecretHandshakeChallenge 
} from "../components/BlackMarketExperience";
import { Terminal, DangerIndicator } from "../components/SharedUIComponents";
import { 
    RetroModal, 
    InfomercialPopup, 
    RetroTerminal, 
    RetroAlert, 
    RetroButton, 
    RetroBadge,
    AudioEffects 
} from "../components/RetroAesthetics";
import { PrivacyDashboard } from "../components/PrivacyDashboard";
import { ResearcherTools } from "../components/ResearcherTools";
import { useState, useEffect } from "preact/hooks";

export function Underground() {
    const [activeSection, setActiveSection] = useState<'command' | 'office' | 'market' | 'intel' | 'history' | 'privacy' | 'research'>('command');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});

    const toggleSection = (sectionId: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    if (!isAuthenticated) {
        return (
            <div class="min-h-screen bg-slate-950 dark:bg-black text-slate-300 flex items-center justify-center p-4 font-mono transition-colors duration-500">
                <div class="max-w-md w-full">
                    <RetroTerminal>
                        <div class="text-center mb-8">
                            <div class="text-3xl mb-4 text-red-500 font-black tracking-tighter animate-pulse uppercase">⚠ Access Denied ⚠</div>
                            <div class="text-sm mb-2 font-bold tracking-widest text-slate-400">DALLAS BUYERS CLUB NETWORK</div>
                            <div class="text-[10px] font-bold opacity-50 uppercase tracking-[0.3em]">Unauthorized Access Prohibited</div>
                        </div>
                        
                        <SecretHandshakeChallenge />
                        
                        <div class="mt-10 text-center border-t border-green-900/30 pt-6">
                            <div class="text-[10px] font-black text-green-800 uppercase tracking-widest mb-3">[ Debug Mode Active ]</div>
                            <button 
                                onClick={() => setIsAuthenticated(true)}
                                class="text-[10px] font-black text-green-600 hover:text-green-400 underline decoration-dotted underline-offset-4 transition-colors uppercase tracking-widest"
                            >
                                bypass_auth.exe
                            </button>
                        </div>
                    </RetroTerminal>
                </div>
            </div>
        );
    }

    return (
        <div class="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-300 font-mono transition-colors duration-500">
            <AudioEffects />

            {/* Alert */}
            {showAlert && (
                <RetroAlert 
                    type="warning"
                    message="FDA SURVEILLANCE DETECTED - MAINTAIN OPERATIONAL SECURITY"
                    onClose={() => setShowAlert(false)}
                />
            )}

            {/* Header */}
            <div class="bg-blue-800 dark:bg-blue-950 text-white p-4 border-b-4 border-blue-600 shadow-lg relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-white/10 animate-scan"></div>
                <div class="flex items-center justify-between relative z-10">
                    <div class="flex items-center gap-4">
                        <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400"></div>
                        <span class="font-black tracking-tighter uppercase">Dallas Buyers Club Network <span class="opacity-50 ml-2">v1.85</span></span>
                    </div>
                    <div class="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
                        <span class="hidden sm:inline opacity-70">User: Patient_#420</span>
                        <RetroBadge color="green">Secure_Connection</RetroBadge>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div class="p-2 bg-slate-200 dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 shadow-inner">
                <div class="flex flex-wrap gap-1 max-w-7xl mx-auto">
                    {[
                        { id: 'command', label: 'COMMAND', desc: 'HQ' },
                        { id: 'office', label: 'OFFICE', desc: 'RON' },
                        { id: 'market', label: 'MARKET', desc: 'BUY' },
                        { id: 'intel', label: 'INTEL', desc: 'WAR' },
                        { id: 'history', label: 'ARCHIVE', desc: 'DOCS' },
                        { id: 'privacy', label: 'PRIVACY', desc: 'ZK' },
                        { id: 'research', label: 'RESEARCH', desc: 'LAB' }
                    ].map((section) => (
                        <RetroButton
                            key={section.id}
                            onClick={() => setActiveSection(section.id as any)}
                            variant={activeSection === section.id ? 'success' : 'primary'}
                        >
                            <div class="text-center px-4 py-1">
                                <div class="font-black text-xs uppercase tracking-tighter">{section.label}</div>
                                <div class="text-[8px] font-bold opacity-50 uppercase tracking-widest">{section.desc}</div>
                            </div>
                        </RetroButton>
                    ))}
                </div>
            </div>

            {/* Command Center */}
            {activeSection === 'command' && (
                <div class="p-6 space-y-8 max-w-7xl mx-auto animate-fadeIn">
                    {/* Page Header */}
                    <div class="bg-white dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-sm relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div class="text-center relative z-10">
                            <div class="text-2xl font-black text-green-600 dark:text-green-400 mb-1 uppercase tracking-[0.2em]">Command Center</div>
                            <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">underground_hq.exe_sys_active</div>
                        </div>
                    </div>

                    {/* Collapsible Sections */}
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Network Panel */}
                        <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md">
                            <div 
                                onClick={() => toggleSection('network')}
                                class="bg-blue-700 dark:bg-blue-900 text-white p-3 cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-800 flex justify-between items-center transition-colors"
                            >
                                <span class="font-black text-xs uppercase tracking-widest">Network Status</span>
                                <span class="text-xs font-mono">{collapsedSections.network ? '[+]' : '[-]'}</span>
                            </div>
                            {!collapsedSections.network && (
                                <div class="p-6 space-y-6">
                                    <NetworkStatus />
                                    <PatientCodeGenerator />
                                </div>
                            )}
                        </div>

                        {/* Operations Panel */}
                        <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md">
                            <div 
                                onClick={() => toggleSection('operations')}
                                class="bg-red-700 dark:bg-red-900 text-white p-3 cursor-pointer hover:bg-red-600 dark:hover:bg-red-800 flex justify-between items-center transition-colors"
                            >
                                <span class="font-black text-xs uppercase tracking-widest">Operations</span>
                                <span class="text-xs font-mono">{collapsedSections.operations ? '[+]' : '[-]'}</span>
                            </div>
                            {!collapsedSections.operations && (
                                <div class="p-6 space-y-6">
                                    <SystemResistanceTimer />
                                    <RebellionMeter />
                                </div>
                            )}
                        </div>

                        {/* Supply Panel */}
                        <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md">
                            <div 
                                onClick={() => toggleSection('supply')}
                                class="bg-green-700 dark:bg-green-900 text-white p-3 cursor-pointer hover:bg-green-600 dark:hover:bg-green-800 flex justify-between items-center transition-colors"
                            >
                                <span class="font-black text-xs uppercase tracking-widest">Supply Chain</span>
                                <span class="text-xs font-mono">{collapsedSections.supply ? '[+]' : '[-]'}</span>
                            </div>
                            {!collapsedSections.supply && (
                                <div class="p-6 space-y-6">
                                    <SupplyChainStatus />
                                    <MexicanConnectionStatus />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Operations - 80s Style */}
                    <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
                        <div class="bg-yellow-500 dark:bg-yellow-600 text-black p-3 border-b-2 border-slate-200 dark:border-slate-800">
                            <span class="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <span class="w-2 h-2 bg-black rounded-full animate-ping"></span>
                                Active Operations Feed
                            </span>
                        </div>
                        <div class="p-6 bg-slate-50 dark:bg-black shadow-inner">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[10px] font-black uppercase tracking-tighter">
                                <div class="bg-white dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between">
                                    <div class="text-green-600 dark:text-green-400 mb-2">Project_Phoenix:</div>
                                    <div class="text-slate-900 dark:text-white flex justify-between">Status: <span class="text-green-500 animate-glow">Active</span></div>
                                </div>
                                <div class="bg-white dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between">
                                    <div class="text-yellow-600 dark:text-yellow-400 mb-2">Border_Run_47:</div>
                                    <div class="text-slate-900 dark:text-white flex justify-between">Status: <span class="text-yellow-500">In_Transit</span></div>
                                </div>
                                <div class="bg-white dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between">
                                    <div class="text-blue-600 dark:text-blue-400 mb-2">Lab_Analysis:</div>
                                    <div class="text-slate-900 dark:text-white flex justify-between">Status: <span class="text-blue-500">Pending</span></div>
                                </div>
                                <div class="bg-white dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between">
                                    <div class="text-green-600 dark:text-green-400 mb-2">Network_Exp:</div>
                                    <div class="text-slate-900 dark:text-white flex justify-between">Status: <span class="text-green-500">Ongoing</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - 80s Style */}
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12">
                        <RetroButton variant="danger" onClick={() => setShowAlert(true)}>
                            <div class="text-center py-2">
                                <div class="font-black text-xs mb-1">EMERGENCY</div>
                                <div class="text-[8px] opacity-70">PROTOCOL</div>
                            </div>
                        </RetroButton>
                        <RetroButton variant="success">
                            <div class="text-center py-2">
                                <div class="font-black text-xs mb-1">NEW</div>
                                <div class="text-[8px] opacity-70">SHIPMENT</div>
                            </div>
                        </RetroButton>
                        <RetroButton variant="primary">
                            <div class="text-center py-2">
                                <div class="font-black text-xs mb-1">SECURE</div>
                                <div class="text-[8px] opacity-70">COMM</div>
                            </div>
                        </RetroButton>
                        <RetroButton variant="warning">
                            <div class="text-center py-2">
                                <div class="font-black text-xs mb-1">INTEL</div>
                                <div class="text-[8px] opacity-70">REPORT</div>
                            </div>
                        </RetroButton>
                    </div>
                </div>
            )}

            {/* Ron's Office */}
            {activeSection === 'office' && (
                <div class="animate-fadeIn">
                    <RonsOfficeExperience />
                </div>
            )}

            {/* Black Market */}
            {activeSection === 'market' && (
                <div class="p-6 space-y-8 max-w-7xl mx-auto animate-fadeIn">
                    {/* Market Header */}
                    <div class="bg-white dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div class="text-center relative z-10">
                            <div class="text-2xl font-black text-yellow-600 dark:text-yellow-400 mb-1 uppercase tracking-[0.2em]">Underground Marketplace</div>
                            <div class="flex items-center justify-center gap-4">
                                <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">secure_trade.exe_v2.1</div>
                                <RetroBadge color="yellow">Encrypted</RetroBadge>
                            </div>
                        </div>
                    </div>

                    {/* Warning Banner - 80s Style */}
                    <div class="bg-red-600 text-white border-4 border-red-800 p-4 rounded-xl shadow-lg animate-pulse flex flex-col items-center justify-center gap-1">
                        <div class="text-center font-black uppercase tracking-[0.2em] text-lg">
                            *** Warning: Unauthorized Pharmaceutical Distribution ***
                        </div>
                        <div class="text-center text-[10px] font-bold uppercase tracking-widest opacity-80">
                            Use at your own risk • Not FDA Approved • Club Members Only
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Terminal & Testing */}
                        <div class="space-y-8">
                            <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div class="bg-green-700 dark:bg-green-900 text-white p-3 border-b-2 border-slate-200 dark:border-slate-800">
                                    <span class="font-black text-xs uppercase tracking-widest">Terminal Access</span>
                                </div>
                                <div class="p-6 bg-slate-50 dark:bg-black shadow-inner">
                                    <Terminal onCommand={(cmd) => console.log('Underground command:', cmd)} />
                                </div>
                            </div>

                            <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div 
                                    onClick={() => toggleSection('testing')}
                                    class="bg-purple-700 dark:bg-purple-900 text-white p-3 cursor-pointer hover:bg-purple-600 dark:hover:bg-purple-800 flex justify-between items-center transition-colors border-b-2 border-slate-200 dark:border-slate-800"
                                >
                                    <span class="font-black text-xs uppercase tracking-widest">Lab Testing Protocol</span>
                                    <span class="text-xs font-mono">{collapsedSections.testing ? '[+]' : '[-]'}</span>
                                </div>
                                {!collapsedSections.testing && (
                                    <div class="p-6 bg-slate-50 dark:bg-slate-900 transition-colors">
                                        <DrugTestingSimulator />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment & Security */}
                        <div class="space-y-8">
                            <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div 
                                    onClick={() => toggleSection('payment')}
                                    class="bg-orange-600 dark:bg-orange-800 text-white p-3 cursor-pointer hover:bg-orange-500 dark:hover:bg-orange-700 flex justify-between items-center transition-colors border-b-2 border-slate-200 dark:border-slate-800"
                                >
                                    <span class="font-black text-xs uppercase tracking-widest">Secure Payment System</span>
                                    <span class="text-xs font-mono">{collapsedSections.payment ? '[+]' : '[-]'}</span>
                                </div>
                                {!collapsedSections.payment && (
                                    <div class="p-6 bg-slate-50 dark:bg-slate-900 transition-colors">
                                        <CryptoPaymentInterface />
                                    </div>
                                )}
                            </div>

                            {/* Security Status - 80s Style */}
                            <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div class="bg-blue-700 dark:bg-blue-900 text-white p-3 border-b-2 border-slate-200 dark:border-slate-800">
                                    <span class="font-black text-xs uppercase tracking-widest">Security Subsystem Status</span>
                                </div>
                                <div class="p-6 bg-slate-50 dark:bg-black shadow-inner">
                                    <div class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-3 font-black text-[10px] uppercase tracking-widest shadow-sm">
                                        {[
                                            { label: 'Encryption', status: 'OK', color: 'text-green-600 dark:text-green-400' },
                                            { label: 'Identity', status: 'Protected', color: 'text-green-600 dark:text-green-400' },
                                            { label: 'Payment', status: 'Secure', color: 'text-green-600 dark:text-green-400' },
                                            { label: 'Quality', status: 'Verified', color: 'text-green-600 dark:text-green-400' },
                                            { label: 'FDA_Monitor', status: 'Detected', color: 'text-red-600 dark:text-red-400 animate-pulse' }
                                        ].map((stat) => (
                                            <div key={stat.label} class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                                                <span class="text-slate-500 dark:text-slate-400">{stat.label}:</span>
                                                <span class={stat.color}>[{stat.status}]</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Buy - Infomercial Style */}
                            <div class="bg-yellow-300 dark:bg-yellow-400 border-4 border-red-600 p-6 rounded-2xl text-black shadow-2xl transform rotate-1 hover:rotate-0 transition-transform">
                                <div class="text-center">
                                    <div class="font-black text-xl mb-2 uppercase tracking-tighter">⚡ Fast Order Protocol ⚡</div>
                                    <div class="text-[10px] font-bold mb-4 uppercase tracking-widest opacity-70">
                                        Operators standing by 24/7! Limited Time!
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <RetroButton variant="danger">
                                            <div class="text-xs py-1">
                                                <div class="font-black">AZT</div>
                                                <div class="opacity-80">$49.95</div>
                                            </div>
                                        </RetroButton>
                                        <RetroButton variant="success">
                                            <div class="text-xs py-1">
                                                <div class="font-black">Peptide_T</div>
                                                <div class="opacity-80">$29.95</div>
                                            </div>
                                        </RetroButton>
                                    </div>
                                    <div class="text-[9px] mt-4 font-black animate-pulse uppercase tracking-[0.3em] text-red-700">
                                        Act Now! Access is Finite!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Intelligence */}
            {activeSection === 'intel' && (
                <div class="p-6 space-y-10 max-w-7xl mx-auto animate-fadeIn">
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-black text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-tighter flex items-center justify-center gap-4">
                            <span class="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-2xl">📡</span>
                            <span>Intelligence Center</span>
                        </h1>
                        <p class="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Monitor the ongoing battle between system and freedom</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                        <SystemBattleboard />
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl"><PropagandaPosters /></div>
                        <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl"><ResistanceQuotes /></div>
                    </div>

                    <div class="bg-gradient-to-r from-slate-800 to-slate-950 p-10 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-all duration-1000"></div>
                        <h3 class="text-xl font-black mb-8 text-white uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
                            <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                            Resistance Metrics
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                            {[
                                { val: '420', label: 'Active Fighters', color: 'text-green-400' },
                                { val: '23', label: 'Secure Nodes', color: 'text-blue-400' },
                                { val: '89%', label: 'Success Rate', color: 'text-purple-400' },
                                { val: '$2.1M', label: 'Value Saved', color: 'text-yellow-400' }
                            ].map((stat) => (
                                <div key={stat.label} class="text-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 shadow-inner group/stat hover:border-white/20 transition-all">
                                    <div class={`text-4xl font-black mb-2 tracking-tighter group-hover/stat:scale-110 transition-transform ${stat.color}`}>{stat.val}</div>
                                    <div class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* History/Archives */}
            {activeSection === 'history' && (
                <div class="p-6 max-w-7xl mx-auto animate-fadeIn">
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-black text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-tighter flex items-center justify-center gap-4">
                            <span class="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-2xl text-3xl">📜</span>
                            <span>Underground Archives</span>
                        </h1>
                        <p class="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Preserving the memory of our fight for freedom</p>
                    </div>
                    
                    <div class="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl mb-12">
                        <MemoryWall />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        <div class="bg-gradient-to-br from-amber-900 to-slate-900 dark:to-black p-8 rounded-2xl border border-amber-600/30 shadow-xl group">
                            <h3 class="font-black text-amber-300 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                                <span class="text-xl">📚</span>
                                Historical Records
                            </h3>
                            <div class="space-y-4 text-[10px] font-black uppercase tracking-widest">
                                {[
                                    { label: 'Club Charter', year: '1985' },
                                    { label: 'FDA Warning', year: '1986' },
                                    { label: 'Medical Logs', year: '85-91' },
                                    { label: 'Legal Wins', year: '23 Cases' }
                                ].map((doc) => (
                                    <div key={doc.label} class="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span class="text-amber-200/70">{doc.label}</span>
                                        <span class="text-amber-400">{doc.year}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-green-900 to-slate-900 dark:to-black p-8 rounded-2xl border border-green-600/30 shadow-xl group">
                            <h3 class="font-black text-green-300 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                                <span class="text-xl">🏆</span>
                                Achievements
                            </h3>
                            <div class="space-y-3 text-[9px] font-black uppercase tracking-widest text-green-200/70">
                                <div class="flex items-center gap-3">
                                    <span class="text-green-400">✓</span>
                                    <span>Saved 847+ lives</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-green-400">✓</span>
                                    <span>Challenged FDA</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-green-400">✓</span>
                                    <span>Opened Access</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-green-400">✓</span>
                                    <span>Changed Law</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-red-900 to-slate-900 dark:to-black p-8 rounded-2xl border border-red-600/30 shadow-xl group">
                            <h3 class="font-black text-red-300 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                                <span class="text-xl">💔</span>
                                Never Forget
                            </h3>
                            <div class="space-y-2 text-[9px] font-bold uppercase tracking-widest text-red-200/60 leading-relaxed italic">
                                <div>Those lost to the system</div>
                                <div>Patients denied hope</div>
                                <div>Families torn apart</div>
                                <div>The fight continues...</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Dashboard */}
            {activeSection === 'privacy' && (
                <div class="p-6 space-y-8 max-w-7xl mx-auto animate-fadeIn">
                    {/* Page Header */}
                    <div class="bg-white dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-sm relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div class="text-center relative z-10">
                            <div class="text-2xl font-black text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-[0.2em]">Privacy Command Center</div>
                            <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">zero_knowledge_protocols_active</div>
                        </div>
                    </div>

                    {/* Privacy Dashboard Component */}
                    <PrivacyDashboard />

                    {/* Privacy Info Cards */}
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                        <div class="bg-gradient-to-br from-purple-900 to-slate-900 dark:to-black p-8 rounded-2xl border border-purple-600/30 shadow-xl group">
                            <h3 class="font-black text-purple-300 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                                <span class="text-xl">🔐</span>
                                Zero-Knowledge Proofs
                            </h3>
                            <div class="space-y-3 text-[10px] font-black uppercase tracking-widest text-purple-200/70">
                                <div class="flex items-center gap-3">
                                    <span class="text-purple-400">✓</span>
                                    <span>Noir circuits for validation</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-purple-400">✓</span>
                                    <span>Private data verification</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-purple-400">✓</span>
                                    <span>On-chain proof storage</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-blue-900 to-slate-900 dark:to-black p-8 rounded-2xl border border-blue-600/30 shadow-xl group">
                            <h3 class="font-black text-blue-300 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                                <span class="text-xl">📦</span>
                                Light Protocol
                            </h3>
                            <div class="space-y-3 text-[10px] font-black uppercase tracking-widest text-blue-200/70">
                                <div class="flex items-center gap-3">
                                    <span class="text-blue-400">✓</span>
                                    <span>ZK compression enabled</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-blue-400">✓</span>
                                    <span>90%+ storage savings</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-blue-400">✓</span>
                                    <span>Scalable case studies</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-green-900 to-slate-900 dark:to-black p-8 rounded-2xl border border-green-600/30 shadow-xl group">
                            <h3 class="font-black text-green-300 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                                <span class="text-xl">🤝</span>
                                Arcium MPC
                            </h3>
                            <div class="space-y-3 text-[10px] font-black uppercase tracking-widest text-green-200/70">
                                <div class="flex items-center gap-3">
                                    <span class="text-green-400">✓</span>
                                    <span>Multi-party computation</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-green-400">✓</span>
                                    <span>Threshold decryption</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-green-400">✓</span>
                                    <span>Committee governance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Research Lab */}
            {activeSection === 'research' && (
                <div class="p-6 space-y-8 max-w-7xl mx-auto animate-fadeIn">
                    {/* Page Header */}
                    <div class="bg-white dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-sm relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div class="text-center relative z-10">
                            <div class="text-2xl font-black text-green-600 dark:text-green-400 mb-1 uppercase tracking-[0.2em]">Research Laboratory</div>
                            <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">aggregate_analysis_tools_active</div>
                        </div>
                    </div>

                    {/* Researcher Tools Component */}
                    <ResearcherTools />
                </div>
            )}
        </div>
    );
}