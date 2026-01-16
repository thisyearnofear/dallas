import { LiveActivityFeed } from "./LiveActivityFeed";
import { NetworkIntelWidget } from "./NetworkIntelWidget";

export function ViralSidebar() {
    return (
        <div class="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 z-40 hidden lg:block">
            <div class="space-y-6">
                {/* Network Intel */}
                <NetworkIntelWidget />

                {/* Live Activity Feed */}
                <LiveActivityFeed />
                
                {/* Share Component */}
                <div class="bg-gradient-to-br from-brand to-brand-accent text-white rounded-lg p-6 hover:scale-105 transition-transform duration-300">
                    <h3 class="text-xl font-bold mb-3">💯 Spread the Word</h3>
                    <p class="text-sm mb-4 opacity-90">
                        Help others find hope. Share our mission.
                    </p>
                    <div class="grid grid-cols-2 gap-3">
                        <button class="bg-white/20 hover:bg-white/30 transition-colors px-3 py-2 rounded text-sm font-medium">
                            📱 Share
                        </button>
                        <button class="bg-white/20 hover:bg-white/30 transition-colors px-3 py-2 rounded text-sm font-medium">
                            📧 Invite
                        </button>
                    </div>
                    <div class="mt-4 text-xs opacity-75">
                        🎁 Share and get exclusive access to new treatments
                    </div>
                </div>

                {/* Emergency Contact */}
                <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4 hover:border-red-400 transition-colors">
                    <h4 class="font-bold text-red-800 mb-2">🚨 Need Help Now?</h4>
                    <p class="text-sm text-red-700 mb-3">
                        24/7 emergency support for club members.
                    </p>
                    <button class="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-colors">
                        Emergency Contact
                    </button>
                </div>

                {/* Countdown Timer */}
                <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <h4 class="font-bold text-yellow-800 mb-2">⏰ Limited Time</h4>
                    <p class="text-sm text-yellow-700 mb-3">
                        New shipment arriving soon
                    </p>
                    <div class="grid grid-cols-3 gap-2 text-center">
                        <div class="bg-yellow-200 rounded p-2">
                            <div class="font-bold text-yellow-800">12</div>
                            <div class="text-xs text-yellow-600">Hours</div>
                        </div>
                        <div class="bg-yellow-200 rounded p-2">
                            <div class="font-bold text-yellow-800">34</div>
                            <div class="text-xs text-yellow-600">Min</div>
                        </div>
                        <div class="bg-yellow-200 rounded p-2">
                            <div class="font-bold text-yellow-800">56</div>
                            <div class="text-xs text-yellow-600">Sec</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}