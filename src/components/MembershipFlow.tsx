import { useState } from "preact/hooks";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
    maxProgress?: number;
}

const achievements: Achievement[] = [
    { id: 'joined', title: 'Welcome Fighter', description: 'Joined the Dallas Buyers Club', icon: '🤝', unlocked: false },
    { id: 'first_order', title: 'First Purchase', description: 'Made your first order', icon: '💊', unlocked: false },
    { id: 'referral', title: 'Spread the Word', description: 'Referred a new member', icon: '📢', unlocked: false },
    { id: 'survivor', title: 'Survivor', description: 'Active member for 30 days', icon: '🏆', unlocked: false, progress: 0, maxProgress: 30 },
    { id: 'advocate', title: 'Hope Advocate', description: 'Helped 5 people find treatments', icon: '⭐', unlocked: false, progress: 0, maxProgress: 5 },
];

export function MembershipFlow() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        nickname: '',
        location: '',
        condition: '',
        motivation: '',
        referralCode: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const steps = [
        { title: 'Basic Info', icon: '👤' },
        { title: 'Your Story', icon: '📖' },
        { title: 'Community', icon: '🤝' },
        { title: 'Complete', icon: '🎉' }
    ];

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccess(true);
            // Unlock first achievement
            achievements[0].unlocked = true;
        }, 2000);
    };

    if (showSuccess) {
        return (
            <div class="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg border-2 border-brand">
                <div class="text-center mb-8">
                    <div class="text-6xl mb-4">🎉</div>
                    <h2 class="text-3xl font-bold text-brand mb-4">Welcome to the Fight!</h2>
                    <p class="text-lg text-gray-600">
                        You're now part of something bigger. Let's change the system together.
                    </p>
                </div>

                {/* Achievement Unlocked */}
                <div class="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-lg mb-6 animate-pulse-custom">
                    <div class="flex items-center gap-4">
                        <div class="text-4xl">🏆</div>
                        <div>
                            <h3 class="text-xl font-bold text-green-800">Achievement Unlocked!</h3>
                            <p class="text-green-700">Welcome Fighter - You've joined the Dallas Buyers Club</p>
                        </div>
                    </div>
                </div>

                {/* Member Card */}
                <div class="bg-gradient-to-br from-brand to-brand-accent text-white p-6 rounded-lg mb-6">
                    <h3 class="text-xl font-bold mb-2">Your Member Card</h3>
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-lg font-semibold">{formData.nickname || 'Fighter'}</p>
                            <p class="opacity-75">Member #42{Math.floor(Math.random() * 1000)}</p>
                            <p class="opacity-75">{formData.location}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold">Level 1</div>
                            <div class="text-sm opacity-75">New Fighter</div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button class="bg-brand text-white font-bold py-3 px-4 rounded hover:bg-brand-accent transition-colors">
                        💊 Browse Products
                    </button>
                    <button class="bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition-colors">
                        🤝 Meet Community
                    </button>
                    <button class="bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 transition-colors">
                        📖 Share Story
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div class="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg border-2 border-gray-200 hover:border-brand transition-all duration-300">
            {/* Progress Bar */}
            <div class="mb-8">
                <div class="flex justify-between items-center mb-4">
                    {steps.map((step, index) => (
                        <div 
                            key={index}
                            class={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                        >
                            <div 
                                class={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                    ${currentStep > index + 1 ? 'bg-green-500 text-white' : 
                                      currentStep === index + 1 ? 'bg-brand text-white' : 
                                      'bg-gray-200 text-gray-500'}
                                `}
                            >
                                {currentStep > index + 1 ? '✓' : step.icon}
                            </div>
                            {index < steps.length - 1 && (
                                <div 
                                    class={`
                                        flex-1 h-2 mx-4 rounded
                                        ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}
                                    `}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>
                <p class="text-center text-gray-600">
                    Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
                </p>
            </div>

            {/* Step Content */}
            <div class="min-h-96">
                {currentStep === 1 && (
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-brand">Join the Fight</h2>
                        <p class="text-gray-600">
                            Every fighter needs an identity. Choose how you want to be known in our community.
                        </p>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Fighter Nickname</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Patient #420, Hope Fighter, etc."
                                    class="w-full p-3 border-2 border-gray-200 rounded focus:border-brand outline-none transition-colors"
                                    value={formData.nickname}
                                    onInput={(e) => setFormData({...formData, nickname: (e.target as HTMLInputElement).value})}
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Location (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Dallas, TX"
                                    class="w-full p-3 border-2 border-gray-200 rounded focus:border-brand outline-none transition-colors"
                                    value={formData.location}
                                    onInput={(e) => setFormData({...formData, location: (e.target as HTMLInputElement).value})}
                                />
                            </div>

                            <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <p class="text-sm text-yellow-800">
                                    🔒 <strong>Privacy First:</strong> We use anonymous identifiers. Your real identity stays protected.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-brand">Your Journey</h2>
                        <p class="text-gray-600">
                            Help us understand your situation so we can connect you with the right resources.
                        </p>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">What brings you here?</label>
                                <select 
                                    class="w-full p-3 border-2 border-gray-200 rounded focus:border-brand outline-none transition-colors"
                                    value={formData.condition}
                                    onChange={(e) => setFormData({...formData, condition: (e.target as HTMLSelectElement).value})}
                                >
                                    <option value="">Select your situation</option>
                                    <option value="seeking_treatment">Seeking alternative treatments</option>
                                    <option value="supporting_someone">Supporting someone I care about</option>
                                    <option value="research">Research and information gathering</option>
                                    <option value="community">Looking for community support</option>
                                    <option value="advocate">Want to become an advocate</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">What motivates you to fight?</label>
                                <textarea
                                    placeholder="Share what drives you to keep fighting..."
                                    class="w-full p-3 border-2 border-gray-200 rounded focus:border-brand outline-none transition-colors h-24 resize-none"
                                    value={formData.motivation}
                                    onInput={(e) => setFormData({...formData, motivation: (e.target as HTMLTextAreaElement).value})}
                                ></textarea>
                            </div>

                            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <p class="text-sm text-blue-800">
                                    💪 <strong>Remember:</strong> "Sometimes I feel like I'm fighting for a life I ain't got time to live." - Ron Woodroof
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-brand">Build the Community</h2>
                        <p class="text-gray-600">
                            Help us grow stronger. The more fighters we have, the more impact we can make.
                        </p>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Referral Code (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="If someone referred you, enter their code"
                                    class="w-full p-3 border-2 border-gray-200 rounded focus:border-brand outline-none transition-colors"
                                    value={formData.referralCode}
                                    onInput={(e) => setFormData({...formData, referralCode: (e.target as HTMLInputElement).value})}
                                />
                            </div>

                            {/* Achievements Preview */}
                            <div class="bg-gradient-to-br from-brand/5 to-brand/10 p-6 rounded-lg border border-brand/20">
                                <h3 class="text-lg font-bold text-brand mb-4">🏆 Achievements You Can Unlock</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {achievements.slice(0, 4).map((achievement) => (
                                        <div key={achievement.id} class="flex items-center gap-3 bg-white/50 p-3 rounded">
                                            <div class="text-2xl">{achievement.icon}</div>
                                            <div>
                                                <div class="font-semibold text-sm">{achievement.title}</div>
                                                <div class="text-xs text-gray-600">{achievement.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
                                <p class="text-sm text-red-800">
                                    ⚠️ <strong>Legal Notice:</strong> This platform provides information about experimental treatments. Always consult healthcare professionals.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button 
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    class={`
                        font-semibold py-2 px-6 rounded transition-colors
                        ${currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-brand'}
                    `}
                    disabled={currentStep === 1}
                >
                    ← Back
                </button>
                
                <div class="text-sm text-gray-500">
                    {Math.round((currentStep / steps.length) * 100)}% Complete
                </div>
                
                {currentStep === steps.length - 1 ? (
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        class={`
                            font-bold py-3 px-8 rounded transition-all duration-300
                            ${isSubmitting 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-brand text-white hover:bg-brand-accent hover:scale-105'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Joining...
                            </div>
                        ) : (
                            'Join the Fight 💪'
                        )}
                    </button>
                ) : (
                    <button 
                        onClick={handleNext}
                        class="bg-brand text-white font-bold py-3 px-8 rounded hover:bg-brand-accent transition-all duration-300 hover:scale-105"
                    >
                        Next →
                    </button>
                )}
            </div>
        </div>
    );
}