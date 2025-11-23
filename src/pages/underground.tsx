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
    BlackMarketTerminal, 
    DrugTestingSimulator, 
    CryptoPaymentInterface, 
    DangerLevelIndicator,
    SecretHandshakeChallenge 
} from "../components/BlackMarketExperience";
import { 
    RetroModal, 
    InfomercialPopup, 
    RetroTerminal, 
    RetroAlert, 
    RetroButton, 
    RetroBadge,
    AudioEffects 
} from "../components/RetroAesthetics";
import { useState, useEffect } from "preact/hooks";

export function Underground() {
    const [activeSection, setActiveSection] = useState<'command' | 'office' | 'market' | 'intel' | 'history'>('command');
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
            <div class="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4 font-mono">
                <div class="max-w-md w-full">
                    <RetroTerminal>
                        <div class="text-center mb-6">
                            <div class="text-2xl mb-4 text-red-400">⚠ ACCESS DENIED ⚠</div>
                            <div class="text-sm mb-2">DALLAS BUYERS CLUB NETWORK</div>
                            <div class="text-xs opacity-75">UNAUTHORIZED ACCESS PROHIBITED</div>
                        </div>
                        
                        <SecretHandshakeChallenge />
                        
                        <div class="mt-6 text-center border-t-2 border-green-600 pt-4">
                            <div class="text-xs text-green-600 mb-2">[DEBUG MODE]</div>
                            <button 
                                onClick={() => setIsAuthenticated(true)}
                                class="text-xs text-green-400 hover:text-green-300 underline"
                            >
                                BYPASS_AUTH.EXE
                            </button>
                        </div>
                    </RetroTerminal>
                </div>
            </div>
        );
    }

    return (
        <div class="min-h-screen bg-black text-gray-300 font-mono">
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
            <div class="bg-blue-900 text-white p-3 border-b-4 border-blue-600">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-4 h-4 bg-green-400 animate-pulse"></div>
                        <span class="font-bold">DALLAS BUYERS CLUB NETWORK v1.85</span>
                    </div>
                    <div class="flex items-center gap-4 text-sm">
                        <span>USER: PATIENT_#420</span>
                        <RetroBadge color="green">SECURE</RetroBadge>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div class="p-4 bg-gray-800 border-b-2 border-gray-600">
                <div class="flex flex-wrap gap-1">
                    {[
                        { id: 'command', label: 'COMMAND', desc: 'HQ' },
                        { id: 'office', label: 'OFFICE', desc: 'RON' },
                        { id: 'market', label: 'MARKET', desc: 'BUY' },
                        { id: 'intel', label: 'INTEL', desc: 'WAR' },
                        { id: 'history', label: 'ARCHIVE', desc: 'DOCS' }
                    ].map((section) => (
                        <RetroButton
                            key={section.id}
                            onClick={() => setActiveSection(section.id as any)}
                            variant={activeSection === section.id ? 'success' : 'primary'}
                        >
                            <div class="text-center text-xs">
                                <div class="font-bold">{section.label}</div>
                                <div class="opacity-75">{section.desc}</div>
                            </div>
                        </RetroButton>
                    ))}
                </div>
            </div>

            {/* Command Center */}
            {activeSection === 'command' && (
                <div class="p-4 space-y-4">
                    {/* Header */}
                    <div class="bg-gray-800 border-4 border-gray-600 p-4">
                        <div class="text-center">
                            <div class="text-xl font-bold text-green-400 mb-1">COMMAND CENTER</div>
                            <div class="text-xs text-gray-400">UNDERGROUND_HQ.EXE</div>
                        </div>
                    </div>

                    {/* Collapsible Sections */}
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Network Panel */}
                        <div class="bg-gray-900 border-4 border-gray-600">
                            <div 
                                onClick={() => toggleSection('network')}
                                class="bg-blue-800 text-white p-2 cursor-pointer hover:bg-blue-700 flex justify-between items-center"
                            >
                                <span class="font-bold text-sm">NETWORK STATUS</span>
                                <span class="text-xs">{collapsedSections.network ? '[+]' : '[-]'}</span>
                            </div>
                            {!collapsedSections.network && (
                                <div class="p-4 space-y-4">
                                    <UndergroundNetwork />
                                    <PatientCodeGenerator />
                                </div>
                            )}
                        </div>

                        {/* Operations Panel */}
                        <div class="bg-gray-900 border-4 border-gray-600">
                            <div 
                                onClick={() => toggleSection('operations')}
                                class="bg-red-800 text-white p-2 cursor-pointer hover:bg-red-700 flex justify-between items-center"
                            >
                                <span class="font-bold text-sm">OPERATIONS</span>
                                <span class="text-xs">{collapsedSections.operations ? '[+]' : '[-]'}</span>
                            </div>
                            {!collapsedSections.operations && (
                                <div class="p-4 space-y-4">
                                    <SystemResistanceTimer />
                                    <RebellionMeter />
                                </div>
                            )}
                        </div>

                        {/* Supply Panel */}
                        <div class="bg-gray-900 border-4 border-gray-600">
                            <div 
                                onClick={() => toggleSection('supply')}
                                class="bg-green-800 text-white p-2 cursor-pointer hover:bg-green-700 flex justify-between items-center"
                            >
                                <span class="font-bold text-sm">SUPPLY CHAIN</span>
                                <span class="text-xs">{collapsedSections.supply ? '[+]' : '[-]'}</span>
                            </div>
                            {!collapsedSections.supply && (
                                <div class="p-4 space-y-4">
                                    <SupplyChainStatus />
                                    <MexicanConnectionStatus />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Operations - 80s Style */}
                    <div class="bg-gray-900 border-4 border-gray-600">
                        <div class="bg-yellow-600 text-black p-2">
                            <span class="font-bold text-sm">ACTIVE OPERATIONS</span>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-2 gap-4 text-xs font-mono">
                                <div class="bg-black p-2 border-2 border-gray-600">
                                    <div class="text-green-400">PROJECT_PHOENIX:</div>
                                    <div class="text-white">STATUS: ACTIVE</div>
                                </div>
                                <div class="bg-black p-2 border-2 border-gray-600">
                                    <div class="text-yellow-400">BORDER_RUN_47:</div>
                                    <div class="text-white">STATUS: IN_TRANSIT</div>
                                </div>
                                <div class="bg-black p-2 border-2 border-gray-600">
                                    <div class="text-blue-400">LAB_ANALYSIS:</div>
                                    <div class="text-white">STATUS: PENDING</div>
                                </div>
                                <div class="bg-black p-2 border-2 border-gray-600">
                                    <div class="text-green-400">NETWORK_EXP:</div>
                                    <div class="text-white">STATUS: ONGOING</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - 80s Style */}
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <RetroButton variant="danger" onClick={() => setShowAlert(true)}>
                            <div class="text-center text-xs">
                                <div class="mb-1">EMERGENCY</div>
                                <div>PROTOCOL</div>
                            </div>
                        </RetroButton>
                        <RetroButton variant="success">
                            <div class="text-center text-xs">
                                <div class="mb-1">NEW</div>
                                <div>SHIPMENT</div>
                            </div>
                        </RetroButton>
                        <RetroButton variant="primary">
                            <div class="text-center text-xs">
                                <div class="mb-1">SECURE</div>
                                <div>COMM</div>
                            </div>
                        </RetroButton>
                        <RetroButton variant="warning">
                            <div class="text-center text-xs">
                                <div class="mb-1">INTEL</div>
                                <div>REPORT</div>
                            </div>
                        </RetroButton>
                    </div>
                </div>
            )}

            {/* Ron's Office */}
            {activeSection === 'office' && (
                <RonsOfficeExperience />
            )}

            {/* Black Market */}
            {activeSection === 'market' && (
                <div class="p-4 space-y-4">
                    {/* Market Header */}
                    <div class="bg-gray-800 border-4 border-gray-600 p-4">
                        <div class="text-center">
                            <div class="text-xl font-bold text-green-400 mb-1">UNDERGROUND MARKETPLACE</div>
                            <div class="text-xs text-gray-400">SECURE_TRADE.EXE v2.1</div>
                            <RetroBadge color="yellow">ENCRYPTED</RetroBadge>
                        </div>
                    </div>

                    {/* Warning Banner - 80s Style */}
                    <div class="bg-red-600 text-white border-4 border-red-800 p-2 animate-pulse">
                        <div class="text-center font-bold text-sm">
                            *** WARNING: UNAUTHORIZED PHARMACEUTICAL DISTRIBUTION ***
                        </div>
                        <div class="text-center text-xs">
                            USE AT YOUR OWN RISK - NOT FDA APPROVED
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Terminal & Testing */}
                        <div class="space-y-4">
                            <div class="bg-gray-900 border-4 border-gray-600">
                                <div class="bg-green-800 text-white p-2">
                                    <span class="font-bold text-sm">TERMINAL ACCESS</span>
                                </div>
                                <div class="p-4">
                                    <BlackMarketTerminal />
                                </div>
                            </div>

                            <div class="bg-gray-900 border-4 border-gray-600">
                                <div 
                                    onClick={() => toggleSection('testing')}
                                    class="bg-purple-800 text-white p-2 cursor-pointer hover:bg-purple-700 flex justify-between items-center"
                                >
                                    <span class="font-bold text-sm">LAB TESTING</span>
                                    <span class="text-xs">{collapsedSections.testing ? '[+]' : '[-]'}</span>
                                </div>
                                {!collapsedSections.testing && (
                                    <div class="p-4">
                                        <DrugTestingSimulator />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment & Security */}
                        <div class="space-y-4">
                            <div class="bg-gray-900 border-4 border-gray-600">
                                <div 
                                    onClick={() => toggleSection('payment')}
                                    class="bg-yellow-600 text-black p-2 cursor-pointer hover:bg-yellow-500 flex justify-between items-center"
                                >
                                    <span class="font-bold text-sm">PAYMENT SYSTEM</span>
                                    <span class="text-xs">{collapsedSections.payment ? '[+]' : '[-]'}</span>
                                </div>
                                {!collapsedSections.payment && (
                                    <div class="p-4">
                                        <CryptoPaymentInterface />
                                    </div>
                                )}
                            </div>

                            {/* Security Status - 80s Style */}
                            <div class="bg-gray-900 border-4 border-gray-600">
                                <div class="bg-blue-800 text-white p-2">
                                    <span class="font-bold text-sm">SECURITY STATUS</span>
                                </div>
                                <div class="p-4 font-mono text-xs">
                                    <div class="bg-black border-2 border-gray-600 p-3 space-y-1">
                                        <div class="flex justify-between">
                                            <span class="text-green-400">[OK]</span>
                                            <span class="text-white">ENCRYPTION: ENABLED</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-green-400">[OK]</span>
                                            <span class="text-white">IDENTITY: PROTECTED</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-green-400">[OK]</span>
                                            <span class="text-white">PAYMENT: SECURE</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-green-400">[OK]</span>
                                            <span class="text-white">QUALITY: VERIFIED</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-red-400">[!!]</span>
                                            <span class="text-white">FDA_MONITOR: DETECTED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Buy - Infomercial Style */}
                            <div class="bg-yellow-300 border-4 border-red-600 p-4 text-black">
                                <div class="text-center">
                                    <div class="font-bold text-sm mb-2">⚡ QUICK ORDER ⚡</div>
                                    <div class="text-xs mb-3">
                                        CALL NOW! Operators standing by 24/7!
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <RetroButton variant="danger">
                                            <div class="text-xs">
                                                AZT
                                                <div>$49.95</div>
                                            </div>
                                        </RetroButton>
                                        <RetroButton variant="success">
                                            <div class="text-xs">
                                                PEPTIDE_T
                                                <div>$29.95</div>
                                            </div>
                                        </RetroButton>
                                    </div>
                                    <div class="text-xs mt-2 font-bold animate-pulse">
                                        LIMITED TIME! ACT NOW!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Intelligence */}
            {activeSection === 'intel' && (
                <div class="p-4 space-y-6">
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold text-blue-400 mb-2">📡 INTELLIGENCE CENTER</h1>
                        <p class="text-gray-300">Monitor the ongoing battle between system and freedom</p>
                    </div>

                    <SystemBattleboard />
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PropagandaPosters />
                        <ResistanceQuotes />
                    </div>

                    <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-600">
                        <h3 class="text-xl font-bold mb-4 text-gray-200">📈 RESISTANCE METRICS</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="text-center p-3 bg-black/30 rounded border border-gray-600">
                                <div class="text-2xl font-bold text-green-400">420</div>
                                <div class="text-xs text-gray-400">Active Fighters</div>
                            </div>
                            <div class="text-center p-3 bg-black/30 rounded border border-gray-600">
                                <div class="text-2xl font-bold text-blue-400">23</div>
                                <div class="text-xs text-gray-400">Secure Nodes</div>
                            </div>
                            <div class="text-center p-3 bg-black/30 rounded border border-gray-600">
                                <div class="text-2xl font-bold text-purple-400">89%</div>
                                <div class="text-xs text-gray-400">Success Rate</div>
                            </div>
                            <div class="text-center p-3 bg-black/30 rounded border border-gray-600">
                                <div class="text-2xl font-bold text-yellow-400">$2.1M</div>
                                <div class="text-xs text-gray-400">Lives Saved Value</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History/Archives */}
            {activeSection === 'history' && (
                <div class="p-4">
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold text-amber-400 mb-2">📜 UNDERGROUND ARCHIVES</h1>
                        <p class="text-gray-300">Preserving the memory of our fight for freedom</p>
                    </div>
                    
                    <MemoryWall />

                    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-gradient-to-br from-amber-900 to-orange-900 p-4 rounded-lg border border-amber-600/50">
                            <h3 class="font-bold text-amber-300 mb-3">📚 HISTORICAL DOCUMENTS</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>Club Charter</span>
                                    <span class="text-amber-400">1985</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>First FDA Letter</span>
                                    <span class="text-amber-400">1986</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Medical Records</span>
                                    <span class="text-amber-400">1985-1991</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Legal Victories</span>
                                    <span class="text-amber-400">23 Cases</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-green-900 to-emerald-900 p-4 rounded-lg border border-green-600/50">
                            <h3 class="font-bold text-green-300 mb-3">🏆 ACHIEVEMENTS</h3>
                            <div class="space-y-2 text-sm">
                                <div>✅ Saved 847+ lives</div>
                                <div>✅ Challenged FDA monopoly</div>
                                <div>✅ Opened treatment access</div>
                                <div>✅ Inspired global movement</div>
                                <div>✅ Changed medical law</div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-red-900 to-pink-900 p-4 rounded-lg border border-red-600/50">
                            <h3 class="font-bold text-red-300 mb-3">💔 NEVER FORGET</h3>
                            <div class="space-y-2 text-sm">
                                <div>Those lost to the system</div>
                                <div>Patients denied treatment</div>
                                <div>Families torn apart</div>
                                <div>Hope almost extinguished</div>
                                <div>The fight continues...</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}