import { meta } from "./constants";
import { useState } from "preact/hooks";
import { useWallet } from "../context/WalletContext";
import { useMembership } from "../hooks/useMembership";

const navigationItems = [
    { href: "/", label: "Home", icon: "🏠", description: "Welcome to the club" },
    { href: "/experiences", label: "Communities", icon: "🌐", description: "Discover & create", highlight: true },
    { href: "/attention-tokens", label: "Token Market", icon: "💎", description: "Trade community tokens", highlight: true },
    { href: "/validators", label: "Validators", icon: "⚖️", description: "Earn by validating", highlight: true },
    { href: "/membership", label: "Join Us", icon: "🤝", description: "Become a fighter" },
    { href: "/underground", label: "Underground", icon: "🕋", description: "Secret operations", secret: true },
    { href: "/links", label: "Resources", icon: "🔗", description: "Tools & info" }
];

export function Navbar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { connected, dbcBalance, reputationTier } = useWallet();
    const { membership, hasMembership, tier } = useMembership();

    return (
        <nav class={`
            hidden lg:block transition-all duration-300 pt-3 border-r-2 border-r-gray-dark box-border bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800
            ${isCollapsed ? 'w-16' : 'w-72'}
        `}>
            {/* Collapse Toggle */}
            <div class="flex justify-between items-center px-3 mb-4">
                {!isCollapsed && (
                    <h2 class="font-bold text-gray-dark dark:text-gray-200 text-lg">Navigation</h2>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-brand dark:text-blue-400"
                    title={isCollapsed ? "Expand menu" : "Collapse menu"}
                >
                    {isCollapsed ? '📖' : '📋'}
                </button>
            </div>

            <ul class="space-y-2 px-2">
                {navigationItems.map((item, index) => (
                    <li key={item.href}>
                        <a
                            href={item.href}
                            class={`
                                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                                text-brand dark:text-blue-400 hover:bg-brand hover:text-white
                                group relative overflow-hidden
                                ${item.highlight ? 'bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/30' : ''}
                                ${item.secret ? 'bg-gradient-to-r from-red-100/40 dark:from-red-900/20 to-gray-200 dark:to-black border border-red-400 dark:border-red-600/30 hover:bg-red-800' : ''}
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                            title={isCollapsed ? `${item.label} - ${item.description}` : ''}
                        >
                            <span class="text-xl flex-shrink-0">{item.icon}</span>

                            {!isCollapsed && (
                                <div class="flex-grow min-w-0">
                                    <div class="font-semibold text-lg">{item.label}</div>
                                    <div class="text-xs opacity-75 group-hover:opacity-90 truncate">
                                        {item.description}
                                    </div>
                                </div>
                            )}

                            {/* Highlight badge */}
                            {item.highlight && !isCollapsed && (
                                <span class="bg-brand text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse-custom">
                                    NEW
                                </span>
                            )}

                            {/* Hover effect */}
                            <div class="absolute inset-0 bg-gradient-to-r from-brand/0 via-brand/5 to-brand/0 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        </a>
                    </li>
                ))}
            </ul>

            {/* Quick Stats - Real Data */}
            {!isCollapsed && connected && (
                <div class="mt-8 px-4">
                    <div class="bg-gradient-to-br from-brand/10 to-brand/5 p-4 rounded-lg border border-brand/20">
                        <h3 class="font-bold text-brand mb-3 text-sm">🔥 Your Stats</h3>
                        <div class="space-y-2 text-xs">
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">DBC Balance:</span>
                                <span class="font-bold text-brand dark:text-blue-400">{dbcBalance.toLocaleString()}</span>
                            </div>
                            {hasMembership && tier && (
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Membership:</span>
                                    <span class="font-bold text-brand dark:text-blue-400 capitalize">{tier}</span>
                                </div>
                            )}
                            {reputationTier && (
                                <div class="flex justify-between">
                                    <span class="text-gray-600 dark:text-gray-400">Validator Tier:</span>
                                    <span class="font-bold text-brand dark:text-blue-400">{reputationTier}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Membership Progress */}
                        {hasMembership && membership && (
                            <div class="mt-3">
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="text-gray-600 dark:text-gray-400">Membership Expires:</span>
                                    <span class="font-bold text-brand">
                                        {Math.ceil((membership.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        class="bg-brand rounded-full h-2 transition-all duration-500"
                                        style={{ width: `${Math.max(0, Math.min(100, ((membership.expiresAt.getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)) * 100))}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Connect Wallet CTA */}
            {!isCollapsed && !connected && (
                <div class="mt-8 px-4">
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p class="text-xs text-yellow-800 dark:text-yellow-300 mb-2">
                            Connect your wallet to see your stats
                        </p>
                    </div>
                </div>
            )}

            {/* Mobile CTA */}
            {!isCollapsed && (
                <div class="mt-6 px-4">
                    <a
                        href="/membership"
                        class="block bg-gradient-to-r from-brand to-brand-accent text-white text-center font-bold py-3 px-4 rounded-lg hover:scale-105 transition-transform duration-300"
                    >
                        💪 Join the Fight
                    </a>
                </div>
            )}

            {/* Support Link */}
            {!isCollapsed && (
                <div class="mt-4 px-4 pb-4">
                    <a 
                        href="/links"
                        class="block bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-3 rounded-lg transition-colors"
                    >
                        <div class="text-slate-800 dark:text-slate-300 text-xs font-semibold mb-1">📚 Resources</div>
                        <div class="text-slate-600 dark:text-slate-400 text-xs">Guides & support</div>
                    </a>
                </div>
            )}
        </nav>
    );
}
