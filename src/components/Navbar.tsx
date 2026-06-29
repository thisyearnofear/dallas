import { useState } from "preact/hooks";
import { useWallet, CLEARANCE_STYLES } from "../context/WalletContext";
import { useMembership } from "../hooks/useMembership";
import { desktopNavItems } from "../config/navigation";

export function Navbar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { connected, dbcBalance, clearanceLevel } = useWallet();
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
                {desktopNavItems.map((item) => (
                    <li key={item.href}>
                        <a
                            href={item.href}
                            class={`
                                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                                text-brand dark:text-blue-400 hover:bg-brand hover:text-white
                                group relative overflow-hidden
                                ${item.highlight ? 'bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/30' : ''}
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
                        <h3 class="font-bold text-brand mb-3 text-sm">Your Stats</h3>
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
                            {clearanceLevel && (
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600 dark:text-gray-400">Clearance:</span>
                                    <span class={`text-[10px] font-black px-2 py-0.5 rounded-full ${CLEARANCE_STYLES[clearanceLevel]}`}>{clearanceLevel}</span>
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
        </nav>
    );
}
