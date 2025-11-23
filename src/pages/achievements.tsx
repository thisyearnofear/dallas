import { AchievementSystem } from "../components/AchievementSystem";

export function Achievements() {
    return (
        <>
            <div class="text-center mb-8">
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-gray-dark">Fighter Achievements</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Track your progress, unlock achievements, and see how you're making a difference in the community.
                </p>
            </div>

            <AchievementSystem />
        </>
    );
}