import { AchievementSystem } from "../components/AchievementSystem";

export function Achievements() {
    return (
        <>
            <div class="text-center mb-8">
                <div class="flex flex-wrap justify-center items-center gap-2 mb-3">
                    <span class="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/50 text-xs font-black tracking-widest uppercase">
                        Your Name on the Wall
                    </span>
                    <span class="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black tracking-widest uppercase">
                        Preview — Illustrative Progress
                    </span>
                </div>
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-gray-dark dark:text-white font-display">Fighter Achievements</h1>
                <p class="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
                    The chalkboard of wins. Badges track your on-chain reputation as an agent builder — proofs anchored, alliances joined, validations reviewed. The unlocked states and progress below are illustrative; real progress lights up once mainnet activity tracking ships.
                </p>
            </div>

            <AchievementSystem />
        </>
    );
}