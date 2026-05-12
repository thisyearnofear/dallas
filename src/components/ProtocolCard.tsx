import type { AgentProtocol } from "./products";
import { getEvidenceColor, getCategoryIcon } from "./products";
import type { TokenGatedResource, FoundingValidator } from "../types/community";

interface ProtocolCardProps {
    protocol: AgentProtocol & {
        tokenGatedResources?: TokenGatedResource[];
        foundingValidators?: FoundingValidator[];
        genesisOpen?: boolean;
    };
    featured?: boolean;
}

export function ProtocolCard({ protocol, featured = false }: ProtocolCardProps) {
    const evidenceClass = getEvidenceColor(protocol.evidenceLevel);
    const categoryIcon = getCategoryIcon(protocol.category);

    return (
        <div class={`
            relative group border-2 p-4 flex flex-col h-full rounded-lg
            hover:border-brand transition-all duration-300 hover:shadow-lg
            ${featured 
                ? 'border-brand bg-gradient-to-br from-brand/10 to-brand/20 dark:from-brand/20 dark:to-brand/30' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}
        `}>
            {/* Featured Badge */}
            {featured && (
                <div class="absolute -top-2 -right-2 bg-brand text-white px-3 py-1 text-sm font-bold rounded-full z-10 shadow-md">
                    🔥 TRENDING
                </div>
            )}
            
            {/* Protocol Image */}
            <div class="relative overflow-hidden mb-4 rounded shadow-inner bg-slate-100 dark:bg-slate-800">
                <img 
                    src={protocol.image} 
                    alt={protocol.name} 
                    class={`
                        w-full object-cover group-hover:scale-110 transition-transform duration-500
                        ${featured ? 'h-48 lg:h-56' : 'h-40'}
                    `} 
                />
                
                {/* Category Badge */}
                <div class="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-sm font-bold shadow-md">
                    {categoryIcon} {protocol.category}
                </div>
            </div>

            {/* Protocol Info */}
            <div class="flex-grow">
                <h2 class={`font-bold font-sans mb-2 group-hover:text-brand transition-colors ${featured ? 'text-2xl' : 'text-xl'} text-slate-900 dark:text-white`}>
                    {protocol.name}
                </h2>
                <p class={`text-slate-600 dark:text-slate-400 mb-4 flex-grow ${featured ? 'text-base' : 'text-sm'}`}>
                    {protocol.description}
                </p>
            </div>

            {/* Stats Row */}
            <div class="flex items-center gap-4 mb-4 text-sm">
                <div class="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <span>👥</span>
                    <span class="font-bold">{protocol.memberCount.toLocaleString()}</span>
                </div>
                <div class="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <span>📋</span>
                    <span class="font-bold">{protocol.optimizationLogCount}</span>
                </div>
                {protocol.tokenSymbol && (
                    <div class="flex items-center gap-1 text-brand">
                        <span>🪙</span>
                        <span class="font-bold text-xs">${protocol.tokenSymbol}</span>
                    </div>
                )}
            </div>

            {/* Evidence Level */}
            <div class="mb-4">
                <span class={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${evidenceClass}`}>
                    📊 {protocol.evidenceLevel.charAt(0).toUpperCase() + protocol.evidenceLevel.slice(1)} Evidence
                </span>
                {protocol.genesisOpen && (
                    <span class="ml-2 inline-block px-3 py-1 rounded-full text-xs font-bold border border-yellow-400 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                        ⚡ Genesis Open
                    </span>
                )}
            </div>

            {/* Token-Gated Resources */}
            {protocol.tokenGatedResources && protocol.tokenGatedResources.length > 0 && (
                <div class="mb-4 p-3 rounded-lg bg-brand/5 border border-brand/20">
                    <div class="text-xs font-black text-brand uppercase tracking-widest mb-2">🔐 Token-Gated Resources</div>
                    <ul class="space-y-1">
                        {protocol.tokenGatedResources.map(r => (
                            <li key={r.id} class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                                <span class="flex-shrink-0">{r.icon}</span>
                                <span>
                                    <span class="font-bold">{r.title}</span>
                                    {r.size && <span class="ml-1 text-brand font-semibold">({r.size})</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Founding Validators */}
            {protocol.foundingValidators && protocol.foundingValidators.length > 0 && (
                <div class="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">⚖️ Founding Validators</div>
                    <ul class="space-y-1">
                        {protocol.foundingValidators.map(v => (
                            <li key={v.handle} class="flex items-center justify-between text-xs">
                                <span class="font-bold text-slate-800 dark:text-slate-200">{v.handle}</span>
                                <span class="text-slate-500 dark:text-slate-400">{v.reviewsCommitted} reviews committed</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Buttons */}
            <div class="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                    href={`/alliances`}
                    class={`
                        flex-1 bg-brand text-white font-bold py-2 px-4 rounded shadow-md
                        hover:bg-brand-accent transition-all duration-300
                        hover:scale-105 active:scale-95 text-center
                        ${featured ? 'py-3 text-base' : 'text-sm'}
                    `}
                >
                    🌐 Join Community
                </a>
                <button 
                    class="text-brand hover:text-brand-accent transition-all p-2 hover:bg-brand/10 rounded-full"
                    title="Save to watchlist"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
