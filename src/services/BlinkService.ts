/**
 * BlinkService - Solana Actions & Blinks integration
 * 
 * Enables the creation of shareable blockchain links (Blinks) for 
 * key DBC actions, facilitating effortless participation in the 
 * health sovereignty movement.
 * 
 * Core Principles:
 * - ACCESSIBILITY: Blockchain interactions from any link.
 * - AGENTIC-FRIENDLY: Standardized Action APIs for autonomous agents.
 * - PRIVACY-FIRST: Metadata is public, data remains encrypted.
 */

import { SOLANA_CONFIG } from '../config/solana';

export interface ActionMetadata {
    icon: string;
    label: string;
    title: string;
    description: string;
    links?: {
        actions: Array<{
            label: string;
            href: string;
            parameters?: Array<{
                name: string;
                label: string;
            }>;
        }>;
    };
}

class BlinkService {
    private baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dallas.network';

    /**
     * Generate a Blink URL for a specific action
     */
    generateBlink(actionPath: string): string {
        const actionUrl = `${this.baseUrl}/api/actions/${actionPath}`;
        return `solana-action:${actionUrl}`;
    }

    /**
     * Get Action Metadata for 'Validate Case Study'
     */
    getValidationAction(caseStudyId: string): ActionMetadata {
        return {
            title: "Confirm Truth: Validate Case Study",
            icon: "https://dallas.network/icons/validate.png",
            label: "Validate",
            description: `Participate as a validator for Case Study #${caseStudyId.slice(0, 8)}. Verify the ZK-proofs and earn DBC rewards.`,
            links: {
                actions: [
                    {
                        label: "Verify Proofs",
                        href: `${this.baseUrl}/api/actions/validate?id=${caseStudyId}`,
                    }
                ]
            }
        };
    }

    /**
     * Get Action Metadata for 'Join Community'
     */
    getJoinAction(communityId: string): ActionMetadata {
        return {
            title: "Join local Resistance",
            icon: "https://dallas.network/icons/join.png",
            label: "Support",
            description: "Contribute DBC tokens to support this protocol research and gain access to private data shares.",
            links: {
                actions: [
                    {
                        label: "Join & Support",
                        href: `${this.baseUrl}/api/actions/join?id=${communityId}`,
                        parameters: [
                            {
                                name: "amount",
                                label: "DBC Amount to Stake"
                            }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Get Action Metadata for 'Biometric Sync'
     */
    getBiometricSyncAction(): ActionMetadata {
        return {
            title: "🧬 Biometric Ingestion",
            icon: "https://dallas.network/icons/sync.png",
            label: "Sync",
            description: "Securely sync your wearable data to the DBC network using ZK-Compression.",
            links: {
                actions: [
                    {
                        label: "Start Sync",
                        href: `${this.baseUrl}/api/actions/sync`
                    }
                ]
            }
        };
    }
}

export const blinkService = new BlinkService();
export default blinkService;
