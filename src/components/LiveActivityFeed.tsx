interface Activity {
    id: number;
    type: 'purchase' | 'join' | 'testimonial' | 'milestone';
    user: string;
    action: string;
    timestamp: string;
    location?: string;
    product?: string;
    icon: string;
    color: string;
}

// Simulated live activities
const activities: Activity[] = [
    { id: 1, type: 'purchase', user: 'Patient #4201', action: 'ordered AZT', timestamp: '2 min ago', location: 'Dallas, TX', product: 'AZT', icon: '💊', color: 'text-green-600' },
    { id: 2, type: 'join', user: 'New Member', action: 'joined the club', timestamp: '5 min ago', location: 'Austin, TX', icon: '🤝', color: 'text-blue-600' },
    { id: 3, type: 'testimonial', user: 'Patient #6969', action: 'shared success story', timestamp: '8 min ago', icon: '⭐', color: 'text-yellow-600' },
    { id: 4, type: 'purchase', user: 'Patient #1337', action: 'ordered Peptide T', timestamp: '12 min ago', location: 'Houston, TX', product: 'Peptide T', icon: '💊', color: 'text-green-600' },
    { id: 5, type: 'milestone', user: 'Community', action: 'reached 420 members!', timestamp: '15 min ago', icon: '🎉', color: 'text-purple-600' },
    { id: 6, type: 'purchase', user: 'Patient #8080', action: 'ordered DDC', timestamp: '18 min ago', location: 'Fort Worth, TX', product: 'DDC', icon: '💊', color: 'text-green-600' },
    { id: 7, type: 'join', user: 'Patient #1985', action: 'joined the fight', timestamp: '22 min ago', location: 'San Antonio, TX', icon: '🤝', color: 'text-blue-600' },
];

export function LiveActivityFeed() {
    return (
        <div class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-brand transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 class="text-xl font-bold text-gray-dark">Live Activity</h3>
                </div>
                <div class="text-sm text-gray-500">Updated now</div>
            </div>

            {/* Activity Stream */}
            <div class="space-y-4 max-h-96 overflow-y-auto">
                {activities.map((activity, index) => (
                    <div 
                        key={activity.id}
                        class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 animate-fadeIn"
                        style={{ 
                            animationDelay: `${index * 100}ms`,
                            opacity: Math.max(1 - (index * 0.1), 0.3)
                        }}
                    >
                        {/* Icon */}
                        <div class="text-2xl flex-shrink-0">{activity.icon}</div>
                        
                        {/* Content */}
                        <div class="flex-grow min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-grow">
                                    <p class="text-sm">
                                        <span class="font-semibold text-brand">{activity.user}</span>
                                        <span class="text-gray-700"> {activity.action}</span>
                                        {activity.product && (
                                            <span class="ml-1 bg-brand text-white text-xs px-2 py-1 rounded-full">
                                                {activity.product}
                                            </span>
                                        )}
                                    </p>
                                    {activity.location && (
                                        <p class="text-xs text-gray-500 mt-1">📍 {activity.location}</p>
                                    )}
                                </div>
                                <div class="text-xs text-gray-400 whitespace-nowrap">
                                    {activity.timestamp}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Footer */}
            <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="text-lg font-bold text-brand">23</div>
                        <div class="text-xs text-gray-500">Orders Today</div>
                    </div>
                    <div>
                        <div class="text-lg font-bold text-brand">12</div>
                        <div class="text-xs text-gray-500">New Members</div>
                    </div>
                    <div>
                        <div class="text-lg font-bold text-brand">420</div>
                        <div class="text-xs text-gray-500">Total Members</div>
                    </div>
                </div>
            </div>

            {/* FOMO Call to Action */}
            <div class="mt-4 p-4 bg-gradient-to-r from-brand/10 to-brand/5 rounded-lg border border-brand/20">
                <p class="text-sm font-medium text-gray-700 mb-2">
                    🔥 High activity detected! Don't miss out.
                </p>
                <button class="w-full bg-brand text-white font-bold py-2 px-4 rounded hover:bg-brand-accent transition-colors">
                    Join the Movement
                </button>
            </div>
        </div>
    );
}