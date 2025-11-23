import { useState, useEffect } from "preact/hooks";

interface SystemEvent {
    id: string;
    type: 'fda_raid' | 'customs_seizure' | 'media_coverage' | 'legal_victory' | 'new_treatment' | 'member_rescue';
    title: string;
    description: string;
    side: 'system' | 'underground';
    impact: number; // -100 to +100
    timestamp: string;
    location?: string;
}

const systemEvents: SystemEvent[] = [
    {
        id: '1',
        type: 'fda_raid',
        title: 'FDA Raids Dallas Office',
        description: 'Federal agents confiscated treatment supplies and patient records',
        side: 'system',
        impact: -25,
        timestamp: '2 hours ago',
        location: 'Dallas, TX'
    },
    {
        id: '2',
        type: 'new_treatment',
        title: 'New Peptide T Shipment Arrives',
        description: 'Underground network successfully delivers hope to 50+ patients',
        side: 'underground',
        impact: +30,
        timestamp: '4 hours ago',
        location: 'Underground Network'
    },
    {
        id: '3',
        type: 'legal_victory',
        title: 'Court Rules in Favor of Patient Rights',
        description: 'Landmark decision protects access to experimental treatments',
        side: 'underground',
        impact: +45,
        timestamp: '1 day ago',
        location: 'Federal Court'
    },
    {
        id: '4',
        type: 'customs_seizure',
        title: 'Mexican Border Shipment Intercepted',
        description: '$2M worth of treatments confiscated at El Paso border',
        side: 'system',
        impact: -35,
        timestamp: '2 days ago',
        location: 'El Paso, TX'
    }
];

export function SystemBattleboard() {
    const [battleScore, setBattleScore] = useState(15); // Underground leading
    const [isActive, setIsActive] = useState(true);
    const [newEvent, setNewEvent] = useState<SystemEvent | null>(null);

    // Simulate real-time battle events
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.8) {
                const eventTypes: SystemEvent['type'][] = ['fda_raid', 'customs_seizure', 'legal_victory', 'new_treatment', 'member_rescue'];
                const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                
                const newEventData: SystemEvent = {
                    id: Date.now().toString(),
                    type: randomType,
                    title: getEventTitle(randomType),
                    description: getEventDescription(randomType),
                    side: ['fda_raid', 'customs_seizure'].includes(randomType) ? 'system' : 'underground',
                    impact: (Math.random() - 0.5) * 60,
                    timestamp: 'Just now',
                    location: getRandomLocation()
                };
                
                setNewEvent(newEventData);
                setBattleScore(prev => Math.max(-100, Math.min(100, prev + newEventData.impact)));
                
                setTimeout(() => setNewEvent(null), 5000);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const getEventTitle = (type: SystemEvent['type']) => {
        const titles = {
            fda_raid: 'FDA Enforcement Action',
            customs_seizure: 'Border Patrol Seizure',
            media_coverage: 'Media Exposes Truth',
            legal_victory: 'Legal Victory Achieved',
            new_treatment: 'Treatment Breakthrough',
            member_rescue: 'Patient Rescued from System'
        };
        return titles[type];
    };

    const getEventDescription = (type: SystemEvent['type']) => {
        const descriptions = {
            fda_raid: 'Federal agents target underground treatment centers',
            customs_seizure: 'Life-saving medications confiscated at border',
            media_coverage: 'Mainstream media covers patient success stories',
            legal_victory: 'Courts rule in favor of treatment access rights',
            new_treatment: 'New experimental therapy shows promising results',
            member_rescue: 'Underground network saves patient from system failure'
        };
        return descriptions[type];
    };

    const getRandomLocation = () => {
        const locations = ['Dallas, TX', 'Austin, TX', 'Houston, TX', 'El Paso, TX', 'Mexico Border', 'Federal Court', 'Underground Lab'];
        return locations[Math.floor(Math.random() * locations.length)];
    };

    const getBattleStatus = () => {
        if (battleScore > 50) return { text: "UNDERGROUND DOMINANCE", color: "text-green-400", bg: "bg-green-900/30" };
        if (battleScore > 20) return { text: "UNDERGROUND ADVANTAGE", color: "text-green-300", bg: "bg-green-800/20" };
        if (battleScore > -20) return { text: "STALEMATE", color: "text-yellow-400", bg: "bg-yellow-900/30" };
        if (battleScore > -50) return { text: "SYSTEM PRESSURE", color: "text-orange-400", bg: "bg-orange-900/30" };
        return { text: "SYSTEM OPPRESSION", color: "text-red-400", bg: "bg-red-900/30" };
    };

    const status = getBattleStatus();

    return (
        <div class="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6 rounded-lg border border-gray-600">
            {/* New Event Notification */}
            {newEvent && (
                <div class={`
                    fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
                    ${newEvent.side === 'underground' ? 'bg-green-600' : 'bg-red-600'} 
                    text-white p-4 rounded-lg shadow-lg animate-slideInRight max-w-md
                `}>
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">
                            {newEvent.side === 'underground' ? '⚡' : '🚨'}
                        </span>
                        <div>
                            <h3 class="font-bold">{newEvent.title}</h3>
                            <p class="text-sm opacity-90">{newEvent.description}</p>
                        </div>
                    </div>
                </div>
            )}

            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold mb-2 text-red-400">⚔️ SYSTEM vs UNDERGROUND</h2>
                <div class={`text-xl font-bold ${status.color} ${status.bg} p-3 rounded-lg border border-gray-600`}>
                    {status.text}
                </div>
            </div>

            {/* Battle Score Meter */}
            <div class="mb-6">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-red-400 font-bold">🏛️ SYSTEM</span>
                    <span class="text-gray-400">Battle Score: {battleScore > 0 ? '+' : ''}{battleScore}</span>
                    <span class="text-green-400 font-bold">UNDERGROUND ⚡</span>
                </div>
                
                <div class="relative w-full h-8 bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
                    <div class="absolute inset-0 flex">
                        <div class="w-1/2 bg-gradient-to-r from-red-600 to-red-500"></div>
                        <div class="w-1/2 bg-gradient-to-r from-green-500 to-green-600"></div>
                    </div>
                    
                    {/* Score Indicator */}
                    <div 
                        class="absolute top-0 bottom-0 w-1 bg-white border-2 border-yellow-400 transition-all duration-1000"
                        style={{ left: `${50 + (battleScore / 2)}%` }}
                    ></div>
                </div>
            </div>

            {/* Recent Events */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div class="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                    <h3 class="text-red-400 font-bold mb-3 text-center">🏛️ SYSTEM ACTIONS</h3>
                    <div class="space-y-2">
                        {systemEvents
                            .filter(event => event.side === 'system')
                            .slice(0, 3)
                            .map(event => (
                                <div key={event.id} class="bg-black/30 p-3 rounded border border-red-600/20">
                                    <div class="text-sm font-semibold text-red-300">{event.title}</div>
                                    <div class="text-xs text-red-200 opacity-75">{event.timestamp} • {event.location}</div>
                                </div>
                            ))}
                    </div>
                </div>

                <div class="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                    <h3 class="text-green-400 font-bold mb-3 text-center">⚡ UNDERGROUND WINS</h3>
                    <div class="space-y-2">
                        {systemEvents
                            .filter(event => event.side === 'underground')
                            .slice(0, 3)
                            .map(event => (
                                <div key={event.id} class="bg-black/30 p-3 rounded border border-green-600/20">
                                    <div class="text-sm font-semibold text-green-300">{event.title}</div>
                                    <div class="text-xs text-green-200 opacity-75">{event.timestamp} • {event.location}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* War Stats */}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div class="bg-black/40 p-3 rounded border border-gray-600">
                    <div class="text-xl font-bold text-yellow-400">2,847</div>
                    <div class="text-xs text-gray-400">Days of Resistance</div>
                </div>
                <div class="bg-black/40 p-3 rounded border border-gray-600">
                    <div class="text-xl font-bold text-green-400">847+</div>
                    <div class="text-xs text-gray-400">Lives Saved</div>
                </div>
                <div class="bg-black/40 p-3 rounded border border-gray-600">
                    <div class="text-xl font-bold text-red-400">127</div>
                    <div class="text-xs text-gray-400">FDA Raids</div>
                </div>
                <div class="bg-black/40 p-3 rounded border border-gray-600">
                    <div class="text-xl font-bold text-blue-400">23</div>
                    <div class="text-xs text-gray-400">Legal Victories</div>
                </div>
            </div>

            {/* Call to Action */}
            <div class="mt-6 text-center">
                <button class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105">
                    ⚡ JOIN THE UNDERGROUND
                </button>
                <div class="text-xs text-gray-400 mt-2">
                    "The system is rigged. We fight back."
                </div>
            </div>
        </div>
    );
}

export function PropagandaPosters() {
    const posters = [
        {
            id: 1,
            title: "FIGHT THE SYSTEM",
            subtitle: "Your life depends on it",
            mainText: "DON'T LET THEM DECIDE YOUR FATE",
            bgColor: "from-red-600 to-red-800",
            textColor: "text-white",
            accent: "text-yellow-300"
        },
        {
            id: 2,
            title: "UNDERGROUND NETWORK",
            subtitle: "Hope when there is none",
            mainText: "WE DELIVER WHAT THEY WON'T",
            bgColor: "from-green-600 to-emerald-800",
            textColor: "text-white",
            accent: "text-green-200"
        },
        {
            id: 3,
            title: "BREAK THE CHAINS",
            subtitle: "Medical freedom now",
            mainText: "YOUR BODY, YOUR CHOICE",
            bgColor: "from-purple-600 to-indigo-800",
            textColor: "text-white",
            accent: "text-purple-200"
        },
        {
            id: 4,
            title: "REMEMBER RON",
            subtitle: "30 days became forever",
            mainText: "ONE MAN'S REBELLION SAVED HUNDREDS",
            bgColor: "from-orange-600 to-red-700",
            textColor: "text-white",
            accent: "text-orange-200"
        }
    ];

    const [selectedPoster, setSelectedPoster] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSelectedPoster(prev => (prev + 1) % posters.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div class="relative">
            <h2 class="text-2xl font-bold mb-6 text-center text-white">🏴 UNDERGROUND PROPAGANDA</h2>
            
            <div class="relative h-96 overflow-hidden rounded-lg border-4 border-gray-600">
                {posters.map((poster, index) => (
                    <div 
                        key={poster.id}
                        class={`
                            absolute inset-0 bg-gradient-to-br ${poster.bgColor} 
                            flex flex-col items-center justify-center text-center p-8
                            transition-all duration-1000 transform
                            ${selectedPoster === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
                        `}
                    >
                        <div class="space-y-6">
                            <div class={`text-6xl font-black ${poster.textColor} tracking-wider leading-tight`}>
                                {poster.title}
                            </div>
                            
                            <div class={`text-xl ${poster.accent} font-semibold`}>
                                {poster.subtitle}
                            </div>
                            
                            <div class="border-t-4 border-b-4 border-white py-4">
                                <div class={`text-2xl font-bold ${poster.textColor} tracking-wide`}>
                                    {poster.mainText}
                                </div>
                            </div>
                            
                            <div class={`text-lg ${poster.accent}`}>
                                DALLAS BUYERS CLUB • EST. 1985
                            </div>
                        </div>
                        
                        {/* Vintage effect overlay */}
                        <div class="absolute inset-0 bg-black/10 pointer-events-none"></div>
                        <div class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none"></div>
                    </div>
                ))}
            </div>
            
            {/* Poster Navigation */}
            <div class="flex justify-center mt-4 space-x-2">
                {posters.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedPoster(index)}
                        class={`
                            w-3 h-3 rounded-full transition-all duration-300
                            ${selectedPoster === index ? 'bg-white' : 'bg-gray-500 hover:bg-gray-400'}
                        `}
                    />
                ))}
            </div>
        </div>
    );
}

export function ResistanceQuotes() {
    const quotes = [
        {
            text: "Sometimes I feel like I'm fighting for a life I ain't got time to live.",
            author: "Ron Woodroof",
            context: "On the struggle for survival"
        },
        {
            text: "The FDA has been bought and sold more than a Thai hooker.",
            author: "Ron Woodroof", 
            context: "On regulatory corruption"
        },
        {
            text: "I ain't dying for nothing. I'm going down swinging.",
            author: "Ron Woodroof",
            context: "Defying the medical establishment"
        },
        {
            text: "Welcome to the fucking club.",
            author: "Ron Woodroof",
            context: "Welcoming new members to reality"
        },
        {
            text: "I got one thing to say to you FDA cocksuckers: I'm gonna die, but I'm taking y'all motherfuckers with me.",
            author: "Ron Woodroof",
            context: "Declaration of war"
        }
    ];

    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote(prev => (prev + 1) % quotes.length);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div class="bg-black/80 p-8 rounded-lg border border-orange-600/50">
            <h3 class="text-xl font-bold mb-6 text-center text-orange-400">🗣️ WORDS OF RESISTANCE</h3>
            
            <div class="relative min-h-[150px] flex items-center">
                {quotes.map((quote, index) => (
                    <div 
                        key={index}
                        class={`
                            absolute inset-0 flex flex-col justify-center transition-all duration-1000
                            ${currentQuote === index ? 'opacity-100' : 'opacity-0'}
                        `}
                    >
                        <blockquote class="text-xl font-medium text-white text-center mb-4 leading-relaxed italic">
                            "{quote.text}"
                        </blockquote>
                        
                        <div class="text-center">
                            <cite class="text-orange-400 font-semibold">— {quote.author}</cite>
                            <div class="text-orange-300 text-sm mt-1">{quote.context}</div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div class="flex justify-center mt-6 space-x-1">
                {quotes.map((_, index) => (
                    <div
                        key={index}
                        class={`
                            h-1 w-8 rounded-full transition-all duration-300
                            ${currentQuote === index ? 'bg-orange-400' : 'bg-orange-800'}
                        `}
                    />
                ))}
            </div>
        </div>
    );
}