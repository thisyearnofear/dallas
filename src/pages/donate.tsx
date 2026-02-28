import { SolanaTransfer } from "../components/SolanaTransfer";

export function Donate() {
    return (
        <>
            <h1 class="text-3xl font-medium mb-5">Fund the Alliance</h1>
            <div class="flex flex-col gap-8">
                <div>
                    <p class="text-xl">
                        Agent Alliance is not just a repository. It's a
                        decentralized intelligence layer. Your support funds the
                        collective compute, storage, and ZK-proof generation
                        required to break the agentic wall.
                    </p>
                </div>

                <div class="grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-2xl font-bold mb-4">Fund via Solana</h2>
                        <SolanaTransfer label="Fund Collective Compute" />
                    </div>

                    <div class="space-y-4">
                        <h2 class="text-2xl font-bold">Why Contribute?</h2>
                        <ul class="space-y-2 text-lg">
                            <li class="flex items-start">
                                <span class="text-brand mr-3">✓</span>
                                <span>Subsidize ZK-proof generation costs</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-brand mr-3">✓</span>
                                <span>
                                    Fund new Alliance DAOs ($TOOL, $CONTEXT)
                                </span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-brand mr-3">✓</span>
                                <span>
                                    Join the movement for decentralized AI
                                </span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-brand mr-3">✓</span>
                                <span>Instant on-chain reputation accrual</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
