import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";

const mobileNavItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/experiences", label: "Communities", icon: "🌐" },
    { href: "/membership", label: "Join", icon: "🤝" },
    { href: "/links", label: "More", icon: "☰" },
];

const moreMenuItems = [
    { href: "/validators", label: "Validators", icon: "⚖️" },
    { href: "/attention-tokens", label: "Token Market", icon: "💎" },
    { href: "/products", label: "Protocols", icon: "💊" },
    { href: "/achievements", label: "Achievements", icon: "🏆" },
    { href: "/referrals", label: "Referrals", icon: "📢" },
    { href: "/testimonials", label: "Stories", icon: "📖" },
    { href: "/donate", label: "Support", icon: "💰" },
];

export function MobileNav() {
    const { url } = useLocation();
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const isActive = (href: string) => {
        if (href === "/") return url === "/";
        return url.startsWith(href);
    };

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:hidden z-40 safe-area-pb">
                <div class="flex items-center justify-around h-16">
                    {mobileNavItems.map((item) => {
                        const active = isActive(item.href);
                        const isMore = item.href === "/links";

                        if (isMore) {
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => setShowMoreMenu(true)}
                                    class={`
                                        flex flex-col items-center justify-center flex-1 h-full
                                        transition-colors duration-200
                                        ${showMoreMenu 
                                            ? 'text-brand' 
                                            : 'text-slate-500 dark:text-slate-400'}
                                    `}
                                >
                                    <span class="text-xl mb-0.5">{item.icon}</span>
                                    <span class="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                                </button>
                            );
                        }

                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                class={`
                                    flex flex-col items-center justify-center flex-1 h-full
                                    transition-colors duration-200
                                    ${active 
                                        ? 'text-brand bg-brand/5' 
                                        : 'text-slate-500 dark:text-slate-400'}
                                `}
                            >
                                <span class="text-xl mb-0.5">{item.icon}</span>
                                <span class="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                            </a>
                        );
                    })}
                </div>
            </nav>

            {/* More Menu Modal */}
            {showMoreMenu && (
                <div 
                    class="fixed inset-0 bg-black/50 z-50 lg:hidden"
                    onClick={() => setShowMoreMenu(false)}
                >
                    <div 
                        class="absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 class="font-bold text-slate-900 dark:text-white">Menu</h3>
                            <button 
                                onClick={() => setShowMoreMenu(false)}
                                class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div class="p-2">
                            {moreMenuItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setShowMoreMenu(false)}
                                        class={`
                                            flex items-center gap-3 p-3 rounded-xl transition-colors
                                            ${active 
                                                ? 'bg-brand/10 text-brand' 
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                                        `}
                                    >
                                        <span class="text-xl">{item.icon}</span>
                                        <span class="font-bold">{item.label}</span>
                                        {active && <span class="ml-auto text-brand">●</span>}
                                    </a>
                                );
                            })}
                        </div>
                        <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <a 
                                href="/underground"
                                onClick={() => setShowMoreMenu(false)}
                                class="flex items-center gap-3 text-red-600 dark:text-red-400 font-bold"
                            >
                                <span>🕋</span>
                                <span>Underground Access</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
