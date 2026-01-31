import { wellnessProtocols, getProtocolsByCategory, WellnessProtocol } from "../components/products";
import { ProtocolCard } from "../components/ProtocolCard";
import { useState } from "preact/hooks";

const CATEGORIES: { id: WellnessProtocol['category'] | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All Protocols', icon: '🌐' },
    { id: 'supplement', label: 'Supplements', icon: '💊' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🌱' },
    { id: 'mind-body', label: 'Mind-Body', icon: '🧘' },
    { id: 'experimental', label: 'Experimental', icon: '🔬' },
];

export function Products() {
    const [selectedCategory, setSelectedCategory] = useState<WellnessProtocol['category'] | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProtocols = wellnessProtocols.filter(protocol => {
        const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
        const matchesSearch = protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            protocol.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalMembers = wellnessProtocols.reduce((sum, p) => sum + p.memberCount, 0);
    const totalCaseStudies = wellnessProtocols.reduce((sum, p) => sum + p.caseStudyCount, 0);

    return (
        <div class="min-h-screen transition-colors duration-300">
            {/* Header Section */}
            <div class="text-center mb-12">
                <h1 class="text-4xl lg:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Wellness Protocols</h1>
                <p class="text-xl mb-8 max-w-3xl mx-auto text-slate-600 dark:text-slate-300">
                    Discover community-tracked wellness protocols. Real experiences, real data, real people.
                </p>
                
                {/* Search Bar */}
                <div class="max-w-xl mx-auto mb-8">
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search protocols..."
                            value={searchQuery}
                            onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                            class="w-full p-4 pl-12 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand outline-none dark:bg-slate-800 dark:text-white"
                        />
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    </div>
                </div>
                
                {/* Category Filter Buttons */}
                <div class="flex flex-wrap justify-center gap-3 mb-8">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            class={`
                                px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105
                                ${selectedCategory === category.id
                                    ? 'bg-brand text-white shadow-md'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-brand hover:text-white'}
                            `}
                        >
                            {category.icon} {category.label}
                        </button>
                    ))}
                </div>

                {/* Quick Stats */}
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-brand/20 shadow-sm transition-colors">
                        <div class="text-2xl font-bold text-brand">{wellnessProtocols.length}</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 font-medium">Active Protocols</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-brand/20 shadow-sm transition-colors">
                        <div class="text-2xl font-bold text-brand">{totalMembers.toLocaleString()}</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 font-medium">Community Members</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-brand/20 shadow-sm transition-colors">
                        <div class="text-2xl font-bold text-brand">{totalCaseStudies.toLocaleString()}</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 font-medium">Case Studies</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-brand/20 shadow-sm transition-colors">
                        <div class="text-2xl font-bold text-brand">6</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400 font-medium">Tokenized Communities</div>
                    </div>
                </div>
            </div>

            {/* Protocols Grid */}
            {filteredProtocols.length > 0 ? (
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProtocols.map((protocol, index) => (
                        <div 
                            key={protocol.id}
                            class={`transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                                index === 0 ? 'md:col-span-2' : ''
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <ProtocolCard protocol={protocol} featured={index === 0} />
                        </div>
                    ))}
                </div>
            ) : (
                <div class="text-center py-16">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No protocols found</h3>
                    <p class="text-slate-600 dark:text-slate-400">Try adjusting your search or category filter</p>
                </div>
            )}

            {/* Call to Action */}
            <div class="mt-16 text-center">
                <div class="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-10 rounded-2xl shadow-xl border border-slate-700">
                    <h2 class="text-3xl font-bold mb-4">Have a Protocol to Share?</h2>
                    <p class="text-lg mb-8 max-w-2xl mx-auto text-slate-300">
                        Join our community of wellness experimenters. Share your journey, track your outcomes, 
                        and help others discover what works.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4">
                        <a 
                            href="/experiences" 
                            class="bg-brand text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-accent transition-all transform hover:scale-105 shadow-lg"
                        >
                            🌐 Explore Communities
                        </a>
                        <a 
                            href="/membership" 
                            class="border-2 border-white/30 text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-slate-900 transition-all transform hover:scale-105"
                        >
                            🤝 Join the Club
                        </a>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div class="mt-12 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <p class="text-sm text-yellow-800 dark:text-yellow-300 text-center">
                    <strong>⚠️ Important:</strong> These protocols are community-shared experiences, not medical advice. 
                    Always consult healthcare professionals before starting any new wellness regimen. 
                    Results vary by individual. The Dallas Buyers Club does not endorse or guarantee any specific outcomes.
                </p>
            </div>
        </div>
    );
}
