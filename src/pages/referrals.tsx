import { ReferralSystem } from "../components/ReferralSystem";

export function Referrals() {
    return (
        <>
            <div class="text-center mb-8">
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-gray-dark">Spread Hope</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Help others find the treatments they need. Every person you refer could be a life saved.
                </p>
            </div>

            <ReferralSystem />

            {/* Impact Stories */}
            <div class="mt-16 bg-gradient-to-r from-brand/90 to-brand text-white p-8 rounded-lg">
                <h2 class="text-3xl font-bold mb-6 text-center">The Impact of Sharing</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="text-4xl mb-2">👥</div>
                        <div class="text-2xl font-bold">420+</div>
                        <div class="text-sm opacity-75">Members Referred</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl mb-2">💊</div>
                        <div class="text-2xl font-bold">1,200+</div>
                        <div class="text-sm opacity-75">Treatment Access Facilitated</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl mb-2">❤️</div>
                        <div class="text-2xl font-bold">∞</div>
                        <div class="text-sm opacity-75">Lives Touched</div>
                    </div>
                </div>
                <p class="text-center mt-6 text-lg opacity-90">
                    "The best way to find yourself is to lose yourself in the service of others." - Every referral creates ripples of hope.
                </p>
            </div>
        </>
    );
}