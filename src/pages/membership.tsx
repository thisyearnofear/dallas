import { MembershipFlow } from "../components/MembershipFlow";

export function Membership() {
    return (
        <>
            <div class="text-center mb-8">
                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-gray-dark">Join the Revolution</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Become part of something bigger. Fight for access to life-saving treatments and support others on their journey.
                </p>
            </div>

            <MembershipFlow />

            {/* Why Join Section */}
            <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div class="text-4xl mb-4">🤝</div>
                    <h3 class="text-xl font-bold mb-2 text-blue-800">Community Support</h3>
                    <p class="text-blue-700">
                        Connect with others who understand your journey. Share experiences and find hope together.
                    </p>
                </div>
                
                <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div class="text-4xl mb-4">💊</div>
                    <h3 class="text-xl font-bold mb-2 text-green-800">Access to Treatments</h3>
                    <p class="text-green-700">
                        Get information about alternative treatments that might not be available through traditional channels.
                    </p>
                </div>
                
                <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div class="text-4xl mb-4">⚡</div>
                    <h3 class="text-xl font-bold mb-2 text-purple-800">Make a Difference</h3>
                    <p class="text-purple-700">
                        Help change the system by being part of a movement that puts patients first.
                    </p>
                </div>
            </div>
        </>
    );
}