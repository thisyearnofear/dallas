import { useState, useEffect } from "preact/hooks";

interface PopupAd {
    id: string;
    type: 'mexpharm' | 'freetrials' | 'winnernotif' | 'adnetwork' | 'newsletter';
    title: string;
    content: string;
    buttonText: string;
    entityName: string;
    bgStyle: string;
    titleBarStyle: string;
    urgent?: boolean;
    blink?: boolean;
}

const popupAds: PopupAd[] = [
    {
        id: '1',
        type: 'mexpharm',
        entityName: 'MexicanPharmNet',
        title: 'PEPTIDE T AVAILABLE!',
        content: 'Direct from Dr. Vass laboratory. FDA can\'t touch us here! 48hr shipping to US.',
        buttonText: 'ORDER SECURELY',
        bgStyle: 'bg-green-200',
        titleBarStyle: 'bg-green-700',
        urgent: false
    },
    {
        id: '2', 
        type: 'freetrials',
        entityName: 'FreeTrialsUnlimited.net',
        title: 'FREE CD-ROM: Alternative Medicine Secrets!',
        content: 'Learn what Big Pharma doesn\'t want you to know! 500+ natural cures on CD. Only pay $4.95 S&H.',
        buttonText: 'CLAIM FREE CD!',
        bgStyle: 'bg-blue-200',
        titleBarStyle: 'bg-blue-800',
        urgent: true,
        blink: true
    },
    {
        id: '3',
        type: 'winnernotif',
        entityName: 'WinnerNotification System',
        title: 'YOU\'VE WON $500 CASH!',
        content: 'Visitor #420 from your location has won! Click to claim before someone else does!',
        buttonText: 'CLAIM PRIZE!',
        bgStyle: 'bg-yellow-200',
        titleBarStyle: 'bg-orange-600',
        urgent: true,
        blink: true
    },
    {
        id: '4',
        type: 'adnetwork',
        entityName: 'MedAdNetwork',
        title: 'Doctors Hate This One Trick!',
        content: 'Local man discovers simple method FDA tried to ban. Pharmaceutical companies are FURIOUS!',
        buttonText: 'LEARN SECRET',
        bgStyle: 'bg-red-200',
        titleBarStyle: 'bg-red-700',
        urgent: false
    },
    {
        id: '5',
        type: 'newsletter',
        entityName: 'Underground Health Network',
        title: 'NEW TREATMENT DISCOVERED!',
        content: 'European researchers found miracle compound! Big Pharma trying to suppress this breakthrough. Get the inside story now!',
        buttonText: 'READ MORE',
        bgStyle: 'bg-purple-200',
        titleBarStyle: 'bg-purple-700',
        urgent: true,
        blink: true
    }
];

export function Authentic90sPopups() {
    const [activePopups, setActivePopups] = useState<PopupAd[]>([]);
    const [positions, setPositions] = useState<{[key: string]: {x: number, y: number}}>({});

    useEffect(() => {
        const showRandomPopup = () => {
            if (activePopups.length === 0) { // Only show if no popups are active
                const randomPopup = popupAds[Math.floor(Math.random() * popupAds.length)];
                
                // Random position
                const x = Math.random() * (window.innerWidth - 400);
                const y = Math.random() * (window.innerHeight - 300);
                
                setPositions(prev => ({
                    ...prev,
                    [randomPopup.id]: { x, y }
                }));
                
                setActivePopups([randomPopup]); // Only one popup at a time
            }
        };

        // Very infrequent - every 3-5 minutes
        const interval = setInterval(() => {
            if (Math.random() > 0.8) { // 20% chance
                showRandomPopup();
            }
        }, Math.random() * 120000 + 180000); // 3-5 minutes

        // Show initial popup after 45 seconds
        const initialTimer = setTimeout(showRandomPopup, 45000);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimer);
        };
    }, [activePopups.length]);

    const closePopup = (popupId: string) => {
        setActivePopups(prev => prev.filter(p => p.id !== popupId));
        setPositions(prev => {
            const newPos = { ...prev };
            delete newPos[popupId];
            return newPos;
        });
    };

    const getPopupStyle = (popup: PopupAd) => {
        const pos = positions[popup.id] || { x: 100, y: 100 };
        
        let bgColor = 'bg-yellow-300';
        let borderColor = 'border-red-600';
        
        switch (popup.type) {
            case 'alert':
                bgColor = 'bg-red-500';
                borderColor = 'border-yellow-400';
                break;
            case 'membership':
                bgColor = 'bg-blue-400';
                borderColor = 'border-white';
                break;
            case 'promotion':
                bgColor = 'bg-yellow-300';
                borderColor = 'border-red-600';
                break;
        }

        return {
            position: 'fixed' as const,
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            zIndex: 9999,
            backgroundColor: bgColor.includes('yellow') ? '#fef08a' : 
                           bgColor.includes('red') ? '#ef4444' : '#60a5fa',
            animation: popup.urgent ? 'bounce 0.5s infinite alternate' : 'none'
        };
    };

    return (
        <>
            {activePopups.map((popup, index) => (
                <div
                    key={popup.id}
                    style={getPopupStyle(popup)}
                    class={`
                        w-80 border-4 border-black shadow-2xl font-mono
                        ${popup.blink ? 'animate-pulse' : ''}
                    `}
                >
                    {/* Title Bar - 90s Style */}
                    <div class="bg-blue-800 text-white px-2 py-1 flex justify-between items-center border-b-2 border-black">
                        <div class="flex items-center gap-1">
                            <div class="w-3 h-3 bg-gray-400 border border-black"></div>
                            <span class="font-bold text-xs">DALLAS BUYERS CLUB</span>
                        </div>
                        <button 
                            onClick={() => closePopup(popup.id)}
                            class="bg-red-600 hover:bg-red-700 text-white font-bold px-1 text-xs border border-black"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div class="p-3">
                        {/* Blinking Title */}
                        <div class={`text-center font-bold text-sm mb-2 text-black ${popup.blink ? 'animate-pulse' : ''}`}>
                            {popup.title}
                        </div>

                        {/* Content Text */}
                        <div class="text-xs text-black mb-3 leading-tight">
                            {popup.content}
                        </div>

                        {/* Action Buttons */}
                        <div class="flex gap-1">
                            <button 
                                class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 text-xs border-2 border-black"
                                onClick={() => closePopup(popup.id)}
                            >
                                {popup.buttonText}
                            </button>
                            <button 
                                onClick={() => closePopup(popup.id)}
                                class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-2 text-xs border-2 border-black"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Fake progress bar or timer */}
                        {popup.urgent && (
                            <div class="mt-2">
                                <div class="bg-gray-300 border border-black h-2">
                                    <div class="bg-red-600 h-full animate-pulse" style={{width: '60%'}}></div>
                                </div>
                                <div class="text-center text-xs font-bold text-black mt-1">
                                    OFFER EXPIRES IN 4:27!
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom advertising bar */}
                    <div class="bg-red-600 text-white text-center py-1 text-xs font-bold border-t-2 border-black">
                        {popup.type === 'mexpharm' ? '🇲🇽 DIRECT FROM MEXICO 🇲🇽' : 
                         popup.type === 'freetrials' ? '★ GEOCITIES AWARD WINNER ★' :
                         popup.type === 'winnernotif' ? '⏰ LIMITED TIME ONLY ⏰' :
                         popup.type === 'adnetwork' ? '📢 DOCTORS HATE HIM 📢' :
                         popup.type === 'newsletter' ? '📧 INSIDER HEALTH NEWS 📧' :
                         '📢 LIVE UPDATES 📢'}
                    </div>
                </div>
            ))}

            {/* Authentic 90s CSS animations */}
            <style jsx>{`
                @keyframes bounce {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.05); }
                }
                
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.3; }
                }
                
                .animate-blink {
                    animation: blink 1s infinite;
                }
            `}</style>
        </>
    );
}

// Live activity notifications that appear more prominently
export function LiveActivityNotifications() {
    const [currentNotification, setCurrentNotification] = useState<string | null>(null);
    
    const activities = [
        "🚨 Patient #420 just ordered AZT from Mexico!",
        "📍 New member joined from Austin, TX - 5 min ago",
        "⭐ Success story shared: 'Ron saved my life!'", 
        "💊 High demand: 23 orders today!",
        "🎉 Milestone: 420 total members reached!",
        "🇲🇽 Mexican shipment arriving tonight!",
        "⚠️ FDA raid avoided in Houston!",
        "🤝 3 new referrals this hour!"
    ];

    useEffect(() => {
        const showNotification = () => {
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            setCurrentNotification(randomActivity);
            
            // Hide after 4 seconds
            setTimeout(() => {
                setCurrentNotification(null);
            }, 4000);
        };

        // Show notification every 12-20 seconds
        const interval = setInterval(() => {
            if (!currentNotification && Math.random() > 0.4) {
                showNotification();
            }
        }, Math.random() * 8000 + 12000);

        return () => clearInterval(interval);
    }, [currentNotification]);

    if (!currentNotification) return null;

    return (
        <div class="fixed bottom-4 right-4 z-50 animate-bounce">
            <div class="bg-yellow-300 border-4 border-red-600 p-3 max-w-sm font-mono shadow-2xl">
                <div class="bg-red-600 text-white text-center py-1 mb-2 font-bold text-xs">
                    ⚡ LIVE UPDATE ⚡
                </div>
                <div class="text-xs text-black font-semibold">
                    {currentNotification}
                </div>
                <div class="mt-2 text-center">
                    <button 
                        onClick={() => setCurrentNotification(null)}
                        class="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs border border-black"
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
}

// Authentic 90s "You've won!" style popup
export function WinnerPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show after 25 seconds (like old websites)
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 25000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div class="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
            <div class="bg-yellow-300 border-8 border-red-600 shadow-2xl font-mono animate-bounce">
                {/* Blinking header */}
                <div class="bg-red-600 text-yellow-300 text-center py-2 font-bold text-lg animate-pulse">
                    ⭐⭐⭐ CONGRATULATIONS! ⭐⭐⭐
                </div>
                
                <div class="p-6 text-center">
                    <div class="text-2xl font-bold text-red-800 mb-4 animate-pulse">
                        YOU'RE VISITOR #420!
                    </div>
                    
                    <div class="text-sm text-black mb-4">
                        You've been selected for EXCLUSIVE access to our underground treatment network!
                    </div>
                    
                    <div class="bg-white border-4 border-black p-3 mb-4">
                        <div class="font-bold text-lg text-red-600">PRIZE VALUE: $500!</div>
                        <div class="text-xs">Free consultation + priority shipping</div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 border-4 border-black flex-1">
                            CLAIM NOW!
                        </button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-3 border-4 border-black"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                
                <div class="bg-blue-800 text-white text-center py-1 text-xs font-bold animate-pulse">
                    THIS OFFER EXPIRES IN 3 MINUTES!
                </div>
            </div>
        </div>
    );
}