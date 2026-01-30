import { useState, useEffect } from "preact/hooks";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    reward?: string;
}

interface UserStats {
    level: number;
    xp: number;
    xpToNext: number;
    totalOrders: number;
    daysActive: number;
    referrals: number;
    storiesShared: number;
}

const achievements: Achievement[] = [
    {
        id: 'welcome',
        title: 'Welcome Fighter',
        description: 'Joined the Dallas Buyers Club',
        icon: '🤝',
        unlocked: true,
        unlockedAt: 'Today',
        rarity: 'common',
        reward: '+100 XP'
    },
    {
        id: 'privacy_aware',
        title: 'Privacy Aware',
        description: 'Completed the privacy onboarding tour',
        icon: '🔐',
        unlocked: false,
        rarity: 'common',
        reward: '+150 XP'
    },
    {
        id: 'first_encryption',
        title: 'Encryption Initiate',
        description: 'Submitted your first encrypted case study',
        icon: '🔒',
        unlocked: false,
        rarity: 'common',
        reward: '+250 XP'
    },
    {
        id: 'first_purchase',
        title: 'First Strike',
        description: 'Made your first order',
        icon: '💊',
        unlocked: false,
        rarity: 'common',
        reward: '+200 XP'
    },
    {
        id: 'compression_saver',
        title: 'Storage Saver',
        description: 'Saved 50% or more on storage using compression',
        icon: '⚡',
        unlocked: false,
        rarity: 'rare',
        reward: '+300 XP'
    },
    {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Active for 7 consecutive days',
        icon: '📅',
        unlocked: false,
        progress: 3,
        maxProgress: 7,
        rarity: 'rare',
        reward: '+500 XP'
    },
    {
        id: 'spread_hope',
        title: 'Hope Spreader',
        description: 'Referred 3 new members',
        icon: '📢',
        unlocked: false,
        progress: 1,
        maxProgress: 3,
        rarity: 'rare',
        reward: '+300 XP + Exclusive Badge'
    },
    {
        id: 'zk_validator',
        title: 'Zero-Knowledge Validator',
        description: 'Validated 5 case studies using ZK proofs',
        icon: '🛡️',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        rarity: 'rare',
        reward: '+500 XP'
    },
    {
        id: 'story_teller',
        title: 'Story Teller',
        description: 'Shared your success story',
        icon: '📖',
        unlocked: false,
        rarity: 'epic',
        reward: '+750 XP + Featured Story'
    },
    {
        id: 'privacy_maximum',
        title: 'Maximum Privacy',
        description: 'Achieved 100/100 privacy score on a submission',
        icon: '🌟',
        unlocked: false,
        rarity: 'epic',
        reward: '+1000 XP + Privacy Champion Badge'
    },
    {
        id: 'survivor_30',
        title: '30 Day Survivor',
        description: 'Active member for 30 days',
        icon: '🏆',
        unlocked: false,
        progress: 18,
        maxProgress: 30,
        rarity: 'epic',
        reward: '+1000 XP + Special Title'
    },
    {
        id: 'committee_member',
        title: 'Committee Member',
        description: 'Participated in 3 MPC access decisions',
        icon: '👥',
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        rarity: 'epic',
        reward: '+800 XP'
    },
    {
        id: 'advocate',
        title: 'Hope Advocate',
        description: 'Helped 10 people find treatments',
        icon: '⭐',
        unlocked: false,
        progress: 4,
        maxProgress: 10,
        rarity: 'legendary',
        reward: '+2000 XP + Advocate Status'
    },
    {
        id: 'privacy_legend',
        title: 'Privacy Legend',
        description: 'Unlocked all privacy-related achievements',
        icon: '🏅',
        unlocked: false,
        rarity: 'legendary',
        reward: '+3000 XP + Privacy Legend Title'
    },
    {
        id: 'revolution',
        title: 'Revolutionary',
        description: 'Completed all other achievements',
        icon: '👑',
        unlocked: false,
        rarity: 'legendary',
        reward: '+5000 XP + Crown Badge'
    }
];

const userStats: UserStats = {
    level: 3,
    xp: 1250,
    xpToNext: 1500,
    totalOrders: 5,
    daysActive: 18,
    referrals: 1,
    storiesShared: 0
};

export function AchievementSystem() {
    const [selectedTab, setSelectedTab] = useState<'achievements' | 'privacy' | 'progress' | 'leaderboard'>('achievements');
    const [showUnlocked, setShowUnlocked] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    const progressAchievements = achievements.filter(a => a.progress !== undefined);
    
    // Privacy achievements
    const privacyAchievements = achievements.filter(a => 
        ['privacy_aware', 'first_encryption', 'compression_saver', 'zk_validator', 'privacy_maximum', 'committee_member', 'privacy_legend'].includes(a.id)
    );
    const unlockedPrivacyCount = privacyAchievements.filter(a => a.unlocked).length;

    const getRarityColor = (rarity: Achievement['rarity']) => {
        switch (rarity) {
            case 'common': return 'from-gray-100 to-gray-200 border-gray-300';
            case 'rare': return 'from-blue-100 to-blue-200 border-blue-300';
            case 'epic': return 'from-purple-100 to-purple-200 border-purple-300';
            case 'legendary': return 'from-yellow-100 to-yellow-200 border-yellow-300';
        }
    };

    const getRarityTextColor = (rarity: Achievement['rarity']) => {
        switch (rarity) {
            case 'common': return 'text-gray-700';
            case 'rare': return 'text-blue-700';
            case 'epic': return 'text-purple-700';
            case 'legendary': return 'text-yellow-700';
        }
    };

    // Simulate achievement unlock
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Math.random() > 0.7) {
                const unlockedAchievement = lockedAchievements[0];
                if (unlockedAchievement) {
                    setNewAchievement(unlockedAchievement);
                    setTimeout(() => setNewAchievement(null), 5000);
                }
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div class="max-w-4xl mx-auto">
            {/* New Achievement Notification */}
            {newAchievement && (
                <div class="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg animate-slideInRight">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">{newAchievement.icon}</div>
                        <div>
                            <h3 class="font-bold">Achievement Unlocked!</h3>
                            <p class="text-sm">{newAchievement.title}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Stats */}
            <div class="bg-gradient-to-br from-brand to-brand-accent text-white p-6 rounded-lg mb-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">Fighter Progress</h1>
                        <p class="opacity-90">Track your journey and unlock achievements</p>
                    </div>
                    <div class="text-right">
                        <div class="text-4xl font-bold">Level {userStats.level}</div>
                        <div class="text-sm opacity-75">
                            {userStats.xp}/{userStats.xpToNext} XP
                        </div>
                        <div class="w-32 bg-white/20 rounded-full h-2 mt-2">
                            <div 
                                class="bg-white rounded-full h-2 transition-all duration-500"
                                style={{ width: `${(userStats.xp / userStats.xpToNext) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
                {[
                    { id: 'achievements', label: '🏆 Achievements', count: unlockedAchievements.length },
                    { id: 'progress', label: '📈 Progress', count: progressAchievements.length },
                    { id: 'leaderboard', label: '👥 Community', count: 420 }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id as any)}
                        class={`
                            flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-300
                            ${selectedTab === tab.id 
                                ? 'bg-white text-brand shadow-md' 
                                : 'text-gray-600 hover:text-brand'
                            }
                        `}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {selectedTab === 'achievements' && (
                <div>
                    {/* Achievement Filter */}
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-dark">Your Achievements</h2>
                        <button
                            onClick={() => setShowUnlocked(!showUnlocked)}
                            class={`
                                px-4 py-2 rounded-full font-medium transition-all duration-300
                                ${showUnlocked 
                                    ? 'bg-brand text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }
                            `}
                        >
                            {showUnlocked ? 'Show All' : 'Unlocked Only'}
                        </button>
                    </div>

                    {/* Achievements Grid */}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(showUnlocked ? unlockedAchievements : achievements).map((achievement, index) => (
                            <div 
                                key={achievement.id}
                                class={`
                                    relative p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105
                                    bg-gradient-to-br ${getRarityColor(achievement.rarity)}
                                    ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}
                                `}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Rarity Badge */}
                                <div class={`
                                    absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold uppercase
                                    ${getRarityTextColor(achievement.rarity)}
                                `}>
                                    {achievement.rarity}
                                </div>

                                {/* Achievement Icon */}
                                <div class="text-4xl mb-3">{achievement.icon}</div>

                                {/* Achievement Info */}
                                <h3 class="text-lg font-bold mb-2 text-gray-dark">{achievement.title}</h3>
                                <p class="text-sm text-gray-600 mb-3">{achievement.description}</p>

                                {/* Progress Bar */}
                                {achievement.progress !== undefined && (
                                    <div class="mb-3">
                                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                class="bg-brand rounded-full h-2 transition-all duration-500"
                                                style={{ width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Reward and Status */}
                                <div class="flex justify-between items-center">
                                    <div class="text-xs text-gray-500">
                                        {achievement.reward}
                                    </div>
                                    <div class={`
                                        px-2 py-1 rounded-full text-xs font-semibold
                                        ${achievement.unlocked 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-600'
                                        }
                                    `}>
                                        {achievement.unlocked ? (
                                            `✓ ${achievement.unlockedAt}`
                                        ) : (
                                            '🔒 Locked'
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedTab === 'privacy' && (
                <div>
                    {/* Privacy Achievement Header */}
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold text-gray-dark flex items-center gap-2">
                            <span>🔐</span> Privacy Achievements
                        </h2>
                        <p class="text-gray-600 mt-2">
                            Unlock these by using privacy features. Protect your data, earn recognition.
                        </p>
                    </div>

                    {/* Privacy Progress Overview */}
                    <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800 mb-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-bold text-green-800 dark:text-green-300 mb-1">Privacy Champion Progress</h3>
                                <p class="text-sm text-green-700 dark:text-green-400">
                                    {unlockedPrivacyCount} of {privacyAchievements.length} achievements unlocked
                                </p>
                            </div>
                            <div class="text-3xl font-black text-green-600 dark:text-green-400">
                                {Math.round((unlockedPrivacyCount / privacyAchievements.length) * 100)}%
                            </div>
                        </div>
                        <div class="mt-4 w-full bg-white dark:bg-slate-800 rounded-full h-3">
                            <div 
                                class="bg-gradient-to-r from-green-500 to-blue-500 rounded-full h-3 transition-all duration-500"
                                style={{ width: `${(unlockedPrivacyCount / privacyAchievements.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Privacy Achievements Grid */}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {privacyAchievements.map((achievement, index) => (
                            <div 
                                key={achievement.id}
                                class={`
                                    relative p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105
                                    bg-gradient-to-br ${getRarityColor(achievement.rarity)}
                                    ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}
                                `}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Rarity Badge */}
                                <div class={`
                                    absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold uppercase
                                    ${getRarityTextColor(achievement.rarity)}
                                `}>
                                    {achievement.rarity}
                                </div>

                                {/* Achievement Icon */}
                                <div class="text-4xl mb-3">{achievement.icon}</div>

                                {/* Achievement Info */}
                                <h3 class="text-lg font-bold mb-2 text-gray-dark">{achievement.title}</h3>
                                <p class="text-sm text-gray-600 mb-3">{achievement.description}</p>

                                {/* Progress Bar */}
                                {achievement.progress !== undefined && (
                                    <div class="mb-3">
                                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                class="bg-green-500 rounded-full h-2 transition-all duration-500"
                                                style={{ width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Reward and Status */}
                                <div class="flex justify-between items-center">
                                    <div class="text-xs text-gray-500">
                                        {achievement.reward}
                                    </div>
                                    <div class={`
                                        px-2 py-1 rounded-full text-xs font-semibold
                                        ${achievement.unlocked 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-600'
                                        }
                                    `}>
                                        {achievement.unlocked ? (
                                            `✓ ${achievement.unlockedAt}`
                                        ) : (
                                            '🔒 Locked'
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedTab === 'progress' && (
                <div class="space-y-6">
                    <h2 class="text-2xl font-bold text-gray-dark">Your Progress</h2>
                    
                    {/* Stats Overview */}
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white p-4 rounded-lg border border-gray-200 hover:border-brand transition-colors">
                            <div class="text-2xl font-bold text-brand">{userStats.totalOrders}</div>
                            <div class="text-sm text-gray-600">Total Orders</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border border-gray-200 hover:border-brand transition-colors">
                            <div class="text-2xl font-bold text-brand">{userStats.daysActive}</div>
                            <div class="text-sm text-gray-600">Days Active</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border border-gray-200 hover:border-brand transition-colors">
                            <div class="text-2xl font-bold text-brand">{userStats.referrals}</div>
                            <div class="text-sm text-gray-600">Referrals</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border border-gray-200 hover:border-brand transition-colors">
                            <div class="text-2xl font-bold text-brand">{userStats.storiesShared}</div>
                            <div class="text-sm text-gray-600">Stories Shared</div>
                        </div>
                    </div>

                    {/* Progress Achievements */}
                    <div class="space-y-4">
                        <h3 class="text-xl font-semibold">Active Challenges</h3>
                        {progressAchievements.map((achievement) => (
                            <div key={achievement.id} class="bg-white p-4 rounded-lg border border-gray-200">
                                <div class="flex items-center gap-4">
                                    <div class="text-3xl">{achievement.icon}</div>
                                    <div class="flex-grow">
                                        <h4 class="font-semibold">{achievement.title}</h4>
                                        <p class="text-sm text-gray-600 mb-2">{achievement.description}</p>
                                        <div class="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                class="bg-brand rounded-full h-3 transition-all duration-500"
                                                style={{ width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div class="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                                            <span>{achievement.reward}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedTab === 'leaderboard' && (
                <div class="space-y-6">
                    <h2 class="text-2xl font-bold text-gray-dark">Community Leaderboard</h2>
                    
                    {/* Top Fighters */}
                    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div class="bg-gray-50 p-4 border-b border-gray-200">
                            <h3 class="font-semibold">🏆 Top Fighters This Month</h3>
                        </div>
                        <div class="p-4 space-y-3">
                            {[
                                { rank: 1, name: 'Patient #420', level: 12, achievements: 15, icon: '👑' },
                                { rank: 2, name: 'Hope Fighter', level: 10, achievements: 12, icon: '🥈' },
                                { rank: 3, name: 'Patient #1985', level: 9, achievements: 11, icon: '🥉' },
                                { rank: 4, name: 'You (Patient #4201)', level: userStats.level, achievements: unlockedAchievements.length, icon: '💪' },
                                { rank: 5, name: 'Revolution Kid', level: 8, achievements: 9, icon: '⚡' }
                            ].map((fighter) => (
                                <div 
                                    key={fighter.rank}
                                    class={`
                                        flex items-center gap-4 p-3 rounded-lg transition-colors
                                        ${fighter.name.includes('You') ? 'bg-brand/10 border border-brand/30' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div class="text-2xl">{fighter.icon}</div>
                                    <div class="flex-grow">
                                        <div class="font-semibold">{fighter.name}</div>
                                        <div class="text-sm text-gray-600">
                                            Level {fighter.level} • {fighter.achievements} achievements
                                        </div>
                                    </div>
                                    <div class="text-lg font-bold text-brand">#{fighter.rank}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community Stats */}
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg">
                            <div class="text-2xl font-bold text-blue-800">420</div>
                            <div class="text-sm text-blue-700">Total Members</div>
                        </div>
                        <div class="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg">
                            <div class="text-2xl font-bold text-green-800">2,847</div>
                            <div class="text-sm text-green-700">Lives Impacted</div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg">
                            <div class="text-2xl font-bold text-purple-800">156</div>
                            <div class="text-sm text-purple-700">Stories Shared</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}