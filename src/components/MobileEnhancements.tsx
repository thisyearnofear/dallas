import { useState, useEffect } from "preact/hooks";

interface NotificationProps {
    type: 'success' | 'warning' | 'info' | 'achievement';
    title: string;
    message: string;
    duration?: number;
}

export function useNotification() {
    const [notification, setNotification] = useState<NotificationProps | null>(null);

    const showNotification = (props: NotificationProps) => {
        setNotification(props);
        setTimeout(() => {
            setNotification(null);
        }, props.duration || 5000);
    };

    return { notification, showNotification };
}

export function NotificationToast({ notification }: { notification: NotificationProps | null }) {
    if (!notification) return null;

    const getIcon = (type: NotificationProps['type']) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            case 'achievement': return '🏆';
        }
    };

    const getColors = (type: NotificationProps['type']) => {
        switch (type) {
            case 'success': return 'from-green-500 to-green-600 text-white';
            case 'warning': return 'from-yellow-500 to-yellow-600 text-white';
            case 'info': return 'from-blue-500 to-blue-600 text-white';
            case 'achievement': return 'from-purple-500 to-purple-600 text-white';
        }
    };

    return (
        <div class={`
            fixed top-4 right-4 z-50 max-w-sm
            bg-gradient-to-r ${getColors(notification.type)}
            p-4 rounded-lg shadow-lg animate-slideInRight
        `}>
            <div class="flex items-start gap-3">
                <div class="text-2xl flex-shrink-0">{getIcon(notification.type)}</div>
                <div class="flex-grow min-w-0">
                    <h3 class="font-bold text-lg">{notification.title}</h3>
                    <p class="text-sm opacity-90">{notification.message}</p>
                </div>
            </div>
        </div>
    );
}

export function FloatingActionButton() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQuickJoin, setShowQuickJoin] = useState(false);

    const actions = [
        { icon: '🤝', label: 'Quick Join', action: () => setShowQuickJoin(true), color: 'bg-green-500 hover:bg-green-600' },
        { icon: '💬', label: 'Live Chat', action: () => {}, color: 'bg-blue-500 hover:bg-blue-600' },
        { icon: '🚨', label: 'Emergency', action: () => {}, color: 'bg-red-500 hover:bg-red-600' },
        { icon: '📱', label: 'Share', action: () => {}, color: 'bg-purple-500 hover:bg-purple-600' }
    ];

    return (
        <>
            <div class="fixed bottom-6 right-6 z-40 lg:hidden">
                {/* Action Items */}
                {isExpanded && (
                    <div class="mb-4 space-y-3">
                        {actions.map((action, index) => (
                            <div 
                                key={action.label}
                                class={`
                                    flex items-center gap-3 animate-slideInRight
                                    ${action.color} text-white px-4 py-3 rounded-full shadow-lg
                                    cursor-pointer transition-all duration-300 hover:scale-105
                                `}
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={action.action}
                            >
                                <span class="text-xl">{action.icon}</span>
                                <span class="font-medium text-sm">{action.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main FAB */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    class={`
                        w-14 h-14 bg-brand hover:bg-brand-accent text-white rounded-full shadow-lg
                        flex items-center justify-center text-2xl transition-all duration-300
                        ${isExpanded ? 'rotate-45' : 'hover:scale-110'}
                    `}
                >
                    {isExpanded ? '✕' : '💪'}
                </button>
            </div>

            {/* Quick Join Modal */}
            {showQuickJoin && (
                <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-lg p-6 w-full max-w-md animate-fadeIn">
                        <h2 class="text-2xl font-bold mb-4 text-brand">Quick Join</h2>
                        <p class="text-gray-600 mb-6">
                            Ready to join the fight? Enter your fighter name and we'll get you started.
                        </p>
                        
                        <input 
                            type="text" 
                            placeholder="Your fighter name"
                            class="w-full p-3 border border-gray-300 rounded mb-4 focus:border-brand outline-none"
                        />
                        
                        <div class="flex gap-3">
                            <button 
                                onClick={() => setShowQuickJoin(false)}
                                class="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                class="flex-1 bg-brand text-white font-bold py-3 px-4 rounded hover:bg-brand-accent transition-colors"
                            >
                                Join Now 💪
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            class="fixed bottom-24 right-6 z-30 lg:bottom-6
                   bg-brand/80 hover:bg-brand text-white
                   w-12 h-12 rounded-full shadow-lg
                   flex items-center justify-center
                   transition-all duration-300 hover:scale-110"
        >
            ⬆️
        </button>
    );
}

export function LiveCounter() {
    const [count, setCount] = useState(420);
    const [newMembers, setNewMembers] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setCount(prev => prev + 1);
                setNewMembers(prev => prev + 1);
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div class="fixed top-20 left-4 z-30 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg lg:hidden">
            <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="font-bold text-brand">{count}</span>
                <span class="text-gray-600">fighters</span>
                {newMembers > 0 && (
                    <span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce-subtle">
                        +{newMembers}
                    </span>
                )}
            </div>
        </div>
    );
}

export function ProgressTracker() {
    const [progress, setProgress] = useState({
        xp: 1250,
        level: 3,
        nextLevelXP: 1500
    });

    const progressPercent = (progress.xp / progress.nextLevelXP) * 100;

    return (
        <div class="fixed top-4 left-4 z-30 bg-gradient-to-r from-brand/90 to-brand text-white rounded-lg p-3 shadow-lg lg:hidden">
            <div class="flex items-center gap-3">
                <div class="text-center">
                    <div class="text-xl font-bold">L{progress.level}</div>
                    <div class="text-xs opacity-75">Level</div>
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between text-xs mb-1">
                        <span>{progress.xp} XP</span>
                        <span>{progress.nextLevelXP} XP</span>
                    </div>
                    <div class="w-full bg-white/20 rounded-full h-2">
                        <div 
                            class="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SwipeGestures({ children }: { children: any }) {
    const [startX, setStartX] = useState(0);
    const [currentPage, setCurrentPage] = useState('');

    useEffect(() => {
        setCurrentPage(window.location.pathname);
    }, []);

    const handleTouchStart = (e: TouchEvent) => {
        setStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;

        // Swipe left (next page)
        if (diffX > 50) {
            const pages = ['/', '/products', '/membership', '/achievements', '/referrals'];
            const currentIndex = pages.indexOf(currentPage);
            if (currentIndex < pages.length - 1) {
                window.location.href = pages[currentIndex + 1];
            }
        }
        
        // Swipe right (previous page)
        if (diffX < -50) {
            const pages = ['/', '/products', '/membership', '/achievements', '/referrals'];
            const currentIndex = pages.indexOf(currentPage);
            if (currentIndex > 0) {
                window.location.href = pages[currentIndex - 1];
            }
        }
    };

    return (
        <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            class="h-full"
        >
            {children}
        </div>
    );
}