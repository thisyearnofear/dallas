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
                <div class="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg animate-fadeIn shadow-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">✅</span>
                        <span class="font-bold">Shared successfully! Keep spreading hope.</span>
                    </div>
                </div>
            )}

            {/* Header with Stats */}
            <div class="bg-gradient-to-br from-brand to-brand-accent text-white p-8 rounded-2xl shadow-lg">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">🤝 Spread Hope</h1>
                        <p class="text-white/90 text-lg">
                            Help others find the treatments they need. Every referral saves lives.
                        </p>
                    </div>
                    <div class="text-center bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30 min-w-[120px]">
                        <div class="text-4xl font-bold">{totalReferrals}</div>
                        <div class="text-sm font-bold opacity-90 uppercase tracking-wider">People Helped</div>
                    </div>
                </div>
            </div>

            {/* Referral Progress */}
            <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <h2 class="text-2xl font-bold mb-6 text-slate-900 dark:text-white">🏆 Your Referral Journey</h2>
                
                {/* Progress Bar */}
                <div class="mb-8">
                    <div class="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">
                        <span>Progress to {nextReward.title}</span>
                        <span>{totalReferrals}/{nextReward.referralsNeeded} referrals</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 shadow-inner">
                        <div 
                            class="bg-gradient-to-r from-brand to-brand-accent rounded-full h-4 transition-all duration-700 shadow-sm"
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
                                p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                                ${totalReferrals >= reward.referralsNeeded 
                                    ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-300 dark:border-green-600 shadow-sm' 
                                    : totalReferrals >= reward.referralsNeeded - 2
                                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-600 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                }
                            `}
                        >
                            <div class="text-center">
                                <div class="text-3xl mb-3">{reward.icon}</div>
                                <h3 class={`font-bold text-sm mb-1 ${totalReferrals >= reward.referralsNeeded ? 'text-green-800 dark:text-green-300' : 'text-slate-900 dark:text-white'}`}>{reward.title}</h3>
                                <p class={`text-xs mb-3 font-medium ${totalReferrals >= reward.referralsNeeded ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>{reward.referralsNeeded} referrals</p>
                                <div class="space-y-1">
                                    {reward.rewards.map((r, i) => (
                                        <div key={i} class={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter ${totalReferrals >= reward.referralsNeeded ? 'bg-white/60 dark:bg-green-800/40 text-green-800 dark:text-green-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
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
            <div class="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm transition-colors">
                <h2 class="text-xl font-bold mb-4 text-blue-900 dark:text-blue-300">📋 Your Referral Code</h2>
                <div class="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-inner">
                    <div class="flex-grow">
                        <div class="font-mono text-3xl font-bold text-brand">{referralCode}</div>
                        <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Share this code with friends</div>
                    </div>
                    <button 
                        onClick={() => handleShare('copy')}
                        class="bg-brand text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-accent transition-all transform hover:scale-105 shadow-md"
                    >
                        📋 Copy
                    </button>
                </div>
            </div>

            {/* Share Methods */}
            <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <h2 class="text-xl font-bold mb-6 text-slate-900 dark:text-white">📤 Share with Others</h2>
                
                {/* Method Tabs */}
                <div class="flex mb-8 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 shadow-inner">
                    {[
                        { id: 'link', label: 'Share Link', icon: '🔗' },
                        { id: 'email', label: 'Send Email', icon: '📧' },
                        { id: 'social', label: 'Social Media', icon: '📱' }
                    ].map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id as any)}
                            class={`
                                flex-1 py-2.5 px-4 rounded-lg font-bold transition-all duration-300 text-sm flex items-center justify-center gap-2
                                ${selectedMethod === method.id 
                                    ? 'bg-white dark:bg-slate-700 text-brand shadow-md transform scale-[1.02]' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-brand'
                                }
                            `}
                        >
                            <span>{method.icon}</span>
                            <span>{method.label}</span>
                        </button>
                    ))}
                </div>

                {/* Share Content */}
                {selectedMethod === 'link' && (
                    <div class="space-y-4 animate-fadeIn">
                        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p class="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 italic">Share this link with anyone who needs hope:</p>
                            <div class="flex flex-col sm:flex-row items-stretch gap-3">
                                <input 
                                    type="text" 
                                    value={`${window.location.origin}?ref=${referralCode}`}
                                    readonly
                                    class="flex-grow p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 font-mono text-sm shadow-inner outline-none focus:border-brand transition-colors text-slate-800 dark:text-slate-200"
                                />
                                <button 
                                    onClick={() => handleShare('copy')}
                                    class="bg-brand text-white font-bold py-4 px-8 rounded-lg hover:bg-brand-accent transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl flex gap-3 items-center">
                            <span class="text-2xl">💡</span>
                            <p class="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                                <strong>Tip:</strong> Personal messages work better. Share your story about how the club helped you.
                            </p>
                        </div>
                    </div>
                )}

                {selectedMethod === 'email' && (
                    <div class="space-y-5 animate-fadeIn">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                                placeholder="friend@example.com"
                                class="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:border-brand outline-none transition-colors shadow-inner text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Personal Message (Optional)</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
                                placeholder="Add a personal note about how the club helped you..."
                                class="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:border-brand outline-none h-32 resize-none transition-colors shadow-inner text-slate-800 dark:text-slate-200"
                            ></textarea>
                        </div>
                        <button 
                            onClick={sendEmail}
                            disabled={!email}
                            class="w-full bg-brand text-white font-bold py-4 px-8 rounded-xl hover:bg-brand-accent transition-all transform hover:scale-[1.01] shadow-lg disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            📧 Send Invitation
                        </button>
                    </div>
                )}

                {selectedMethod === 'social' && (
                    <div class="space-y-6 animate-fadeIn">
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button 
                                onClick={() => handleShare('twitter')}
                                class="bg-[#1DA1F2] text-white font-bold py-4 px-6 rounded-xl hover:brightness-110 transition-all transform hover:scale-105 shadow-md"
                            >
                                🐦 Twitter
                            </button>
                            <button 
                                onClick={() => handleShare('facebook')}
                                class="bg-[#1877F2] text-white font-bold py-4 px-6 rounded-xl hover:brightness-110 transition-all transform hover:scale-105 shadow-md"
                            >
                                📘 Facebook
                            </button>
                            <button 
                                onClick={() => handleShare('copy')}
                                class="bg-slate-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-slate-700 transition-all transform hover:scale-105 shadow-md"
                            >
                                📋 Copy Text
                            </button>
                        </div>
                        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner">
                            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 italic uppercase tracking-wider">Preview of your post:</p>
                            <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 font-medium">
                                {shareText}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Your Referrals */}
            <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <h2 class="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <span>👥 Your Referrals</span>
                    <span class="bg-brand/10 text-brand text-sm px-2 py-0.5 rounded-full">{myReferrals.length}</span>
                </h2>
                
                {myReferrals.length === 0 ? (
                    <div class="text-center py-12 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div class="text-5xl mb-4">🤝</div>
                        <p class="text-lg font-medium">No referrals yet. Start spreading hope!</p>
                    </div>
                ) : (
                    <div class="space-y-4">
                        {myReferrals.map((referral) => (
                            <div key={referral.id} class="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-brand/20">
                                <div class="flex items-center gap-4">
                                    <div class="text-3xl bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">{referral.icon}</div>
                                    <div>
                                        <h3 class="font-bold text-slate-900 dark:text-white">{referral.name}</h3>
                                        <p class="text-sm text-slate-500 dark:text-slate-400">
                                            {referral.joinedDate ? `Joined ${referral.joinedDate}` : 'Invitation sent'}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class={`
                                        px-4 py-1.5 rounded-full text-xs font-bold shadow-sm
                                        ${referral.status === 'active' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' :
                                          referral.status === 'joined' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' :
                                          'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'}
                                    `}>
                                        {referral.status === 'active' ? '✅ Active' :
                                         referral.status === 'joined' ? '🤝 Joined' :
                                         '⏳ Pending'}
                                    </span>
                                    <span class="text-sm font-bold text-brand">{referral.reward}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Referral Tips */}
                <div class="mt-8 p-6 bg-gradient-to-r from-brand/10 to-brand/5 dark:from-brand/20 dark:to-brand/10 rounded-xl border border-brand/20">
                    <h3 class="font-bold text-brand mb-3 flex items-center gap-2">
                        <span>💡</span>
                        <span>Referral Tips</span>
                    </h3>
                    <ul class="text-sm text-slate-700 dark:text-slate-300 space-y-2 font-medium">
                        <li class="flex items-start gap-2">
                            <span class="text-brand">•</span>
                            <span>Share your personal story about how the club helped you</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-brand">•</span>
                            <span>Focus on people who are actively seeking alternative treatments</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-brand">•</span>
                            <span>Be genuine - this isn't about making money, it's about saving lives</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-brand">•</span>
                            <span>Follow up with support after they join</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}