export function Links() {
    return (
        <>
            {/* Live Activity Feed */}
            <div class="mb-8 bg-gray-100 border-2 border-gray-400 p-4 font-mono">
                <h2 class="text-xl font-bold mb-4 bg-blue-800 text-white p-2 border-b-2 border-gray-600">
                    📡 LIVE NETWORK ACTIVITY
                </h2>
                
                <div class="space-y-3 text-sm">
                    <div class="flex items-center justify-between p-2 bg-white border border-gray-400">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">🤝</span>
                            <div>
                                <div class="font-bold">New Member joined the club</div>
                                <div class="text-xs text-gray-600">📍 Austin, TX • 5 min ago</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-2 bg-white border border-gray-400">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">⭐</span>
                            <div>
                                <div class="font-bold">Patient #6969 shared success story</div>
                                <div class="text-xs text-gray-600">8 min ago</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-2 bg-white border border-gray-400">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">💊</span>
                            <div>
                                <div class="font-bold">Patient #1337 ordered Peptide T</div>
                                <div class="text-xs text-gray-600">📍 Houston, TX • 12 min ago</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-2 bg-white border border-gray-400">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">🎉</span>
                            <div>
                                <div class="font-bold">Community reached 420 members!</div>
                                <div class="text-xs text-gray-600">15 min ago</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-2 bg-white border border-gray-400">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">💊</span>
                            <div>
                                <div class="font-bold">Patient #8080 ordered DDC</div>
                                <div class="text-xs text-gray-600">📍 Fort Worth, TX • 18 min ago</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-2 bg-white border border-gray-400">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">🤝</span>
                            <div>
                                <div class="font-bold">Patient #1985 joined the fight</div>
                                <div class="text-xs text-gray-600">📍 San Antonio, TX • 22 min ago</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Stats */}
                <div class="mt-6 grid grid-cols-3 gap-4">
                    <div class="text-center p-3 bg-green-200 border-2 border-green-600">
                        <div class="text-2xl font-bold text-green-800">23</div>
                        <div class="text-xs text-green-700">Orders Today</div>
                    </div>
                    <div class="text-center p-3 bg-blue-200 border-2 border-blue-600">
                        <div class="text-2xl font-bold text-blue-800">12</div>
                        <div class="text-xs text-blue-700">New Members</div>
                    </div>
                    <div class="text-center p-3 bg-yellow-200 border-2 border-yellow-600">
                        <div class="text-2xl font-bold text-yellow-800">420</div>
                        <div class="text-xs text-yellow-700">Total Members</div>
                    </div>
                </div>
            </div>

            {/* Emergency Support */}
            <div class="mb-8 bg-red-100 border-4 border-red-600 p-4">
                <h2 class="text-xl font-bold mb-4 text-red-800">🚨 EMERGENCY SUPPORT</h2>
                <div class="bg-white border-2 border-red-400 p-4">
                    <h3 class="font-bold text-red-700 mb-2">Need Help Now?</h3>
                    <p class="text-sm text-red-600 mb-3">
                        24/7 emergency support for club members. When the system fails you, we're here.
                    </p>
                    <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 border-2 border-black transition-colors">
                        EMERGENCY CONTACT
                    </button>
                </div>
            </div>

            {/* Spread Hope Section */}
            <div class="mb-8 bg-yellow-200 border-4 border-orange-600 p-4">
                <h2 class="text-xl font-bold mb-4 text-orange-800">💯 SPREAD THE WORD</h2>
                <div class="bg-white border-2 border-orange-400 p-4">
                    <p class="text-sm text-orange-700 mb-4">
                        Help others find hope. Share our mission with those who need it most.
                    </p>
                    <div class="grid grid-cols-2 gap-3">
                        <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 border-2 border-black transition-colors">
                            📱 Share Story
                        </button>
                        <button class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 border-2 border-black transition-colors">
                            📧 Invite Friend
                        </button>
                    </div>
                    <div class="mt-3 text-xs text-orange-600">
                        🎁 Share and get exclusive access to new treatments
                    </div>
                </div>
            </div>

            {/* Traditional Links Section */}
            <h1 class="text-3xl font-bold mb-5 text-gray-dark">📞 CONTACT NETWORK</h1>
            <div class="bg-gray-100 border-2 border-gray-400 p-4 mb-6">
                <p class="text-lg font-mono">
                    Secure Line:{" "}
                    <a
                        class="text-brand hover:underline font-bold"
                        href="mailto:underground@dallasbuyers.club"
                    >
                        underground@dallasbuyers.club
                    </a>
                </p>
                <p class="text-sm text-gray-600 mt-2">
                    ⚠️ All communications are encrypted and monitored for security
                </p>
            </div>

            <h1 class="text-3xl font-bold mb-5 text-gray-dark">📚 TREATMENT RESOURCES</h1>
            <div class="space-y-3 mb-6">
                <div class="bg-white border-2 border-gray-400 p-3 hover:bg-gray-50">
                    <a class="text-brand hover:underline font-bold text-lg" href="#">
                        🇲🇽 Mexican Pharmacy Network
                    </a>
                    <p class="text-sm text-gray-600">Direct access to Dr. Vass laboratory</p>
                </div>
                <div class="bg-white border-2 border-gray-400 p-3 hover:bg-gray-50">
                    <a class="text-brand hover:underline font-bold text-lg" href="#">
                        💊 Alternative Treatment Database
                    </a>
                    <p class="text-sm text-gray-600">Comprehensive guide to unapproved therapies</p>
                </div>
                <div class="bg-white border-2 border-gray-400 p-3 hover:bg-gray-50">
                    <a class="text-brand hover:underline font-bold text-lg" href="#">
                        🧪 Underground Testing Reports
                    </a>
                    <p class="text-sm text-gray-600">Latest purity and effectiveness data</p>
                </div>
            </div>

            <h1 class="text-3xl font-bold mb-5 text-gray-dark" id="press">📰 PRESS COVERAGE</h1>
            <div class="space-y-3">
                <div class="bg-white border-2 border-gray-400 p-3 hover:bg-gray-50">
                    <a class="text-brand hover:underline font-bold text-lg" href="#">
                        Dallas Voice - "The Club That Saved Lives"
                    </a>
                    <p class="text-sm text-gray-600">How Ron Woodroof changed everything • March 1987</p>
                </div>
                <div class="bg-white border-2 border-gray-400 p-3 hover:bg-gray-50">
                    <a class="text-brand hover:underline font-bold text-lg" href="#">
                        Texas Monthly - "Ron Woodroof's Last Stand"
                    </a>
                    <p class="text-sm text-gray-600">The fight against the system • June 1991</p>
                </div>
                <div class="bg-white border-2 border-gray-400 p-3 hover:bg-gray-50">
                    <a class="text-brand hover:underline font-bold text-lg" href="#">
                        The New York Times - "A Renegade's Risky Remedy"
                    </a>
                    <p class="text-sm text-gray-600">National coverage of the underground network • August 1990</p>
                </div>
            </div>
        </>
    );
}
