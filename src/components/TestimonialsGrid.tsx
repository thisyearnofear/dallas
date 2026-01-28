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
        <div class="py-16 transition-colors duration-300">
            <div class="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div class="text-center mb-12">
                    <h2 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">Club Success Stories</h2>
                    <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        Real people, real results. When the system fails, we fight back.
                    </p>
                </div>

                {/* Animated Stats Bar */}
                <div class="flex justify-center items-center gap-10 mb-16 flex-wrap bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div class="text-center">
                        <div class="text-3xl font-black text-brand">2,847</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Days Extended</div>
                    </div>
                    <div class="w-1.5 h-1.5 bg-brand/30 rounded-full hidden sm:block"></div>
                    <div class="text-center">
                        <div class="text-3xl font-black text-brand">647+</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Lives Changed</div>
                    </div>
                    <div class="w-1.5 h-1.5 bg-brand/30 rounded-full hidden sm:block"></div>
                    <div class="text-center">
                        <div class="text-3xl font-black text-brand">100%</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Hope Restored</div>
                    </div>
                </div>

                {/* Interactive Grid */}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {testimonials.map((testimonial, index) => (
                        <div 
                            key={testimonial.id}
                            class={`
                                relative p-8 rounded-2xl bg-gradient-to-br ${testimonial.bgColor} dark:from-slate-800 dark:to-slate-900
                                border-2 border-transparent hover:border-brand
                                transform transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1
                                cursor-pointer group shadow-sm hover:shadow-xl
                            `}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Avatar and Status */}
                            <div class="flex items-center justify-between mb-6">
                                <div class="text-5xl bg-white/50 dark:bg-white/10 p-3 rounded-xl shadow-inner">{testimonial.avatar}</div>
                                <div class="text-right">
                                    <div class="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-brand">{testimonial.status}</div>
                                    <div class="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{testimonial.days} days</div>
                                </div>
                            </div>

                            {/* Quote */}
                            <blockquote class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 italic leading-relaxed">
                                "{testimonial.quote}"
                            </blockquote>

                            {/* Name */}
                            <div class="text-right pt-4 border-t border-black/5 dark:border-white/5">
                                <cite class="text-sm font-black text-brand uppercase tracking-widest not-italic">— {testimonial.name}</cite>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div class="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                            
                            {/* Progress Bar */}
                            <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-black/5 dark:bg-white/5 rounded-b-2xl overflow-hidden">
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
                    <div class="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 hover:border-brand/30 transition-all duration-500">
                        <h3 class="text-3xl font-black mb-4 text-slate-900 dark:text-white uppercase tracking-tighter">Join Our Success Stories</h3>
                        <p class="text-lg text-slate-600 dark:text-slate-400 mb-10 font-medium max-w-xl mx-auto">
                            Your story could be next. Fight back against the system and reclaim your health freedom.
                        </p>
                        <div class="flex flex-wrap justify-center gap-6">
                            <button class="bg-brand text-white font-black py-4 px-10 rounded-xl hover:bg-brand-accent transition-all transform hover:scale-105 shadow-lg uppercase tracking-widest text-xs">
                                💪 Join the Fight
                            </button>
                            <button class="border-2 border-brand text-brand font-black py-4 px-10 rounded-xl hover:bg-brand hover:text-white transition-all transform hover:scale-105 shadow-md uppercase tracking-widest text-xs">
                                📖 Share Your Story
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}