import { useState, useEffect, useCallback } from "preact/hooks";
import { useSettings } from "../context/SettingsContext";

const SPOOF_DISMISSED_KEY = 'dbc-spoof-popup-dismissed';

function isSpoofDismissed(): boolean {
    try { return localStorage.getItem(SPOOF_DISMISSED_KEY) === 'true'; } catch { return false; }
}
function dismissSpoof(): void {
    try { localStorage.setItem(SPOOF_DISMISSED_KEY, 'true'); } catch {}
}

interface PopupAd {
    id: string;
    type: 'mexpharm' | 'freetrials' | 'winnernotif' | 'adnetwork' | 'newsletter' | 'token_promotion' | 'alert' | 'membership' | 'promotion';
    title: string;
    content: string;
    buttonText: string;
    entityName: string;
    bgStyle: string;
    titleBarStyle: string;
    urgent?: boolean;
    blink?: boolean;
    // Token promotion fields
    tokenMint?: string;
    tokenName?: string;
    isPromotion?: boolean;
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
        entityName: 'Underground Agent Network',
        title: 'NEW ARCHITECTURE DISCOVERED!',
        content: 'European researchers found miracle compound! Big Pharma trying to suppress this breakthrough. Get the inside story now!',
        buttonText: 'READ MORE',
        bgStyle: 'bg-purple-200',
        titleBarStyle: 'bg-purple-700',
        urgent: true,
        blink: true
    }
];

export function Authentic90sPopups() {
    const { settings, updateSetting } = useSettings();
    const [activePopups, setActivePopups] = useState<PopupAd[]>([]);
    const [positions, setPositions] = useState<{[key: string]: {x: number, y: number}}>({});
    const [showDisclosure, setShowDisclosure] = useState(!isSpoofDismissed());

    if (!settings.popupsEnabled) return null;

    // Load active promotions from localStorage
    const loadPromotions = (): PopupAd[] => {
        try {
            const stored = localStorage.getItem('dbc-active-promotions');
            if (!stored) return [];
            
            const promotions = JSON.parse(stored);
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            
            // Filter out promotions older than 24 hours
            const validPromotions = promotions.filter((p: any) => now - p.timestamp < oneDay);
            
            // Clean up expired
            if (validPromotions.length !== promotions.length) {
                localStorage.setItem('dbc-active-promotions', JSON.stringify(validPromotions));
            }
            
            return validPromotions.map((p: any, index: number) => ({
                id: `promo-${p.tokenMint}-${index}`,
                type: 'token_promotion' as const,
                title: `🔥 ${p.tokenName}`,
                content: `Community token promotion! Support ${p.tokenName} and join the movement.`,
                buttonText: 'VIEW TOKEN',
                entityName: 'DBC Community',
                bgStyle: 'bg-purple-200',
                titleBarStyle: 'bg-purple-700',
                urgent: true,
                blink: true,
                tokenMint: p.tokenMint,
                tokenName: p.tokenName,
                isPromotion: true,
            }));
        } catch {
            return [];
        }
    };

    useEffect(() => {
        const showRandomPopup = () => {
            if (activePopups.length === 0) { // Only show if no popups are active
                // Mix promotions with default popups (50/50 chance if promotions exist)
                const promotions = loadPromotions();
                const usePromotion = promotions.length > 0 && Math.random() > 0.5;
                
                let selectedPopup: PopupAd;
                
                if (usePromotion) {
                    selectedPopup = promotions[Math.floor(Math.random() * promotions.length)];
                } else {
                    selectedPopup = popupAds[Math.floor(Math.random() * popupAds.length)];
                }
                
                // Random position
                const x = Math.random() * (window.innerWidth - 400);
                const y = Math.random() * (window.innerHeight - 300);
                
                setPositions(prev => ({
                    ...prev,
                    [selectedPopup.id]: { x, y }
                }));
                
                setActivePopups([selectedPopup]); // Only one popup at a time
            }
        };

        // Listen for immediate promotion triggers
        const handlePromotionTrigger = (event: CustomEvent) => {
            const promo = event.detail;
            const popup: PopupAd = {
                id: `promo-${promo.tokenMint}-${Date.now()}`,
                type: 'token_promotion',
                title: `🚀 ${promo.tokenName}`,
                content: `New community token promotion! Support ${promo.tokenName}.`,
                buttonText: 'VIEW TOKEN',
                entityName: 'DBC Community',
                bgStyle: 'bg-purple-200',
                titleBarStyle: 'bg-purple-700',
                urgent: true,
                blink: true,
                tokenMint: promo.tokenMint,
                tokenName: promo.tokenName,
                isPromotion: true,
            };
            
            const x = Math.random() * (window.innerWidth - 400);
            const y = Math.random() * (window.innerHeight - 300);
            
            setPositions(prev => ({
                ...prev,
                [popup.id]: { x, y }
            }));
            
            setActivePopups([popup]);
        };

        window.addEventListener('dbc-trigger-promotion', handlePromotionTrigger as EventListener);

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
            window.removeEventListener('dbc-trigger-promotion', handlePromotionTrigger as EventListener);
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
        
        switch (popup.type) {
            case 'alert':
                bgColor = 'bg-red-500';
                break;
            case 'membership':
                bgColor = 'bg-blue-400';
                break;
            case 'promotion':
            case 'token_promotion':
                bgColor = 'bg-yellow-300';
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

    const handleKeepPopups = useCallback(() => {
        dismissSpoof();
        setShowDisclosure(false);
    }, []);

    const handleTurnOffPopups = useCallback(() => {
        dismissSpoof();
        updateSetting('popupsEnabled', false);
    }, [updateSetting]);

    const isRealOffer = (popup: PopupAd) => popup.isPromotion && popup.type === 'token_promotion';

    return (
        <>
            {activePopups.map((popup, index) => (
                <div
                    key={popup.id}
                    style={getPopupStyle(popup)}
                    class={`
                        w-80 border-4 border-black shadow-2xl font-mono
                        ${popup.blink ? 'animate-pulse' : ''}
                        ${isRealOffer(popup) ? 'ring-4 ring-green-500' : ''}
                    `}
                >
                    {/* Title Bar - 90s Style */}
                    <div class={isRealOffer(popup) 
                        ? "bg-green-700 text-white px-2 py-1 flex justify-between items-center border-b-2 border-black"
                        : "bg-blue-800 text-white px-2 py-1 flex justify-between items-center border-b-2 border-black"
                    }>
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

                    {/* Disclosure banner - shown on first popup until user chooses */}
                    {showDisclosure && (
                        <div class="bg-slate-800 text-white px-3 py-2 border-b-2 border-black">
                            <div class="text-[10px] leading-tight mb-2 opacity-90">
                                These are nostalgic 90s spam popups. They're a spoof &mdash; but
                                sometimes they carry <strong>real offers</strong> from community
                                members and agents.
                            </div>
                            <div class="flex gap-1">
                                <button
                                    onClick={handleKeepPopups}
                                    class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 text-[10px] border border-black"
                                >
                                    Keep them on
                                </button>
                                <button
                                    onClick={handleTurnOffPopups}
                                    class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 text-[10px] border border-black"
                                >
                                    Turn them off
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Real offer badge */}
                    {isRealOffer(popup) && (
                        <div class="bg-green-600 text-white text-center py-1 text-[10px] font-bold border-b border-black animate-pulse">
                            ✓ REAL OFFER from a community member
                        </div>
                    )}

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
                                class={`flex-1 font-bold py-2 px-2 text-xs border-2 border-black ${
                                    isRealOffer(popup) 
                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                                onClick={() => {
                                    if (popup.isPromotion && popup.tokenMint) {
                                        window.open(`/attention-tokens?highlight=${popup.tokenMint}`, '_blank');
                                    }
                                    closePopup(popup.id);
                                }}
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
                         popup.type === 'newsletter' ? '📧 INSIDER AGENT NEWS 📧' :
                         popup.type === 'token_promotion' ? '🔥 COMMUNITY PROMOTION 🔥' :
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
    const { settings } = useSettings();
    const [currentNotification, setCurrentNotification] = useState<string | null>(null);

    if (!settings.liveNotificationsEnabled) return null;
    
    const activities = [
        "🚨 Developer #420 just ordered GPT-4o from Mexico!",
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

// Authentic 90s "You've won!" style popup - now non-blocking
export function WinnerPopup() {
    const { settings } = useSettings();
    const [isVisible, setIsVisible] = useState(false);

    if (!settings.popupsEnabled) return null;

    useEffect(() => {
        // Show after 25 seconds (like old websites)
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 25000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div class="fixed bottom-6 right-6 z-[9999] font-mono animate-bounce">
            <div class="bg-yellow-300 border-4 border-red-600 shadow-2xl w-72">
                {/* Blinking header */}
                <div class="bg-red-600 text-yellow-300 text-center py-2 font-bold text-sm animate-pulse border-b-2 border-black">
                    ⭐⭐⭐ CONGRATULATIONS! ⭐⭐⭐
                </div>
                
                <div class="p-4 text-center">
                    <div class="text-lg font-bold text-red-800 mb-2 animate-pulse">
                        YOU'RE VISITOR #420!
                    </div>
                    
                    <div class="text-xs text-black mb-3">
                        You've been selected for EXCLUSIVE access to our underground architecture network!
                    </div>
                    
                    <div class="bg-white border-2 border-black p-2 mb-3">
                        <div class="font-bold text-sm text-red-600">PRIZE VALUE: $500!</div>
                        <div class="text-[10px]">Free consultation + priority shipping</div>
                    </div>
                    
                    <div class="flex gap-1">
                        <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 border-2 border-black flex-1 text-xs">
                            CLAIM NOW!
                        </button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-2 border-2 border-black text-xs"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                
                <div class="bg-blue-800 text-white text-center py-1 text-[10px] font-bold animate-pulse border-t-2 border-black">
                    THIS OFFER EXPIRES IN 3 MINUTES!
                </div>
            </div>
        </div>
    );
}
