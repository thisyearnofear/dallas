interface Testimonial {
    id: number;
    name: string;
    quote: string;
    avatar: string;
    status: string;
    days: number;
    bgColor: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Patient #069",
        quote: "30 days became 3 years. Ron saved my life.",
        avatar: "🦸‍♂️",
        status: "Survivor",
        days: 1095,
        bgColor: "from-green-100 to-green-200"
    },
    {
        id: 2,
        name: "Patient #420",
        quote: "The system failed me. The Club didn't.",
        avatar: "💪",
        status: "Fighter",
        days: 730,
        bgColor: "from-blue-100 to-blue-200"
    },
    {
        id: 3,
        name: "Patient #138",
        quote: "Hope when there was none.",
        avatar: "🌟",
        status: "Thriving",
        days: 2190,
        bgColor: "from-purple-100 to-purple-200"
    },
    {
        id: 4,
        name: "Patient #777",
        quote: "Ron gave me time to live.",
        avatar: "⚡",
        status: "Strong",
        days: 1460,
        bgColor: "from-yellow-100 to-yellow-200"
    },
    {
        id: 5,
        name: "Patient #999",
        quote: "Fighting the good fight.",
        avatar: "🔥",
        status: "Warrior",
        days: 548,
        bgColor: "from-red-100 to-red-200"
    },
    {
        id: 6,
        name: "Patient #101",
        quote: "The club is family.",
        avatar: "❤️",
        status: "Family",
        days: 912,
        bgColor: "from-pink-100 to-pink-200"
    }
];

export function TestimonialsGrid() {
    return (
        <div class="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
            <div class="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div class="text-center mb-12">
                    <h2 class="text-4xl font-bold text-gray-dark mb-4">Club Success Stories</h2>
                    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                        Real people, real results. When the system fails, we fight back.
                    </p>
                </div>

                {/* Animated Stats Bar */}
                <div class="flex justify-center items-center gap-8 mb-12 flex-wrap">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-brand">2,847</div>
                        <div class="text-sm text-gray-600">Days Extended</div>
                    </div>
                    <div class="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-brand">6</div>
                        <div class="text-sm text-gray-600">Lives Changed</div>
                    </div>
                    <div class="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-brand">100%</div>
                        <div class="text-sm text-gray-600">Hope Restored</div>
                    </div>
                </div>

                {/* Interactive Grid */}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {testimonials.map((testimonial, index) => (
                        <div 
                            key={testimonial.id}
                            class={`
                                relative p-6 rounded-lg bg-gradient-to-br ${testimonial.bgColor}
                                border-2 border-transparent hover:border-brand
                                transform transition-all duration-500 hover:scale-105 hover:-translate-y-2
                                cursor-pointer group
                            `}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Avatar and Status */}
                            <div class="flex items-center justify-between mb-4">
                                <div class="text-4xl">{testimonial.avatar}</div>
                                <div class="text-right">
                                    <div class="text-sm font-semibold text-gray-600">{testimonial.status}</div>
                                    <div class="text-xs text-gray-500">{testimonial.days} days</div>
                                </div>
                            </div>

                            {/* Quote */}
                            <blockquote class="text-lg font-medium text-gray-800 mb-4 italic">
                                "{testimonial.quote}"
                            </blockquote>

                            {/* Name */}
                            <div class="text-right">
                                <cite class="text-sm font-bold text-brand">— {testimonial.name}</cite>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div class="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                            
                            {/* Progress Bar */}
                            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 rounded-b-lg overflow-hidden">
                                <div 
                                    class="h-full bg-brand transition-all duration-1000 group-hover:w-full"
                                    style={{ width: `${Math.min((testimonial.days / 2190) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Interactive Call to Action */}
                <div class="text-center">
                    <div class="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200 hover:border-brand transition-all duration-300">
                        <h3 class="text-2xl font-bold mb-4">Join Our Success Stories</h3>
                        <p class="text-lg text-gray-600 mb-6">
                            Your story could be next. Fight back against the system.
                        </p>
                        <div class="flex flex-wrap justify-center gap-4">
                            <button class="bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-accent transition-all duration-300 hover:scale-105">
                                💪 Join the Fight
                            </button>
                            <button class="border-2 border-brand text-brand font-bold py-3 px-6 rounded-lg hover:bg-brand hover:text-white transition-all duration-300 hover:scale-105">
                                📖 Share Your Story
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}