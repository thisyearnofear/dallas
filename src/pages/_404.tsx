export function NotFound() {
    return (
        <div class="min-h-[70vh] flex flex-col items-center justify-center px-4">
            {/* Large 404 */}
            <div class="text-9xl font-black text-brand/20 mb-4 select-none">404</div>
            
            {/* Icon */}
            <div class="text-6xl mb-6">🕵️‍♂️</div>
            
            {/* Main Message */}
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 text-center">
                Page Not Found
            </h1>
            
            {/* Ron Woodroof Quote */}
            <blockquote class="max-w-2xl mx-auto mb-8">
                <p class="text-xl md:text-2xl text-slate-600 dark:text-slate-400 italic text-center leading-relaxed">
                    "Sometimes I feel like I'm fighting for a life I ain't got time to live."
                </p>
                <footer class="text-center mt-3">
                    <cite class="text-sm text-slate-500 dark:text-slate-500 not-italic font-medium">
                        — Ron Woodroof, Dallas Buyers Club
                    </cite>
                </footer>
            </blockquote>
            
            {/* Context Message */}
            <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
                Looks like you've wandered into uncharted territory, partner. 
                This page doesn't exist in our underground network.
            </p>
            
            {/* Action Buttons */}
            <div class="flex flex-col sm:flex-row gap-4">
                <a
                    href="/"
                    class="bg-brand hover:bg-brand-accent text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg text-center"
                >
                    🏠 Go Home
                </a>
                <a
                    href="/experiences"
                    class="border-2 border-brand text-brand hover:bg-brand hover:text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 text-center"
                >
                    🌐 Explore Communities
                </a>
                <a
                    href="/links"
                    class="border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-brand hover:text-brand font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 text-center"
                >
                    🔗 Resources
                </a>
            </div>
            
            {/* Easter Egg */}
            <p class="mt-12 text-sm text-slate-400 dark:text-slate-600 text-center">
                Error Code: DBC-404 • "The system failed to find your page. We won't."
            </p>
        </div>
    );
}
