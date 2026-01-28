export function Links() {
    return (
        <div class="min-h-screen transition-colors duration-300">
            {/* Live Activity Feed */}
            <div class="mb-12 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-6 font-mono rounded-2xl shadow-inner">
                <h2 class="text-xl font-black mb-6 bg-blue-700 dark:bg-blue-900 text-white p-3 border-b-2 border-blue-500 dark:border-blue-700 rounded-t-xl tracking-tighter">
                    📡 LIVE NETWORK ACTIVITY
                </h2>
                
                <div class="space-y-3 text-sm">
                    {[
                        { icon: '🤝', label: 'New Member joined the club', loc: 'Austin, TX', time: '5 min ago' },
                        { icon: '⭐', label: 'Patient #6969 shared success story', time: '8 min ago' },
                        { icon: '💊', label: 'Patient #1337 ordered Peptide T', loc: 'Houston, TX', time: '12 min ago' },
                        { icon: '🎉', label: 'Community reached 420 members!', time: '15 min ago' },
                        { icon: '💊', label: 'Patient #8080 ordered DDC', loc: 'Fort Worth, TX', time: '18 min ago' },
                        { icon: '🤝', label: 'Patient #1985 joined the fight', loc: 'San Antonio, TX', time: '22 min ago' }
                    ].map((item, i) => (
                        <div key={i} class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-brand/30 transition-colors">
                            <div class="flex items-center gap-4">
                                <span class="text-2xl">{item.icon}</span>
                                <div>
                                    <div class="font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{item.label}</div>
                                    <div class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                                        {item.loc ? `📍 ${item.loc} • ` : ''}{item.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Activity Stats */}
                <div class="mt-8 grid grid-cols-3 gap-4">
                    <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                        <div class="text-3xl font-black text-green-700 dark:text-green-400">23</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-500 mt-1">Orders Today</div>
                    </div>
                    <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                        <div class="text-3xl font-black text-blue-700 dark:text-blue-400">12</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 mt-1">New Members</div>
                    </div>
                    <div class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <div class="text-3xl font-black text-yellow-700 dark:text-yellow-400">420</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500 mt-1">Total Members</div>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-8 mb-12">
                {/* Emergency Support */}
                <div class="bg-red-50 dark:bg-red-900/20 border-4 border-red-600 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                    <div>
                        <h2 class="text-2xl font-black mb-4 text-red-700 dark:text-red-400 uppercase tracking-tighter">🚨 EMERGENCY SUPPORT</h2>
                        <div class="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-800 p-6 rounded-xl shadow-inner">
                            <h3 class="font-black text-red-600 dark:text-red-500 mb-2 uppercase tracking-widest text-sm">Need Help Now?</h3>
                            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                                24/7 emergency support for club members. When the system fails you, we're here to fight for your right to live.
                            </p>
                            <button class="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md uppercase tracking-widest text-xs">
                                EMERGENCY CONTACT
                            </button>
                        </div>
                    </div>
                </div>

                {/* Spread Hope Section */}
                <div class="bg-yellow-50 dark:bg-yellow-900/20 border-4 border-orange-500 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                    <div>
                        <h2 class="text-2xl font-black mb-4 text-orange-700 dark:text-orange-400 uppercase tracking-tighter">💯 SPREAD THE WORD</h2>
                        <div class="bg-white dark:bg-slate-900 border-2 border-orange-200 dark:border-orange-800 p-6 rounded-xl shadow-inner">
                            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                                Help others find hope. Share our mission with those who need it most. Every referral is a life potentially saved.
                            </p>
                            <div class="grid grid-cols-2 gap-4">
                                <button class="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md uppercase tracking-tighter text-[10px]">
                                    📱 Share Story
                                </button>
                                <button class="bg-green-600 hover:bg-green-700 text-white font-black py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md uppercase tracking-tighter text-[10px]">
                                    📧 Invite Friend
                                </button>
                            </div>
                            <div class="mt-4 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest text-center animate-pulse">
                                🎁 Share and get exclusive access
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Traditional Links Sections */}
            <div class="space-y-12">
                <section>
                    <h1 class="text-3xl font-black mb-6 text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                        <span class="bg-brand text-white p-2 rounded-lg text-xl">📞</span>
                        <span>CONTACT NETWORK</span>
                    </h1>
                    <div class="bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
                        <p class="text-2xl font-mono font-black text-brand break-all tracking-tighter">
                            <a class="hover:underline" href="mailto:underground@dallasbuyers.club">
                                underground@dallasbuyers.club
                            </a>
                        </p>
                        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 uppercase tracking-widest flex items-center gap-2">
                            <span>⚠️</span>
                            <span>All communications are encrypted and monitored for security</span>
                        </p>
                    </div>
                </section>

                <section>
                    <h1 class="text-3xl font-black mb-6 text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                        <span class="bg-brand text-white p-2 rounded-lg text-xl">📚</span>
                        <span>TREATMENT RESOURCES</span>
                    </h1>
                    <div class="grid gap-4">
                        {[
                            { label: '🇲🇽 Mexican Pharmacy Network', desc: 'Direct access to Dr. Vass laboratory' },
                            { label: '💊 Alternative Treatment Database', desc: 'Comprehensive guide to unapproved therapies' },
                            { label: '🧪 Underground Testing Reports', desc: 'Latest purity and effectiveness data' }
                        ].map((link, i) => (
                            <div key={i} class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-brand/50 transition-all group shadow-sm">
                                <a class="text-brand hover:underline font-black text-xl uppercase tracking-tighter block mb-1" href="#">
                                    {link.label}
                                </a>
                                <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{link.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="press">
                    <h1 class="text-3xl font-black mb-6 text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                        <span class="bg-brand text-white p-2 rounded-lg text-xl">📰</span>
                        <span>PRESS COVERAGE</span>
                    </h1>
                    <div class="grid gap-4">
                        {[
                            { label: 'Dallas Voice - "The Club That Saved Lives"', desc: 'How Ron Woodroof changed everything • March 1987' },
                            { label: 'Texas Monthly - "Ron Woodroof\'s Last Stand"', desc: 'The fight against the system • June 1991' },
                            { label: 'The New York Times - "A Renegade\'s Risky Remedy"', desc: 'National coverage of the underground network • August 1990' }
                        ].map((link, i) => (
                            <div key={i} class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-brand/50 transition-all group shadow-sm">
                                <a class="text-brand hover:underline font-black text-xl uppercase tracking-tighter block mb-1" href="#">
                                    {link.label}
                                </a>
                                <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{link.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
