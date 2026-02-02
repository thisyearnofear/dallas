/**
 * Mobile Enhancements - Comprehensive Mobile Optimization
 * 
 * Provides:
 * - Responsive design utilities
 * - Mobile-specific navigation
 * - Touch-friendly interfaces
 * - Offline-capable features
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Improve existing mobile experience
 * - PERFORMANT: CSS animations, minimal JS overhead
 * - MODULAR: Composable mobile components
 */

import { useState, useEffect, useCallback } from "preact/hooks";
import { FunctionalComponent } from 'preact';

// ============= Notification System =============

export interface NotificationProps {
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

export const NotificationToast: FunctionalComponent<{ notification: NotificationProps | null }> = ({ notification }) => {
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
            fixed top-4 right-4 z-50 max-w-sm mx-4
            bg-gradient-to-r ${getColors(notification.type)}
            p-4 rounded-lg shadow-lg animate-slideInRight
            touch-manipulation
        `}>
            <div class="flex items-start gap-3">
                <div class="text-2xl flex-shrink-0">{getIcon(notification.type)}</div>
                <div class="flex-grow min-w-0">
                    <h3 class="font-bold text-lg">{notification.title}</h3>
                    <p class="text-sm opacity-90">{notification.message}</p>
                </div>
                <button 
                    onClick={() => {}}
                    class="flex-shrink-0 opacity-75 hover:opacity-100 p-1"
                    aria-label="Close notification"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

// ============= Floating Action Button =============

export const FloatingActionButton: FunctionalComponent = () => {
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
            <div class="fixed bottom-20 right-4 z-40 lg:hidden safe-area-pb">
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
                                    active:scale-95 touch-manipulation min-h-[48px]
                                `}
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={() => {
                                    action.action();
                                    setIsExpanded(false);
                                }}
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
                        active:scale-95 touch-manipulation
                        ${isExpanded ? 'rotate-45' : 'hover:scale-110'}
                    `}
                    aria-label={isExpanded ? 'Close menu' : 'Open menu'}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? '✕' : '💪'}
                </button>
            </div>

            {/* Quick Join Modal */}
            {showQuickJoin && (
                <div 
                    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowQuickJoin(false)}
                >
                    <div 
                        class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 class="text-2xl font-bold mb-4 text-brand">Quick Join</h2>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">
                            Ready to join the fight? Enter your fighter name and we'll get you started.
                        </p>
                        
                        <input 
                            type="text" 
                            placeholder="Your fighter name"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white rounded-lg mb-4 focus:border-brand outline-none text-base"
                        />
                        
                        <div class="flex gap-3">
                            <button 
                                onClick={() => setShowQuickJoin(false)}
                                class="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors touch-manipulation min-h-[48px]"
                            >
                                Cancel
                            </button>
                            <button 
                                class="flex-1 bg-brand text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-accent transition-colors touch-manipulation min-h-[48px]"
                            >
                                Join Now 💪
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ============= Scroll to Top =============

export const ScrollToTop: FunctionalComponent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
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
            class="fixed bottom-24 right-4 z-30 lg:bottom-6
                   bg-brand/80 hover:bg-brand text-white
                   w-12 h-12 rounded-full shadow-lg
                   flex items-center justify-center
                   transition-all duration-300 hover:scale-110
                   active:scale-95 touch-manipulation"
            aria-label="Scroll to top"
        >
            ⬆️
        </button>
    );
};

// ============= Live Counter =============

export const LiveCounter: FunctionalComponent = () => {
    const [count, setCount] = useState(420);
    const [newMembers, setNewMembers] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setCount(prev => prev + 1);
                setNewMembers(prev => prev + 1);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div class="fixed top-20 left-4 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg lg:hidden">
            <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="font-bold text-brand">{count}</span>
                <span class="text-gray-600 dark:text-gray-400">fighters</span>
                {newMembers > 0 && (
                    <span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce-subtle">
                        +{newMembers}
                    </span>
                )}
            </div>
        </div>
    );
};

// ============= Progress Tracker =============

export const ProgressTracker: FunctionalComponent = () => {
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
                <div class="flex-grow min-w-0 w-24">
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
};

// ============= Swipe Gestures =============

export const SwipeGestures: FunctionalComponent<{ children: any }> = ({ children }) => {
    const [startX, setStartX] = useState(0);
    const [currentPage, setCurrentPage] = useState('');

    useEffect(() => {
        setCurrentPage(window.location.pathname);
    }, []);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        setStartX(e.touches[0].clientX);
    }, []);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        const minSwipeDistance = 50;

        const pages = ['/', '/experiences', '/membership', '/achievements', '/referrals'];
        const currentIndex = pages.indexOf(currentPage);

        // Swipe left (next page)
        if (diffX > minSwipeDistance && currentIndex < pages.length - 1) {
            window.location.href = pages[currentIndex + 1];
        }
        
        // Swipe right (previous page)
        if (diffX < -minSwipeDistance && currentIndex > 0) {
            window.location.href = pages[currentIndex - 1];
        }
    }, [startX, currentPage]);

    return (
        <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            class="h-full touch-pan-y"
        >
            {children}
        </div>
    );
};

// ============= Offline Indicator =============

export const OfflineIndicator: FunctionalComponent = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div class="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-bold">
            ⚠️ You're offline. Some features may be unavailable.
        </div>
    );
};

// ============= Pull to Refresh =============

export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const startY = useRef(0);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isPulling) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;
        
        if (diff > 0 && diff < 150) {
            setPullDistance(diff);
        }
    }, [isPulling]);

    const handleTouchEnd = useCallback(async () => {
        if (pullDistance > 100) {
            setIsRefreshing(true);
            await onRefresh();
            setIsRefreshing(false);
        }
        setIsPulling(false);
        setPullDistance(0);
    }, [pullDistance, onRefresh]);

    return {
        isPulling,
        pullDistance,
        isRefreshing,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
};

// ============= Mobile-Optimized Hooks =============

export function useViewportHeight() {
    const [vh, setVh] = useState(window.innerHeight * 0.01);

    useEffect(() => {
        const updateVh = () => {
            setVh(window.innerHeight * 0.01);
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        };

        updateVh();
        window.addEventListener('resize', updateVh);
        return () => window.removeEventListener('resize', updateVh);
    }, []);

    return vh;
}

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

export function useTouchFeedback() {
    const [activeElement, setActiveElement] = useState<string | null>(null);

    const onTouchStart = useCallback((id: string) => {
        setActiveElement(id);
    }, []);

    const onTouchEnd = useCallback(() => {
        setActiveElement(null);
    }, []);

    return {
        activeElement,
        onTouchStart,
        onTouchEnd,
        isActive: (id: string) => activeElement === id,
    };
}

// ============= Safe Area Utilities =============

export const SafeAreaStyles = () => (
    <style>{`
        .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .safe-area-pt {
            padding-top: env(safe-area-inset-top, 0px);
        }
        .safe-area-px {
            padding-left: env(safe-area-inset-left, 0px);
            padding-right: env(safe-area-inset-right, 0px);
        }
        
        /* Touch-friendly tap targets */
        .touch-manipulation {
            touch-action: manipulation;
        }
        
        /* Prevent text selection on interactive elements */
        .no-select {
            user-select: none;
            -webkit-user-select: none;
        }
        
        /* Smooth scrolling */
        .smooth-scroll {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }
        
        /* Mobile-optimized animations */
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .animate-slideInRight {
            animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes bounceSubtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
        
        .animate-bounce-subtle {
            animation: bounceSubtle 0.5s ease-in-out;
        }
    `}</style>
);

// ============= Mobile Container =============

export const MobileContainer: FunctionalComponent<{ children: any; className?: string }> = ({ 
    children, 
    className = '' 
}) => {
    return (
        <div class={`
            min-h-screen
            pb-20 lg:pb-0
            safe-area-pb
            ${className}
        `}>
            {children}
        </div>
    );
};

// ============= Touch-Friendly Button =============

export interface TouchButtonProps {
    onClick: () => void;
    children: any;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}

export const TouchButton: FunctionalComponent<TouchButtonProps> = ({
    onClick,
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
}) => {
    const baseStyles = 'font-bold rounded-lg transition-all duration-200 touch-manipulation no-select';
    
    const variantStyles = {
        primary: 'bg-brand hover:bg-brand-accent text-white active:scale-95',
        secondary: 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 active:scale-95',
        danger: 'bg-red-500 hover:bg-red-600 text-white active:scale-95',
    };
    
    const sizeStyles = {
        sm: 'px-3 py-2 text-sm min-h-[36px]',
        md: 'px-4 py-3 text-base min-h-[48px]',
        lg: 'px-6 py-4 text-lg min-h-[56px]',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            class={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {children}
        </button>
    );
};

// ============= Default Export =============

export default {
    NotificationToast,
    FloatingActionButton,
    ScrollToTop,
    LiveCounter,
    ProgressTracker,
    SwipeGestures,
    OfflineIndicator,
    MobileContainer,
    TouchButton,
    SafeAreaStyles,
    useNotification,
    usePullToRefresh,
    useViewportHeight,
    useIsMobile,
    useTouchFeedback,
};
