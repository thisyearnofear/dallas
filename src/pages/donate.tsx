import { SolanaTransfer } from "../components/SolanaTransfer";

export function Donate() {
    return (
        <>
            <h1 class="text-3xl font-medium mb-5">Support the Club</h1>
            <div class="flex flex-col gap-8">
                <div>
                    <p class="text-xl">
                        The Dallas Buyers Club is not just a place to get medicine. It's a community. It's a lifeline. Your support helps us continue our mission to provide access to life-saving treatments for those in need.
                    </p>
                </div>

                <div class="grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-2xl font-bold mb-4">Donate with Solana</h2>
                        <SolanaTransfer 
                            label="Support the Club"
                        />
                    </div>

                    <div class="space-y-4">
                        <h2 class="text-2xl font-bold">Why Donate?</h2>
                        <ul class="space-y-2 text-lg">
                            <li class="flex items-start">
                                <span class="text-brand mr-3">✓</span>
                                <span>Support life-saving treatment access</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-brand mr-3">✓</span>
                                <span>Help us expand to new communities</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-brand mr-3">✓</span>
                                <span>Join a movement fighting for health freedom</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-brand mr-3">✓</span>
                                <span>Instant blockchain verification</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
