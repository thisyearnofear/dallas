import { useState, useEffect } from "preact/hooks";

interface Transaction {
    id: string;
    product: string;
    buyer: string;
    location: string;
    time: string;
    method: 'crypto' | 'cash' | 'barter';
}

const recentTransactions: Transaction[] = [
    { id: "TX001", product: "AZT", buyer: "Patient #4201", location: "Dallas", time: "3 min ago", method: "crypto" },
    { id: "TX002", product: "Peptide T", buyer: "Fighter_Mom", location: "Austin", time: "7 min ago", method: "cash" },
    { id: "TX003", product: "DDC", buyer: "Hope_Seeker", location: "Houston", time: "12 min ago", method: "barter" },
];

export function BlackMarketTerminal() {
    const [isConnected, setIsConnected] = useState(false);
    const [terminalText, setTerminalText] = useState("");
    const [currentLine, setCurrentLine] = useState(0);
    
    const bootSequence = [
        ">>> Initiating secure connection...",
        ">>> Bypassing federal monitoring systems...",
        ">>> Connecting to underground network...",
        ">>> Encryption protocols enabled...",
        ">>> Welcome to the Dallas Buyers Club Terminal",
        ">>> Type 'HELP' for available commands"
    ];

    useEffect(() => {
        if (currentLine < bootSequence.length) {
            const timer = setTimeout(() => {
                setTerminalText(prev => prev + bootSequence[currentLine] + "\n");
                setCurrentLine(prev => prev + 1);
            }, 800);
            
            if (currentLine === bootSequence.length - 1) {
                setIsConnected(true);
            }
            
            return () => clearTimeout(timer);
        }
    }, [currentLine]);

    return (
        <div class="bg-slate-950 dark:bg-black text-green-500 dark:text-green-400 font-mono p-8 rounded-2xl border-2 border-green-500/30 shadow-2xl min-h-[350px] transition-colors relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent animate-scan"></div>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-sm shadow-green-500' : 'bg-red-500'}`}></div>
                    <span class="text-xs font-black uppercase tracking-[0.2em]">
                        {isConnected ? 'Secure Connection Active' : 'Establishing Link...'}
                    </span>
                </div>
                <div class="text-[10px] font-bold opacity-40 uppercase tracking-widest">v2.84.7</div>
            </div>
            
            <div class="whitespace-pre-wrap text-sm mb-6 font-bold leading-relaxed" style={{ minHeight: '200px' }}>
                {terminalText}
                {!isConnected && (
                    <span class="animate-pulse inline-block w-2 h-4 bg-green-500 ml-1"></span>
                )}
            </div>
            
            {isConnected && (
                <div class="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner group">
                    <span class="text-green-500 font-black animate-pulse">$</span>
                    <input 
                        type="text" 
                        class="bg-transparent border-none outline-none text-green-400 flex-1 font-bold placeholder:opacity-30 placeholder:text-green-900"
                        placeholder="Type command..."
                    />
                </div>
            )}
        </div>
    );
}

export function DrugTestingSimulator() {
    const [currentTest, setCurrentTest] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<any>(null);
    const [isTestingInProgress, setIsTestingInProgress] = useState(false);
    
    const drugs = [
        { name: "AZT", purity: 95, safety: "CAUTION", effectiveness: 78 },
        { name: "Peptide T", purity: 88, safety: "EXPERIMENTAL", effectiveness: 65 },
        { name: "DDC", purity: 92, safety: "HIGH RISK", effectiveness: 82 },
    ];

    const runTest = (drugName: string) => {
        setCurrentTest(drugName);
        setIsTestingInProgress(true);
        setTestResults(null);
        
        setTimeout(() => {
            const drug = drugs.find(d => d.name === drugName);
            if (drug) {
                setTestResults({
                    ...drug,
                    timestamp: new Date().toLocaleString(),
                    batchId: `BATCH_${Math.floor(Math.random() * 10000)}`
                });
            }
            setIsTestingInProgress(false);
        }, 3000);
    };

    return (
        <div class="bg-gradient-to-br from-purple-900 to-indigo-950 dark:to-black text-white p-8 rounded-2xl border border-purple-500/30 shadow-xl transition-colors">
            <h3 class="text-xs font-black mb-6 text-purple-300 uppercase tracking-[0.2em] flex items-center gap-2">
                <span>🧪</span>
                Lab Testing Protocol
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {drugs.map((drug) => (
                    <button
                        key={drug.name}
                        onClick={() => runTest(drug.name)}
                        disabled={isTestingInProgress}
                        class="bg-white/10 hover:bg-white/20 disabled:bg-slate-800 p-4 rounded-xl border border-white/10 transition-all transform hover:scale-[1.02] active:scale-95 shadow-sm"
                    >
                        <div class="font-black uppercase tracking-tighter text-lg">{drug.name}</div>
                        <div class="text-[10px] font-bold text-purple-200 uppercase tracking-widest mt-1 opacity-70">Analyze Sample</div>
                    </button>
                ))}
            </div>
            
            {isTestingInProgress && (
                <div class="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 mb-6 animate-pulse">
                    <div class="flex items-center gap-4">
                        <div class="w-6 h-6 border-4 border-purple-400 border-t-transparent rounded-full animate-spin shadow-sm shadow-purple-500"></div>
                        <span class="font-black text-sm uppercase tracking-wider">Testing {currentTest}... Decoding molecular signature...</span>
                    </div>
                </div>
            )}
            
            {testResults && !isTestingInProgress && (
                <div class="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-purple-500/40 shadow-inner animate-fadeIn">
                    <div class="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                        <h4 class="font-black text-xl uppercase tracking-tighter">{testResults.name} Analysis</h4>
                        <span class="text-[10px] font-black text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full uppercase tracking-widest">{testResults.batchId}</span>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-6 mb-6">
                        <div class="text-center p-3 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                            <div class="text-3xl font-black text-green-400 tracking-tighter">{testResults.purity}%</div>
                            <div class="text-[9px] font-black text-purple-200/60 uppercase tracking-[0.2em] mt-1">Purity</div>
                        </div>
                        <div class="text-center p-3 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                            <div class="text-xl font-black text-yellow-400 tracking-tighter leading-tight h-8 flex items-center justify-center">{testResults.safety}</div>
                            <div class="text-[9px] font-black text-purple-200/60 uppercase tracking-[0.2em] mt-1">Safety</div>
                        </div>
                        <div class="text-center p-3 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                            <div class="text-3xl font-black text-blue-400 tracking-tighter">{testResults.effectiveness}%</div>
                            <div class="text-[9px] font-black text-purple-200/60 uppercase tracking-[0.2em] mt-1">Impact</div>
                        </div>
                    </div>
                    
                    <div class="text-[10px] font-bold text-purple-300/40 text-center uppercase tracking-widest pt-2">
                        Timestamp: {testResults.timestamp} | Certified: Dallas_Underground_Labs
                    </div>
                </div>
            )}
            
            <div class="text-[9px] font-black text-purple-400/50 mt-6 text-center uppercase tracking-widest italic border-t border-white/5 pt-4">
                ⚠️ Independent testing results — for information only — not approved by any authority
            </div>
        </div>
    );
}

export function CryptoPaymentInterface() {
    const [walletBalance] = useState(4.2069);
    const [selectedPayment, setSelectedPayment] = useState<'bitcoin' | 'monero' | 'cash'>('bitcoin');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const processPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            // Show success notification
        }, 2000);
    };

    return (
        <div class="bg-gradient-to-br from-orange-900 to-red-950 dark:to-black text-white p-8 rounded-2xl border border-orange-500/30 shadow-xl transition-colors">
            <h3 class="text-xs font-black mb-6 text-orange-300 uppercase tracking-[0.2em] flex items-center gap-2">
                <span>₿</span>
                Payment Protocol
            </h3>
            
            <div class="grid grid-cols-3 gap-4 mb-8">
                {[
                    { id: 'bitcoin', name: 'BTC', icon: '₿', desc: 'Secure' },
                    { id: 'monero', name: 'XMR', icon: 'Ɱ', desc: 'Stealth' },
                    { id: 'cash', name: 'CASH', icon: '💵', desc: 'Anon' }
                ].map((method) => (
                    <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id as any)}
                        class={`p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-sm ${
                            selectedPayment === method.id 
                                ? 'border-orange-400 bg-orange-500/20 shadow-orange-500/10' 
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                    >
                        <div class="text-3xl mb-2">{method.icon}</div>
                        <div class="font-black text-sm tracking-tighter">{method.name}</div>
                        <div class="text-[9px] font-bold text-orange-200/60 uppercase tracking-widest mt-1">{method.desc}</div>
                    </button>
                ))}
            </div>
            
            {selectedPayment === 'bitcoin' && (
                <div class="bg-black/40 backdrop-blur-sm p-5 rounded-xl border border-white/5 mb-6 shadow-inner animate-fadeIn">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-[10px] font-black text-orange-200/60 uppercase tracking-widest">Available Balance:</span>
                        <span class="font-black text-2xl tracking-tighter text-orange-300">{walletBalance} BTC</span>
                    </div>
                    <div class="text-[10px] font-mono font-bold text-orange-200/40 break-all bg-black/40 p-3 rounded-lg border border-white/5 tracking-tight">
                        1DallasBuyersClub420RonWoodroof1985X...
                    </div>
                </div>
            )}
            
            <div class="mb-8">
                <h4 class="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Recent Encrypted Transactions</h4>
                <div class="space-y-2">
                    {recentTransactions.slice(0, 3).map((tx) => (
                        <div key={tx.id} class="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                            <span class="text-xs font-black uppercase tracking-tight">{tx.product} <span class="mx-2 opacity-30">→</span> {tx.buyer}</span>
                            <span class="text-[10px] font-black text-orange-300 uppercase">{tx.time}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={processPayment}
                disabled={isProcessing}
                class="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-50 uppercase tracking-widest text-xs"
            >
                {isProcessing ? (
                    <span class="flex items-center justify-center gap-3">
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Scrambling Data...
                    </span>
                ) : (
                    `Complete Secure ${selectedPayment.toUpperCase()} Transfer`
                )}
            </button>
            
            <div class="text-[9px] font-black text-orange-400/40 mt-6 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                <span class="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                Protocol: Anonymous Layer-2 Encryption Enabled
            </div>
        </div>
    );
}

export function DangerLevelIndicator() {
    const [dangerLevel, setDangerLevel] = useState(65);
    const [threats, setThreats] = useState([
        "FDA surveillance detected",
        "Local law enforcement active", 
        "Customs intercepting shipments"
    ]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setDangerLevel(prev => {
                const change = (Math.random() - 0.5) * 10;
                return Math.max(0, Math.min(100, prev + change));
            });
        }, 3000);
        
        return () => clearInterval(interval);
    }, []);

    const getDangerColor = () => {
        if (dangerLevel >= 80) return "text-red-500 border-red-500 bg-red-950/20";
        if (dangerLevel >= 50) return "text-yellow-500 border-yellow-500 bg-yellow-950/20";
        return "text-green-500 border-green-500 bg-green-950/20";
    };

    const getDangerText = () => {
        if (dangerLevel >= 80) return "EXTREME DANGER";
        if (dangerLevel >= 60) return "HIGH RISK";
        if (dangerLevel >= 40) return "MODERATE RISK";
        return "RELATIVE SAFETY";
    };

    return (
        <div class={`p-6 rounded-2xl border-2 transition-all duration-500 shadow-lg ${getDangerColor()}`}>
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xs font-black uppercase tracking-[0.2em]">Danger Level</h3>
                <span class="font-mono text-3xl font-black tracking-tighter">{Math.round(dangerLevel)}%</span>
            </div>
            
            <div class="w-full bg-black/40 rounded-full h-4 mb-6 overflow-hidden shadow-inner border border-white/5">
                <div 
                    class={`h-full transition-all duration-1000 ${
                        dangerLevel >= 80 ? 'bg-red-500 animate-pulse' :
                        dangerLevel >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                    } shadow-lg`}
                    style={{ width: `${dangerLevel}%` }}
                ></div>
            </div>
            
            <div class={`text-center font-black tracking-[0.2em] text-sm mb-8 animate-fadeIn ${dangerLevel >= 80 ? 'animate-bounce' : ''}`}>{getDangerText()}</div>
            
            <div class="space-y-3">
                <div class="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 border-b border-white/10 pb-2">Active Network Threats:</div>
                {threats.map((threat, index) => (
                    <div key={index} class="flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                        <span class="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        {threat}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SecretHandshakeChallenge() {
    const [currentChallenge, setCurrentChallenge] = useState("");
    const [userResponse, setUserResponse] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const challenges = [
        { question: "What year was the club founded?", answer: "1985" },
        { question: "How many days was Ron given to live?", answer: "30" },
        { question: "What's the magic number?", answer: "420" },
        { question: "Complete the phrase: 'Sometimes I feel like I'm fighting for a life...'", answer: "I ain't got time to live" }
    ];
    
    useEffect(() => {
        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        setCurrentChallenge(randomChallenge.question);
    }, []);
    
    const checkAuthentication = () => {
        const challenge = challenges.find(c => c.question === currentChallenge);
        if (challenge && userResponse.toLowerCase().includes(challenge.answer.toLowerCase())) {
            setIsAuthenticated(true);
        } else {
            setUserResponse("");
            // Rotate to new challenge
            const newChallenge = challenges[Math.floor(Math.random() * challenges.length)];
            setCurrentChallenge(newChallenge.question);
        }
    };

    if (isAuthenticated) {
        return (
            <div class="bg-gradient-to-br from-green-900 to-emerald-950 dark:to-black text-white p-10 rounded-2xl border-2 border-green-500 shadow-2xl animate-fadeIn">
                <div class="text-center">
                    <div class="text-6xl mb-6 bg-white/10 p-4 rounded-full inline-block backdrop-blur-sm border border-white/10 animate-bounce">✅</div>
                    <h3 class="text-3xl font-black mb-2 uppercase tracking-tighter">Authenticated</h3>
                    <p class="text-green-300 font-bold tracking-tight">Welcome to the inner circle, fighter.</p>
                    <div class="mt-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 animate-pulse">
                        Identity Scrambled • Access Granted
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div class="bg-gradient-to-br from-slate-800 to-slate-950 text-white p-10 rounded-2xl border-2 border-slate-700 shadow-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-yellow-500/10 transition-all duration-700"></div>
            <h3 class="text-xs font-black mb-8 text-yellow-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <span class="w-3 h-3 bg-yellow-500 rounded-full animate-ping"></span>
                Identity Verification Required
            </h3>
            <p class="text-slate-300 mb-8 font-bold leading-relaxed">To access underground operations, prove your membership in the resistance:</p>
            
            <div class="mb-10 p-6 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">System Challenge:</div>
                <div class="text-xl font-black text-yellow-300 uppercase tracking-tight italic">
                    "{currentChallenge}"
                </div>
            </div>
            
            <div class="space-y-4">
                <input 
                    type="text"
                    value={userResponse}
                    onInput={(e) => setUserResponse((e.currentTarget as HTMLInputElement).value)}
                    placeholder="Provide encrypted answer..."
                    class="w-full p-5 bg-black/60 border border-white/10 rounded-xl text-white font-bold placeholder:opacity-20 focus:border-yellow-500 outline-none transition-all shadow-inner"
                />
                
                <button 
                    onClick={checkAuthentication}
                    class="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-black py-5 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl uppercase tracking-widest text-xs"
                >
                    🔓 Verify Membership
                </button>
            </div>
            
            <div class="text-[9px] font-black text-slate-500 mt-8 text-center uppercase tracking-widest italic opacity-60">
                Only the truly diagnosed can cross this line
            </div>
        </div>
    );
}