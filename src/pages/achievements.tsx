import { AchievementSystem } from "../components/AchievementSystem";

export function Achievements() {
    return (
        <>
            <div class="text-center mb-8">
                <span class="inline-block px-3 py-1 mb-4 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black tracking-widest uppercase">
                    Preview — Illustrative Progress
                </span>
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-gray-dark dark:text-white font-display">Fighter Achievements</h1>
                <p class="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
                    The achievement system shows a preview of the badges and progression that will unlock once real on-chain activity tracking ships. Numbers, leaderboards, and unlocked states below are examples — connect a wallet after mainnet launch to earn real progress.
                </p>
            </div>

            <AchievementSystem />
        </>
    );
}