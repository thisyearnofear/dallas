import { useState, useEffect } from "preact/hooks";

interface RonDialogue {
    id: string;
    text: string;
    emotion: 'angry' | 'determined' | 'sarcastic' | 'compassionate' | 'defiant';
    responseOptions?: Array<{
        text: string;
        nextDialogue?: string;
        action?: () => void;
    }>;
}

const ronDialogues: { [key: string]: RonDialogue } = {
    intro: {
        id: 'intro',
        text: "Well, well... another soul the system's failed. Welcome to the real world, partner. I'm Ron Woodroof, and this here's the Dallas Buyers Club. We don't play by their rules.",
        emotion: 'defiant',
        responseOptions: [
            { text: "I need help finding treatments", nextDialogue: 'treatments' },
            { text: "Tell me about the club", nextDialogue: 'club' },
            { text: "How do I join the fight?", nextDialogue: 'fight' }
        ]
    },
    treatments: {
        id: 'treatments',
        text: "Treatments? Ha! The FDA wants you to believe AZT is your only hope. Bullshit. I've got Peptide T, DDC, compounds they won't even test because there's no money in it for Big Pharma.",
        emotion: 'angry',
        responseOptions: [
            { text: "What's Peptide T?", nextDialogue: 'peptide' },
            { text: "How do I know it's safe?", nextDialogue: 'safety' },
            { text: "I want to try something", nextDialogue: 'order' }
        ]
    },
    club: {
        id: 'club',
        text: "This club? It ain't about selling drugs. It's about giving people hope when the system has written them off. We're a membership club - you pay dues, you get access to treatments that might just save your damn life.",
        emotion: 'compassionate',
        responseOptions: [
            { text: "How much are dues?", nextDialogue: 'dues' },
            { text: "Is this legal?", nextDialogue: 'legal' },
            { text: "I want to become a member", nextDialogue: 'membership' }
        ]
    },
    fight: {
        id: 'fight',
        text: "The fight? Every day I wake up is another day I'm spitting in the face of every doctor who said I'd be dead by now. You want to fight? Then live. Live in spite of what they tell you.",
        emotion: 'determined',
        responseOptions: [
            { text: "I'm ready to fight", nextDialogue: 'ready' },
            { text: "I'm scared", nextDialogue: 'scared' },
            { text: "What's your story?", nextDialogue: 'story' }
        ]
    },
    peptide: {
        id: 'peptide',
        text: "Peptide T? It's a synthetic protein that might help with cognitive function. The FDA won't approve it, but I've seen it work. Dr. Vass down in Mexico swears by it.",
        emotion: 'sarcastic',
        responseOptions: [
            { text: "Where do you get it?", nextDialogue: 'mexico' },
            { text: "How much does it cost?", nextDialogue: 'cost' },
            { text: "I'll take some", nextDialogue: 'order' }
        ]
    },
    safety: {
        id: 'safety',
        text: "Safe? Nothing's safe when you're dying. AZT will kill you faster than AIDS. At least with my stuff, you got a fighting chance. I test everything - got my own lab setup.",
        emotion: 'defiant',
        responseOptions: [
            { text: "Show me the lab results", nextDialogue: 'results' },
            { text: "I trust you", nextDialogue: 'trust' },
            { text: "This seems risky", nextDialogue: 'risk' }
        ]
    }
};

export function RonsOfficeExperience() {
    const [currentDialogue, setCurrentDialogue] = useState<RonDialogue>(ronDialogues.intro);
    const [isTyping, setIsTyping] = useState(true);
    const [displayText, setDisplayText] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [visitCount, setVisitCount] = useState(1);

    // Typewriter effect for Ron's dialogue
    useEffect(() => {
        setDisplayText("");
        setIsTyping(true);
        setShowOptions(false);
        
        let i = 0;
        const typeWriter = () => {
            if (i < currentDialogue.text.length) {
                setDisplayText(currentDialogue.text.slice(0, i + 1));
                i++;
                setTimeout(typeWriter, 30 + Math.random() * 20);
            } else {
                setIsTyping(false);
                setTimeout(() => setShowOptions(true), 500);
            }
        };
        
        setTimeout(typeWriter, 500);
    }, [currentDialogue]);

    const handleResponse = (response: any) => {
        if (response.nextDialogue) {
            setCurrentDialogue(ronDialogues[response.nextDialogue]);
        }
        if (response.action) {
            response.action();
        }
    };

    const getRonEmotion = (emotion: RonDialogue['emotion']) => {
        switch (emotion) {
            case 'angry': return "😡";
            case 'determined': return "💪";
            case 'sarcastic': return "😏";
            case 'compassionate': return "😌";
            case 'defiant': return "🤨";
        }
    };

    const getOfficeAmbience = () => {
        return (
            <div class="absolute inset-0 opacity-10 pointer-events-none">
                <div class="absolute top-4 left-4 text-6xl">📋</div>
                <div class="absolute top-6 right-8 text-4xl">💊</div>
                <div class="absolute bottom-8 left-6 text-5xl">📞</div>
                <div class="absolute bottom-4 right-4 text-4xl">🧪</div>
                <div class="absolute top-1/2 left-1/4 text-3xl">📦</div>
                <div class="absolute top-1/3 right-1/3 text-3xl">💰</div>
            </div>
        );
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 text-white relative overflow-hidden">
            {getOfficeAmbience()}
            
            {/* Office Header */}
            <div class="relative z-10 p-6 border-b border-orange-700/50">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-orange-200">Ron Woodroof's Office</h1>
                        <p class="text-orange-300 text-sm">Dallas Buyers Club Headquarters</p>
                    </div>
                    <div class="text-right">
                        <div class="text-orange-200 text-sm">Visit #{visitCount}</div>
                        <div class="text-orange-400 text-xs">Est. 1985</div>
                    </div>
                </div>
            </div>

            <div class="relative z-10 flex flex-col lg:flex-row h-full min-h-[600px]">
                {/* Ron's Character */}
                <div class="lg:w-1/3 p-6 border-r border-orange-700/50 bg-black/20">
                    <div class="text-center mb-6">
                        <div class="text-8xl mb-4">🤠</div>
                        <h2 class="text-2xl font-bold text-orange-200">Ron Woodroof</h2>
                        <div class="text-orange-400 text-sm">Founder & Chief Rebel</div>
                        <div class="text-xs text-orange-500 mt-2">
                            Day {Math.floor((Date.now() - new Date('1985-01-01').getTime()) / (1000 * 60 * 60 * 24))} of survival
                        </div>
                    </div>
                    
                    {/* Current Emotion */}
                    <div class="bg-black/40 p-4 rounded-lg border border-orange-600/30">
                        <div class="text-center">
                            <div class="text-4xl mb-2">{getRonEmotion(currentDialogue.emotion)}</div>
                            <div class="text-sm text-orange-300 capitalize">{currentDialogue.emotion}</div>
                        </div>
                    </div>

                    {/* Office Stats */}
                    <div class="mt-6 space-y-3">
                        <div class="bg-orange-900/30 p-3 rounded border border-orange-600/20">
                            <div class="text-sm text-orange-300">Lives Saved:</div>
                            <div class="text-xl font-bold">847+</div>
                        </div>
                        <div class="bg-orange-900/30 p-3 rounded border border-orange-600/20">
                            <div class="text-sm text-orange-300">FDA Raids Survived:</div>
                            <div class="text-xl font-bold">23</div>
                        </div>
                        <div class="bg-orange-900/30 p-3 rounded border border-orange-600/20">
                            <div class="text-sm text-orange-300">Days Past Prognosis:</div>
                            <div class="text-xl font-bold">2,847</div>
                        </div>
                    </div>
                </div>

                {/* Conversation Area */}
                <div class="lg:w-2/3 p-6 flex flex-col">
                    {/* Dialogue Box */}
                    <div class="flex-1 mb-6">
                        <div class="bg-black/40 p-6 rounded-lg border border-orange-600/50 min-h-[200px]">
                            <div class="flex items-start gap-4">
                                <div class="text-2xl">💬</div>
                                <div class="flex-1">
                                    <div class="text-orange-200 text-lg leading-relaxed">
                                        {displayText}
                                        {isTyping && (
                                            <span class="animate-pulse text-orange-400">█</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Response Options */}
                    {showOptions && currentDialogue.responseOptions && (
                        <div class="space-y-3">
                            <div class="text-orange-300 text-sm font-semibold mb-3">Your Response:</div>
                            {currentDialogue.responseOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleResponse(option)}
                                    class="w-full text-left bg-orange-800/30 hover:bg-orange-700/40 p-4 rounded-lg border border-orange-600/30 transition-all duration-300 hover:border-orange-500 group"
                                >
                                    <div class="flex items-center gap-3">
                                        <span class="text-orange-400 group-hover:text-orange-300">→</span>
                                        <span class="text-orange-200 group-hover:text-white">{option.text}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Office Actions */}
                    <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button class="bg-red-800/50 hover:bg-red-700/50 p-3 rounded border border-red-600/30 transition-colors text-sm">
                            🚨 Emergency Help
                        </button>
                        <button class="bg-green-800/50 hover:bg-green-700/50 p-3 rounded border border-green-600/30 transition-colors text-sm">
                            💊 View Treatments
                        </button>
                        <button class="bg-blue-800/50 hover:bg-blue-700/50 p-3 rounded border border-blue-600/30 transition-colors text-sm">
                            📋 Join Club
                        </button>
                        <button class="bg-purple-800/50 hover:bg-purple-700/50 p-3 rounded border border-purple-600/30 transition-colors text-sm">
                            📞 Contact Network
                        </button>
                    </div>
                </div>
            </div>

            {/* Ambient Elements */}
            <div class="fixed bottom-4 right-4 z-20">
                <div class="bg-black/60 text-orange-300 text-xs p-2 rounded border border-orange-600/30">
                    🎵 Playing: "The Weight" by The Band
                </div>
            </div>

            <div class="fixed bottom-4 left-4 z-20">
                <div class="bg-red-900/60 text-red-200 text-xs p-2 rounded border border-red-600/30 animate-pulse">
                    ⚠️ FDA Threat Level: MEDIUM
                </div>
            </div>
        </div>
    );
}

export function MemoryWall() {
    const memories = [
        {
            id: 1,
            title: "The Diagnosis",
            date: "1985",
            image: "🩺",
            description: "30 days to live, they said. That was just the beginning.",
            emotion: "shock"
        },
        {
            id: 2,
            title: "First Trip to Mexico",
            date: "1986",
            image: "🇲🇽",
            description: "Found hope across the border when America offered none.",
            emotion: "hope"
        },
        {
            id: 3,
            title: "Club Formation",
            date: "1986",
            image: "🤝",
            description: "If they won't help us, we'll help ourselves.",
            emotion: "determination"
        },
        {
            id: 4,
            title: "First Lives Saved",
            date: "1987",
            image: "💊",
            description: "Watching others get better made every risk worth it.",
            emotion: "joy"
        },
        {
            id: 5,
            title: "FDA Battles",
            date: "1988-1991",
            image: "⚖️",
            description: "They tried to shut us down. We fought harder.",
            emotion: "defiance"
        },
        {
            id: 6,
            title: "The Legacy",
            date: "Forever",
            image: "⭐",
            description: "Every life touched, every system challenged, every hope restored.",
            emotion: "legacy"
        }
    ];

    const [selectedMemory, setSelectedMemory] = useState<any>(null);

    return (
        <div class="p-6">
            <h2 class="text-3xl font-bold mb-6 text-center text-orange-200">Ron's Memory Wall</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memories.map((memory, index) => (
                    <div 
                        key={memory.id}
                        onClick={() => setSelectedMemory(memory)}
                        class="bg-gradient-to-br from-amber-900/30 to-orange-900/30 p-4 rounded-lg border border-orange-600/30 hover:border-orange-500 cursor-pointer transition-all duration-300 hover:scale-105"
                        style={{ animationDelay: `${index * 200}ms` }}
                    >
                        <div class="text-center mb-3">
                            <div class="text-4xl mb-2">{memory.image}</div>
                            <h3 class="font-bold text-orange-200">{memory.title}</h3>
                            <div class="text-orange-400 text-sm">{memory.date}</div>
                        </div>
                        <p class="text-orange-300 text-sm text-center leading-relaxed">
                            {memory.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Memory Detail Modal */}
            {selectedMemory && (
                <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div class="bg-gradient-to-br from-amber-900 to-orange-900 p-8 rounded-lg border border-orange-500 max-w-md w-full">
                        <div class="text-center mb-6">
                            <div class="text-6xl mb-4">{selectedMemory.image}</div>
                            <h3 class="text-2xl font-bold text-orange-200 mb-2">{selectedMemory.title}</h3>
                            <div class="text-orange-400">{selectedMemory.date}</div>
                        </div>
                        
                        <p class="text-orange-300 text-center leading-relaxed mb-6">
                            {selectedMemory.description}
                        </p>
                        
                        <div class="text-center">
                            <button 
                                onClick={() => setSelectedMemory(null)}
                                class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded transition-colors"
                            >
                                Close Memory
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}