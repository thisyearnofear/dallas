import { useState } from "preact/hooks";

interface Referral {
    id: string;
    name: string;
    status: 'pending' | 'joined' | 'active';
    joinedDate?: string;
    reward: string;
    icon: string;
}

interface ReferralReward {
    level: number;
    referralsNeeded: number;
    title: string;
    rewards: string[];
    icon: string;
    unlocked: boolean;
}

const referralRewards: ReferralReward[] = [
    {
        level: 1,
        referralsNeeded: 1,
        title: "Hope Spreader",
        rewards: ["+500 XP", "Special Badge", "Priority Support"],
        icon: "📢",
        unlocked: true
    },
    {
        level: 2,
        referralsNeeded: 3,
        title: "Community Builder",
        rewards: ["+1000 XP", "Exclusive Access", "Featured Profile"],
        icon: "🏗️",
        unlocked: false
    },
    {
        level: 3,
        referralsNeeded: 5,
        title: "Network Champion",
        rewards: ["+2000 XP", "Early Product Access", "VIP Status"],
        icon: "🌟",
        unlocked: false
    },
    {
        level: 4,
        referralsNeeded: 10,
        title: "Revolution Leader",
        rewards: ["+5000 XP", "Co-founder Recognition", "Special Powers"],
        icon: "👑",
        unlocked: false
    }
];

const myReferrals: Referral[] = [
    {
        id: "1",
        name: "Patient #069",
        status: "active",
        joinedDate: "3 days ago",
        reward: "+500 XP",
        icon: "💪"
    },
    {
        id: "2", 
        name: "Hope Seeker",
        status: "joined",
        joinedDate: "1 week ago",
        reward: "+300 XP",
        icon: "🤝"
    },
    {
        id: "3",
        name: "Fighter Mom",
        status: "pending",
        reward: "Pending...",
        icon: "⏳"
    }
];

export function ReferralSystem() {
    const [selectedMethod, setSelectedMethod] = useState<'link' | 'email' | 'social'>('link');
    const [referralCode] = useState("HOPE420");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const totalReferrals = myReferrals.filter(r => r.status !== 'pending').length;
    const currentLevel = referralRewards.findIndex(r => r.referralsNeeded > totalReferrals);
    const nextReward = referralRewards[currentLevel] || referralRewards[referralRewards.length - 1];

    const shareText = `💊 Join me in the Dallas Buyers Club - fighting for access to life-saving treatments. Use my code ${referralCode} and let's change the system together. #DallasBuyersClub #FightForHope`;

    const handleShare = async (platform: string) => {
        const url = `${window.location.origin}?ref=${referralCode}`;
        
        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`);
                break;
            case 'facebook':
                window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
                break;
            case 'copy':
                navigator.clipboard.writeText(`${shareText} ${url}`);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                break;
        }
    };

    const sendEmail = () => {
        if (!email) return;
        
        // Simulate sending email
        setShowSuccess(true);
        setEmail("");
        setMessage("");
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div class="max-w-4xl mx-auto space-y-6">
            {/* Success Message */}
            {showSuccess && (
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-fadeIn">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">✅</span>
                        <span class="font-medium">Shared successfully! Keep spreading hope.</span>
                    </div>
                </div>
            )}

            {/* Header with Stats */}
            <div class="bg-gradient-to-br from-brand to-brand-accent text-white p-6 rounded-lg">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">🤝 Spread Hope</h1>
                        <p class="opacity-90">
                            Help others find the treatments they need. Every referral saves lives.
                        </p>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold">{totalReferrals}</div>
                        <div class="text-sm opacity-75">People Helped</div>
                    </div>
                </div>
            </div>

            {/* Referral Progress */}
            <div class="bg-white p-6 rounded-lg border border-gray-200">
                <h2 class="text-2xl font-bold mb-4">🏆 Your Referral Journey</h2>
                
                {/* Progress Bar */}
                <div class="mb-6">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress to {nextReward.title}</span>
                        <span>{totalReferrals}/{nextReward.referralsNeeded} referrals</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div 
                            class="bg-gradient-to-r from-brand to-brand-accent rounded-full h-4 transition-all duration-500"
                            style={{ width: `${Math.min((totalReferrals / nextReward.referralsNeeded) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Reward Levels */}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {referralRewards.map((reward, index) => (
                        <div 
                            key={reward.level}
                            class={`
                                p-4 rounded-lg border-2 transition-all duration-300
                                ${totalReferrals >= reward.referralsNeeded 
                                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300' 
                                    : totalReferrals >= reward.referralsNeeded - 2
                                    ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300'
                                    : 'bg-gray-50 border-gray-200'
                                }
                            `}
                        >
                            <div class="text-center">
                                <div class="text-3xl mb-2">{reward.icon}</div>
                                <h3 class="font-bold text-sm mb-1">{reward.title}</h3>
                                <p class="text-xs text-gray-600 mb-2">{reward.referralsNeeded} referrals</p>
                                <div class="space-y-1">
                                    {reward.rewards.map((r, i) => (
                                        <div key={i} class="text-xs bg-white/50 px-2 py-1 rounded">
                                            {r}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Your Referral Code */}
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h2 class="text-xl font-bold mb-4">📋 Your Referral Code</h2>
                <div class="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-blue-300">
                    <div class="flex-grow">
                        <div class="font-mono text-2xl font-bold text-brand">{referralCode}</div>
                        <div class="text-sm text-gray-600">Share this code with friends</div>
                    </div>
                    <button 
                        onClick={() => handleShare('copy')}
                        class="bg-brand text-white font-bold py-2 px-6 rounded hover:bg-brand-accent transition-colors"
                    >
                        📋 Copy
                    </button>
                </div>
            </div>

            {/* Share Methods */}
            <div class="bg-white p-6 rounded-lg border border-gray-200">
                <h2 class="text-xl font-bold mb-4">📤 Share with Others</h2>
                
                {/* Method Tabs */}
                <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
                    {[
                        { id: 'link', label: '🔗 Share Link', icon: '🔗' },
                        { id: 'email', label: '📧 Send Email', icon: '📧' },
                        { id: 'social', label: '📱 Social Media', icon: '📱' }
                    ].map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id as any)}
                            class={`
                                flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300
                                ${selectedMethod === method.id 
                                    ? 'bg-white text-brand shadow-md' 
                                    : 'text-gray-600 hover:text-brand'
                                }
                            `}
                        >
                            {method.label}
                        </button>
                    ))}
                </div>

                {/* Share Content */}
                {selectedMethod === 'link' && (
                    <div class="space-y-4">
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-600 mb-3">Share this link with anyone who needs hope:</p>
                            <div class="flex items-center gap-3">
                                <input 
                                    type="text" 
                                    value={`${window.location.origin}?ref=${referralCode}`}
                                    readonly
                                    class="flex-grow p-3 border border-gray-300 rounded bg-white font-mono text-sm"
                                />
                                <button 
                                    onClick={() => handleShare('copy')}
                                    class="bg-brand text-white font-bold py-3 px-6 rounded hover:bg-brand-accent transition-colors"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <p class="text-sm text-yellow-800">
                                💡 <strong>Tip:</strong> Personal messages work better. Share your story about how the club helped you.
                            </p>
                        </div>
                    </div>
                )}

                {selectedMethod === 'email' && (
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                                placeholder="friend@example.com"
                                class="w-full p-3 border border-gray-300 rounded focus:border-brand outline-none"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Personal Message (Optional)</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
                                placeholder="Add a personal note about how the club helped you..."
                                class="w-full p-3 border border-gray-300 rounded focus:border-brand outline-none h-24 resize-none"
                            ></textarea>
                        </div>
                        <button 
                            onClick={sendEmail}
                            disabled={!email}
                            class="w-full bg-brand text-white font-bold py-3 px-6 rounded hover:bg-brand-accent transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            📧 Send Invitation
                        </button>
                        <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p class="text-sm text-blue-800">
                                📧 We'll send a personalized invitation with your referral code and story.
                            </p>
                        </div>
                    </div>
                )}

                {selectedMethod === 'social' && (
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button 
                                onClick={() => handleShare('twitter')}
                                class="bg-blue-400 text-white font-bold py-3 px-6 rounded hover:bg-blue-500 transition-colors"
                            >
                                🐦 Twitter
                            </button>
                            <button 
                                onClick={() => handleShare('facebook')}
                                class="bg-blue-600 text-white font-bold py-3 px-6 rounded hover:bg-blue-700 transition-colors"
                            >
                                📘 Facebook
                            </button>
                            <button 
                                onClick={() => handleShare('copy')}
                                class="bg-gray-600 text-white font-bold py-3 px-6 rounded hover:bg-gray-700 transition-colors"
                            >
                                📋 Copy Text
                            </button>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-600 mb-2">Preview of your post:</p>
                            <div class="p-3 bg-white border rounded text-sm">
                                {shareText}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Your Referrals */}
            <div class="bg-white p-6 rounded-lg border border-gray-200">
                <h2 class="text-xl font-bold mb-4">👥 Your Referrals ({myReferrals.length})</h2>
                
                {myReferrals.length === 0 ? (
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-4">🤝</div>
                        <p>No referrals yet. Start spreading hope!</p>
                    </div>
                ) : (
                    <div class="space-y-3">
                        {myReferrals.map((referral) => (
                            <div key={referral.id} class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="text-2xl">{referral.icon}</div>
                                    <div>
                                        <h3 class="font-medium">{referral.name}</h3>
                                        <p class="text-sm text-gray-600">
                                            {referral.joinedDate ? `Joined ${referral.joinedDate}` : 'Invitation sent'}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class={`
                                        px-3 py-1 rounded-full text-xs font-semibold
                                        ${referral.status === 'active' ? 'bg-green-100 text-green-800' :
                                          referral.status === 'joined' ? 'bg-blue-100 text-blue-800' :
                                          'bg-yellow-100 text-yellow-800'}
                                    `}>
                                        {referral.status === 'active' ? '✅ Active' :
                                         referral.status === 'joined' ? '🤝 Joined' :
                                         '⏳ Pending'}
                                    </span>
                                    <span class="text-sm font-medium text-brand">{referral.reward}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Referral Tips */}
                <div class="mt-6 p-4 bg-gradient-to-r from-brand/10 to-brand/5 rounded-lg border border-brand/20">
                    <h3 class="font-bold text-brand mb-2">💡 Referral Tips</h3>
                    <ul class="text-sm text-gray-700 space-y-1">
                        <li>• Share your personal story about how the club helped you</li>
                        <li>• Focus on people who are actively seeking alternative treatments</li>
                        <li>• Be genuine - this isn't about making money, it's about saving lives</li>
                        <li>• Follow up with support after they join</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}