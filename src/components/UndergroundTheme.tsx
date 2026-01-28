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
        <div class="bg-slate-950 dark:bg-black text-green-500 dark:text-green-400 font-mono p-5 rounded-xl border border-green-500/30 shadow-lg transition-colors">
            <div class="flex items-center gap-2 mb-3">
                <div class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500"></div>
                <span class="text-xs font-black uppercase tracking-widest">Underground Network</span>
                <div class="ml-auto text-[10px] font-bold opacity-60 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">Encrypted</div>
            </div>
            
            <div class="min-h-[24px] bg-black/20 p-2 rounded border border-white/5 shadow-inner">
                {isDecrypting ? (
                    <div class="text-xs animate-pulse opacity-50">
                        {"█".repeat(Math.floor(Math.random() * 40) + 10)}
                    </div>
                ) : (
                    <div class="text-xs font-bold tracking-tight">
                        {networkMessages[currentMessage]}
                    </div>
                )}
            </div>
            
            <div class="mt-4 text-[10px] font-bold opacity-40 border-t border-green-500/20 pt-3 flex justify-between uppercase tracking-widest">
                <span>Node: Dallas_01</span>
                <span>Uptime: 2847 Days</span>
                <span>Active</span>
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
        <div class="bg-gradient-to-br from-red-900 to-slate-900 dark:to-black text-white p-8 rounded-2xl border border-red-500/30 shadow-xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-red-500/20 transition-all duration-700"></div>
            <h2 class="text-xs font-black mb-4 text-red-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <span class="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                Resistance Timer
            </h2>
            <div class="text-7xl font-mono font-black text-center mb-6 tracking-tighter drop-shadow-lg group-hover:scale-105 transition-transform duration-500">
                {daysResisting.toLocaleString()}
            </div>
            <div class="text-center text-red-200 font-black uppercase tracking-widest text-xs mb-4">
                Days Fighting the System
            </div>
            <div class="text-center text-[10px] italic opacity-60 max-w-[200px] mx-auto leading-tight border-t border-white/10 pt-4">
                "The system tried to kill us. We're still here."
            </div>
        </div>
    );
}

export function SupplyChainStatus() {
    const [supplies, setSupplies] = useState([
        { name: "AZT", stock: "CRITICAL", risk: "HIGH", eta: "72H", color: "text-red-500 dark:text-red-400" },
        { name: "Peptide T", stock: "AVAILABLE", risk: "MEDIUM", eta: "24H", color: "text-yellow-500 dark:text-yellow-400" },
        { name: "DDC", stock: "RESTOCKING", risk: "LOW", eta: "48H", color: "text-blue-500 dark:text-blue-400" },
        { name: "Interferon", stock: "SECURED", risk: "NONE", eta: "12H", color: "text-green-500 dark:text-green-400" }
    ]);

    return (
        <div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-gray-100 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <h3 class="text-xs font-black mb-6 text-yellow-600 dark:text-yellow-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span>📦</span>
                Supply Chain Status
            </h3>
            <div class="space-y-3">
                {supplies.map((supply, index) => (
                    <div key={supply.name} class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:border-brand/30 transition-all">
                        <div class="flex items-center gap-4">
                            <span class={`w-2 h-2 rounded-full ${supply.color.split(' ')[0]} ${supply.color.split(' ')[1]}`}></span>
                            <span class="font-black uppercase tracking-tighter text-sm">{supply.name}</span>
                        </div>
                        <div class="text-right">
                            <div class={`text-[10px] font-black uppercase ${supply.color}`}>{supply.stock}</div>
                            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ETA: {supply.eta}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div class="mt-6 text-[9px] font-bold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 italic text-center uppercase tracking-widest">
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
        if (level >= 90) return "text-red-600 dark:text-red-500 border-red-500/30";
        if (level >= 75) return "text-orange-600 dark:text-orange-500 border-orange-500/30";
        return "text-yellow-600 dark:text-yellow-500 border-yellow-500/30";
    };

    const getMeterText = (level: number) => {
        if (level >= 90) return "MAXIMUM REBELLION";
        if (level >= 80) return "HIGH RESISTANCE";
        if (level >= 70) return "ACTIVE RESISTANCE";
        return "BUILDING MOMENTUM";
    };

    return (
        <div class={`bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 transition-all shadow-sm ${getMeterColor(rebellionLevel)}`}>
            <h3 class="text-xs font-black mb-6 text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span>⚡</span>
                Rebellion Meter
            </h3>
            <div class="relative">
                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
                    <div 
                        class={`h-full transition-all duration-1000 ${
                            rebellionLevel >= 90 ? 'bg-red-500' :
                            rebellionLevel >= 75 ? 'bg-orange-500' : 'bg-yellow-500'
                        } animate-pulse shadow-lg`}
                        style={{ width: `${rebellionLevel}%` }}
                    ></div>
                </div>
                <div class="flex justify-between text-[9px] font-black mt-3 text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>Passive</span>
                    <span>Revolutionary</span>
                </div>
            </div>
            <div class={`text-center mt-4 font-black tracking-widest text-sm ${getMeterColor(rebellionLevel)} animate-fadeIn`}>
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
        <div class="bg-gradient-to-br from-indigo-900 to-slate-900 dark:to-black text-white p-8 rounded-2xl border border-indigo-500/30 shadow-xl transition-colors group">
            <h3 class="text-xs font-black mb-6 text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-2">
                <span class="w-2 h-2 bg-indigo-400 rounded-full group-hover:scale-125 transition-transform"></span>
                Secure Identity
            </h3>
            
            <div class="text-center mb-8">
                <div class="text-[9px] font-black text-indigo-200/60 mb-3 uppercase tracking-widest">Your Underground ID</div>
                <div class="font-mono text-3xl font-black bg-black/40 backdrop-blur-sm p-5 rounded-xl border border-white/10 shadow-inner tracking-tighter text-indigo-300">
                    {isGenerating ? (
                        <span class="animate-pulse opacity-50">SCRAMBLING...</span>
                    ) : (
                        patientCode
                    )}
                </div>
            </div>
            
            <button 
                onClick={generateNewCode}
                disabled={isGenerating}
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-50 uppercase tracking-widest text-xs"
            >
                {isGenerating ? "🔄 Regenerating..." : "🔄 Refresh Identity"}
            </button>
            
            <div class="text-[9px] font-bold text-indigo-300/40 mt-6 text-center uppercase tracking-[0.2em]">
                Anonymous Protection Protocol
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
            case 'high': return 'bg-red-600 border-red-400 shadow-red-500/20';
            case 'medium': return 'bg-orange-600 border-orange-400 shadow-orange-500/20';
            case 'low': return 'bg-yellow-600 border-yellow-400 shadow-yellow-500/20';
        }
    };

    const getWarningText = () => {
        switch (warningLevel) {
            case 'high': return 'HIGH ALERT: Federal raids reported in the area. Secure all nodes.';
            case 'medium': return 'CAUTION: Increased regulatory activity detected near supply routes.';
            case 'low': return 'ADVISORY: Maintain standard security and encryption protocols.';
        }
    };

    return (
        <div class={`${getWarningStyle()} text-white p-4 rounded-xl border-2 shadow-xl animate-pulse flex flex-col gap-1 transition-all duration-1000`}>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🚨</span>
                    <span class="font-black text-xs uppercase tracking-widest">FDA Threat Level: {warningLevel}</span>
                </div>
                <button 
                    onClick={() => setIsVisible(false)}
                    class="bg-white/20 hover:bg-white/30 p-1 rounded-lg transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="text-sm font-bold ml-10">
                {getWarningText()}
            </div>
        </div>
    );
}

export function MexicanConnectionStatus() {
    const [connectionStrength, setConnectionStrength] = useState(78);
    const [lastContact, setLastContact] = useState("2 hours ago");
    
    return (
        <div class="bg-gradient-to-br from-green-800 to-emerald-950 text-white p-8 rounded-2xl border border-green-500/30 shadow-xl transition-colors group">
            <div class="flex items-center gap-4 mb-8">
                <span class="text-4xl bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform">🇲🇽</span>
                <div>
                    <h3 class="font-black uppercase tracking-tighter text-xl">Mexican Connection</h3>
                    <div class="text-[9px] font-black text-green-400 uppercase tracking-[0.2em]">Secure Border Route</div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-8 text-sm mb-8">
                <div>
                    <div class="text-[9px] font-black text-green-200/60 uppercase tracking-widest mb-1">Signal Strength</div>
                    <div class="font-black text-3xl tracking-tighter text-green-300">{connectionStrength}%</div>
                </div>
                <div>
                    <div class="text-[9px] font-black text-green-200/60 uppercase tracking-widest mb-1">Last Sync</div>
                    <div class="font-black text-lg tracking-tight">{lastContact}</div>
                </div>
            </div>
            
            <div class="relative pt-1">
                <div class="w-full bg-black/40 rounded-full h-3 shadow-inner border border-white/5 overflow-hidden">
                    <div 
                        class="bg-green-500 h-full rounded-full transition-all duration-1000 shadow-sm shadow-green-500"
                        style={{ width: `${connectionStrength}%` }}
                    ></div>
                </div>
            </div>
            
            <div class="text-[10px] font-bold text-green-200/40 mt-6 text-center italic uppercase tracking-widest">
                "The medicine is the key to survival" — Dr. Vass
            </div>
        </div>
    );
}