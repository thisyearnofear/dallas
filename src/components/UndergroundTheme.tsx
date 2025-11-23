import { useState, useEffect } from "preact/hooks";

// Simulate underground network communications
const networkMessages = [
    "🔒 Secure connection established from Dallas...",
    "📦 New shipment from Mexico intercepted by customs",
    "⚡ Underground network: 23 new nodes online",
    "🚨 FDA raid avoided in Austin - network secure",
    "💊 AZT alternative found - clinical trials bypassed", 
    "🤝 Contact established with European suppliers",
    "📡 Encrypted communication from Patient #420",
    "🛡️ Network security upgraded - stay vigilant"
];

export function UndergroundNetwork() {
    const [currentMessage, setCurrentMessage] = useState(0);
    const [isDecrypting, setIsDecrypting] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsDecrypting(true);
            setTimeout(() => {
                setCurrentMessage((prev) => (prev + 1) % networkMessages.length);
                setIsDecrypting(false);
            }, 1000);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div class="bg-black text-green-400 font-mono p-4 rounded-lg border border-green-500/30 shadow-lg">
            <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-xs font-bold">UNDERGROUND NETWORK</span>
                <div class="ml-auto text-xs opacity-60">ENCRYPTED</div>
            </div>
            
            <div class="min-h-[20px]">
                {isDecrypting ? (
                    <div class="text-xs animate-pulse">
                        {"█".repeat(Math.floor(Math.random() * 40) + 10)}
                    </div>
                ) : (
                    <div class="text-xs">
                        {networkMessages[currentMessage]}
                    </div>
                )}
            </div>
            
            <div class="mt-2 text-xs opacity-40 border-t border-green-500/20 pt-2">
                NODE: DALLAS_01 | UPTIME: 2847 DAYS | STATUS: ACTIVE
            </div>
        </div>
    );
}

export function SystemResistanceTimer() {
    const [daysResisting, setDaysResisting] = useState(2847); // Days since 1985
    
    useEffect(() => {
        const interval = setInterval(() => {
            setDaysResisting(prev => prev + 1);
        }, 86400000); // Daily increment
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div class="bg-gradient-to-r from-red-900/90 to-black text-white p-6 rounded-lg border border-red-500/50">
            <h2 class="text-2xl font-bold mb-2 text-red-400">⚡ RESISTANCE TIMER</h2>
            <div class="text-6xl font-mono font-bold text-center mb-4">
                {daysResisting.toLocaleString()}
            </div>
            <div class="text-center text-red-200">
                DAYS FIGHTING THE SYSTEM
            </div>
            <div class="text-center text-xs mt-2 opacity-75">
                "The system tried to kill us. We're still here."
            </div>
        </div>
    );
}

export function SupplyChainStatus() {
    const [supplies, setSupplies] = useState([
        { name: "AZT", stock: "CRITICAL", risk: "HIGH", eta: "72H", color: "text-red-400" },
        { name: "Peptide T", stock: "AVAILABLE", risk: "MEDIUM", eta: "24H", color: "text-yellow-400" },
        { name: "DDC", stock: "RESTOCKING", risk: "LOW", eta: "48H", color: "text-blue-400" },
        { name: "Interferon", stock: "SECURED", risk: "NONE", eta: "12H", color: "text-green-400" }
    ]);

    return (
        <div class="bg-gray-900 text-gray-100 p-4 rounded-lg border border-gray-600">
            <h3 class="text-lg font-bold mb-3 text-yellow-400">📦 SUPPLY CHAIN STATUS</h3>
            <div class="space-y-2">
                {supplies.map((supply, index) => (
                    <div key={supply.name} class="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <div class="flex items-center gap-3">
                            <span class={`text-lg ${supply.color}`}>●</span>
                            <span class="font-semibold">{supply.name}</span>
                        </div>
                        <div class="text-right text-xs">
                            <div class={supply.color}>{supply.stock}</div>
                            <div class="opacity-60">ETA: {supply.eta}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div class="mt-3 text-xs text-gray-400 border-t border-gray-700 pt-2">
                ⚠️ Shipments may be delayed due to federal interference
            </div>
        </div>
    );
}

export function RebellionMeter() {
    const [rebellionLevel, setRebellionLevel] = useState(85);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setRebellionLevel(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                return Math.max(70, Math.min(100, prev + change));
            });
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    const getMeterColor = (level: number) => {
        if (level >= 90) return "text-red-500 border-red-500";
        if (level >= 75) return "text-orange-500 border-orange-500";
        return "text-yellow-500 border-yellow-500";
    };

    const getMeterText = (level: number) => {
        if (level >= 90) return "MAXIMUM REBELLION";
        if (level >= 80) return "HIGH RESISTANCE";
        if (level >= 70) return "ACTIVE RESISTANCE";
        return "BUILDING MOMENTUM";
    };

    return (
        <div class={`bg-black p-4 rounded-lg border-2 ${getMeterColor(rebellionLevel)}`}>
            <h3 class="text-lg font-bold mb-3 text-white">⚡ REBELLION METER</h3>
            <div class="relative">
                <div class="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                    <div 
                        class={`h-full transition-all duration-1000 ${
                            rebellionLevel >= 90 ? 'bg-red-500' :
                            rebellionLevel >= 75 ? 'bg-orange-500' : 'bg-yellow-500'
                        } animate-pulse`}
                        style={{ width: `${rebellionLevel}%` }}
                    ></div>
                </div>
                <div class="flex justify-between text-xs mt-2 text-gray-400">
                    <span>PASSIVE</span>
                    <span>REVOLUTIONARY</span>
                </div>
            </div>
            <div class={`text-center mt-2 font-bold ${getMeterColor(rebellionLevel)}`}>
                {getMeterText(rebellionLevel)}
            </div>
        </div>
    );
}

export function PatientCodeGenerator() {
    const [patientCode, setPatientCode] = useState("PATIENT_#" + Math.floor(Math.random() * 9999));
    const [isGenerating, setIsGenerating] = useState(false);
    
    const generateNewCode = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setPatientCode("PATIENT_#" + Math.floor(Math.random() * 9999));
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div class="bg-gradient-to-br from-indigo-900 to-black text-white p-6 rounded-lg border border-indigo-500">
            <h3 class="text-lg font-bold mb-4 text-indigo-300">🔐 SECURE IDENTITY</h3>
            
            <div class="text-center mb-4">
                <div class="text-sm text-gray-400 mb-2">YOUR UNDERGROUND ID:</div>
                <div class="font-mono text-2xl font-bold bg-black/50 p-3 rounded border">
                    {isGenerating ? (
                        <span class="animate-pulse">GENERATING...</span>
                    ) : (
                        patientCode
                    )}
                </div>
            </div>
            
            <button 
                onClick={generateNewCode}
                disabled={isGenerating}
                class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                {isGenerating ? "🔄 SCRAMBLING..." : "🔄 REGENERATE ID"}
            </button>
            
            <div class="text-xs text-gray-400 mt-3 text-center">
                Anonymous protection for underground operations
            </div>
        </div>
    );
}

export function FDAWarningBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [warningLevel, setWarningLevel] = useState<'low' | 'medium' | 'high'>('medium');
    
    useEffect(() => {
        const interval = setInterval(() => {
            const levels = ['low', 'medium', 'high'] as const;
            setWarningLevel(levels[Math.floor(Math.random() * levels.length)]);
        }, 10000);
        
        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    const getWarningStyle = () => {
        switch (warningLevel) {
            case 'high': return 'bg-red-600 border-red-400';
            case 'medium': return 'bg-orange-600 border-orange-400';
            case 'low': return 'bg-yellow-600 border-yellow-400';
        }
    };

    const getWarningText = () => {
        switch (warningLevel) {
            case 'high': return 'HIGH ALERT: Federal raids reported in the area';
            case 'medium': return 'CAUTION: Increased regulatory activity detected';
            case 'low': return 'ADVISORY: Maintain standard security protocols';
        }
    };

    return (
        <div class={`${getWarningStyle()} text-white p-3 rounded-lg border-2 animate-pulse`}>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🚨</span>
                    <span class="font-bold text-sm">FDA THREAT LEVEL: {warningLevel.toUpperCase()}</span>
                </div>
                <button 
                    onClick={() => setIsVisible(false)}
                    class="text-white hover:text-gray-200 text-xl"
                >
                    ×
                </button>
            </div>
            <div class="text-sm mt-1">
                {getWarningText()}
            </div>
        </div>
    );
}

export function MexicanConnectionStatus() {
    const [connectionStrength, setConnectionStrength] = useState(78);
    const [lastContact, setLastContact] = useState("2 hours ago");
    
    return (
        <div class="bg-gradient-to-r from-green-800 to-emerald-900 text-white p-4 rounded-lg border border-green-500/50">
            <div class="flex items-center gap-3 mb-3">
                <span class="text-2xl">🇲🇽</span>
                <h3 class="font-bold">MEXICAN CONNECTION</h3>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div class="text-green-200">Connection Strength:</div>
                    <div class="font-bold text-xl">{connectionStrength}%</div>
                </div>
                <div>
                    <div class="text-green-200">Last Contact:</div>
                    <div class="font-bold">{lastContact}</div>
                </div>
            </div>
            
            <div class="mt-3">
                <div class="w-full bg-green-900/50 rounded-full h-2">
                    <div 
                        class="bg-green-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${connectionStrength}%` }}
                    ></div>
                </div>
            </div>
            
            <div class="text-xs text-green-200 mt-2 opacity-75">
                "The medicine is the key to survival" - Dr. Vass
            </div>
        </div>
    );
}