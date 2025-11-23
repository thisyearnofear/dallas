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
        <div class="bg-black text-green-400 font-mono p-6 rounded-lg border border-green-500/50 min-h-[300px]">
            <div class="flex items-center gap-2 mb-4">
                <div class={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span class="text-sm font-bold">
                    {isConnected ? 'SECURE CONNECTION ESTABLISHED' : 'CONNECTING...'}
                </span>
            </div>
            
            <div class="whitespace-pre-wrap text-sm mb-4" style={{ minHeight: '200px' }}>
                {terminalText}
                {!isConnected && (
                    <span class="animate-pulse">█</span>
                )}
            </div>
            
            {isConnected && (
                <div class="flex items-center gap-2">
                    <span class="text-green-400">$</span>
                    <input 
                        type="text" 
                        class="bg-transparent border-none outline-none text-green-400 flex-1"
                        placeholder="Enter command (HELP, PRODUCTS, STATUS)"
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
        <div class="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6 rounded-lg border border-purple-500/50">
            <h3 class="text-xl font-bold mb-4 text-purple-300">🧪 UNDERGROUND LAB TESTING</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {drugs.map((drug) => (
                    <button
                        key={drug.name}
                        onClick={() => runTest(drug.name)}
                        disabled={isTestingInProgress}
                        class="bg-purple-800/50 hover:bg-purple-700/50 disabled:bg-gray-600 p-3 rounded border border-purple-500/30 transition-colors"
                    >
                        <div class="font-semibold">{drug.name}</div>
                        <div class="text-sm text-purple-200">Test Sample</div>
                    </button>
                ))}
            </div>
            
            {isTestingInProgress && (
                <div class="bg-black/50 p-4 rounded border border-purple-500/30 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Testing {currentTest}... Analyzing molecular composition...</span>
                    </div>
                </div>
            )}
            
            {testResults && !isTestingInProgress && (
                <div class="bg-black/70 p-4 rounded border border-purple-500/50">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="font-bold text-lg">{testResults.name} - TEST RESULTS</h4>
                        <span class="text-xs text-purple-300">Batch: {testResults.batchId}</span>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4 mb-3">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-400">{testResults.purity}%</div>
                            <div class="text-xs text-purple-200">PURITY</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-yellow-400">{testResults.safety}</div>
                            <div class="text-xs text-purple-200">SAFETY</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-400">{testResults.effectiveness}%</div>
                            <div class="text-xs text-purple-200">EFFECTIVENESS</div>
                        </div>
                    </div>
                    
                    <div class="text-xs text-purple-300 border-t border-purple-500/30 pt-2">
                        Tested: {testResults.timestamp} | Lab Certified: Dallas Underground
                    </div>
                </div>
            )}
            
            <div class="text-xs text-purple-400 mt-4 opacity-75">
                ⚠️ Underground testing - Results not FDA approved
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
        <div class="bg-gradient-to-br from-orange-900 to-red-900 text-white p-6 rounded-lg border border-orange-500/50">
            <h3 class="text-xl font-bold mb-4 text-orange-300">₿ UNDERGROUND PAYMENT SYSTEM</h3>
            
            <div class="grid grid-cols-3 gap-3 mb-6">
                {[
                    { id: 'bitcoin', name: 'Bitcoin', icon: '₿', desc: 'Anonymous' },
                    { id: 'monero', name: 'Monero', icon: 'Ɱ', desc: 'Untraceable' },
                    { id: 'cash', name: 'Cash', icon: '💵', desc: 'In Person' }
                ].map((method) => (
                    <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id as any)}
                        class={`p-3 rounded border-2 transition-all ${
                            selectedPayment === method.id 
                                ? 'border-orange-400 bg-orange-800/50' 
                                : 'border-orange-600/30 hover:border-orange-500/50'
                        }`}
                    >
                        <div class="text-2xl mb-1">{method.icon}</div>
                        <div class="text-sm font-semibold">{method.name}</div>
                        <div class="text-xs text-orange-200">{method.desc}</div>
                    </button>
                ))}
            </div>
            
            {selectedPayment === 'bitcoin' && (
                <div class="bg-black/50 p-4 rounded border border-orange-500/30 mb-4">
                    <div class="flex justify-between items-center mb-3">
                        <span>Wallet Balance:</span>
                        <span class="font-bold text-xl">{walletBalance} BTC</span>
                    </div>
                    <div class="text-xs text-orange-300 font-mono break-all bg-orange-900/30 p-2 rounded">
                        1DallasBuyersClub420RonWoodroof1985
                    </div>
                </div>
            )}
            
            <div class="mb-4">
                <h4 class="font-semibold mb-2">Recent Transactions</h4>
                <div class="space-y-2">
                    {recentTransactions.slice(0, 3).map((tx) => (
                        <div key={tx.id} class="flex justify-between items-center text-sm bg-black/30 p-2 rounded">
                            <span>{tx.product} → {tx.buyer}</span>
                            <span class="text-orange-300">{tx.time}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={processPayment}
                disabled={isProcessing}
                class="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
            >
                {isProcessing ? (
                    <span class="flex items-center justify-center gap-2">
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                    </span>
                ) : (
                    `💰 Complete Transaction (${selectedPayment.toUpperCase()})`
                )}
            </button>
            
            <div class="text-xs text-orange-400 mt-3 text-center opacity-75">
                🔒 All transactions are encrypted and anonymous
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
        if (dangerLevel >= 80) return "text-red-500 border-red-500 bg-red-900/20";
        if (dangerLevel >= 50) return "text-yellow-500 border-yellow-500 bg-yellow-900/20";
        return "text-green-500 border-green-500 bg-green-900/20";
    };

    const getDangerText = () => {
        if (dangerLevel >= 80) return "EXTREME DANGER";
        if (dangerLevel >= 60) return "HIGH RISK";
        if (dangerLevel >= 40) return "MODERATE RISK";
        return "RELATIVE SAFETY";
    };

    return (
        <div class={`p-4 rounded-lg border-2 ${getDangerColor()}`}>
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold">⚠️ DANGER LEVEL</h3>
                <span class="font-mono text-2xl font-bold">{dangerLevel}%</span>
            </div>
            
            <div class="w-full bg-gray-800 rounded-full h-3 mb-3 overflow-hidden">
                <div 
                    class={`h-full transition-all duration-1000 ${
                        dangerLevel >= 80 ? 'bg-red-500 animate-pulse' :
                        dangerLevel >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${dangerLevel}%` }}
                ></div>
            </div>
            
            <div class="text-center font-bold mb-3">{getDangerText()}</div>
            
            <div class="text-sm space-y-1">
                <div class="font-semibold text-gray-300 mb-2">Active Threats:</div>
                {threats.map((threat, index) => (
                    <div key={index} class="flex items-center gap-2 text-xs">
                        <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
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
            <div class="bg-gradient-to-r from-green-800 to-emerald-800 text-white p-6 rounded-lg border border-green-500">
                <div class="text-center">
                    <div class="text-4xl mb-2">✅</div>
                    <h3 class="text-xl font-bold mb-2">AUTHENTICATED</h3>
                    <p class="text-green-200">Welcome to the inner circle, fighter.</p>
                    <div class="mt-4 text-sm opacity-75">
                        Access granted to underground network
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-lg border border-gray-600">
            <h3 class="text-xl font-bold mb-4 text-yellow-400">🤝 SECRET HANDSHAKE REQUIRED</h3>
            <p class="text-gray-300 mb-4">To access underground features, prove you're one of us:</p>
            
            <div class="mb-4">
                <div class="text-sm text-gray-400 mb-2">Challenge:</div>
                <div class="bg-black/50 p-3 rounded border border-gray-600 font-semibold">
                    {currentChallenge}
                </div>
            </div>
            
            <input 
                type="text"
                value={userResponse}
                onChange={(e) => setUserResponse((e.target as HTMLInputElement).value)}
                placeholder="Enter your response..."
                class="w-full p-3 bg-black/50 border border-gray-600 rounded text-white mb-4 focus:border-yellow-400 outline-none"
            />
            
            <button 
                onClick={checkAuthentication}
                class="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-4 rounded transition-colors"
            >
                🔓 VERIFY IDENTITY
            </button>
            
            <div class="text-xs text-gray-400 mt-3 text-center">
                Only true fighters know the answers
            </div>
        </div>
    );
}