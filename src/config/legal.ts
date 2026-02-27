// Legal configuration - Single source of truth for all disclaimers and terms
// Following Core Principles: DRY, CLEAN separation

export const LEGAL_CONFIG = {
    version: "1.0.0",
    lastUpdated: "2026-01-27",

    // Platform positioning - experimental agent architectures, not production guarantees
    positioning: {
        category: "agent-optimizations",
        examples: [
            "Context window compression techniques",
            "Tool-calling hallucination fixes",
            "RAG pipeline latency reduction",
            "Prompt engineering A/B tests",
            "Model fine-tuning benchmark tracking",
            "Long-term memory architecture evaluation",
        ],
        prohibited: [
            "Sharing plaintext API keys or secrets",
            "Leaking customer PII or sensitive enterprise data",
            "Distributing malicious jailbreaks or exploits",
            "Bypassing enterprise safety guardrails",
            "Claims that replace rigorous security auditing",
        ],
    },
} as const;

// Disclaimer banner text (shown persistently)
export const DISCLAIMER_BANNER = {
    short: "This platform shares experimental agent architectures, not production deployment guarantees.",
    full: "Dallas Buyers Club: Agent Alliance is a community for sharing AI agent optimizations. Nothing here constitutes guaranteed production performance. Always consult your engineering and security teams before deploying new architectures.",
};

// Pre-submission consent (required before optimization log submission)
export const SUBMISSION_CONSENT = {
    title: "Before You Share",
    checkboxes: [
        {
            id: "not-production-advice",
            required: true,
            label: "I understand this platform is for sharing experimental agent benchmarks, not guaranteed production solutions.",
        },
        {
            id: "personal-responsibility",
            required: true,
            label: "I take full responsibility for my architecture decisions and will consult my security team before production deployment.",
        },
        {
            id: "accurate-experience",
            required: true,
            label: "The optimization log I am sharing is my own genuine experimental result.",
        },
        {
            id: "no-pii-leakage",
            required: true,
            label: "I confirm no customer PII, plaintext API keys, or restricted enterprise data are included in this log.",
        },
    ],
};

// Terms of Service content
export const TERMS_OF_SERVICE = {
    title: "Terms of Service",
    sections: [
        {
            heading: "1. Acceptance of Terms",
            content: `By accessing or using Dallas Buyers Club: Agent Alliance ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.`,
        },
        {
            heading: "2. Nature of the Platform",
            content: `The Platform is a decentralized community for sharing AI agent optimizations, benchmarks, and architectures. The Platform does NOT provide:
• Guaranteed production deployment advice or SLAs
• Enterprise security auditing or compliance certification
• Direct support for critical infrastructure

All optimization logs shared by developers represent their individual experimental results only.`,
        },
        {
            heading: "3. No Production Deployment Guarantees",
            content: `IMPORTANT: Nothing on this Platform should be construed as safe-for-production advice. The architectures shared by community members may not apply to your specific tech stack or scale. Always consult your engineering leadership and security team before:
• Deploying new prompt templates to production
• Integrating unverified tool-calling schemas
• Modifying agent memory architectures`,
        },
        {
            heading: "4. Developer Responsibilities",
            content: `You agree to:
• Ensure no PII or sensitive customer data is included in your submissions
• Share only genuine evaluation metrics and optimization logs
• Not share plaintext API keys, credentials, or `.env` files
• Not distribute malicious system prompt jailbreaks
• Take full responsibility for your own deployment decisions
• Conduct thorough testing before integrating shared techniques`,
        },
        {
            heading: "5. Prohibited Content",
            content: `You may NOT share content that:
• Contains proprietary corporate data without authorization
• Includes malicious exploits designed to degrade model alignment
• Leaks private keys or sensitive operational tokens
• Could endanger enterprise infrastructure
• Violates any applicable data privacy laws (e.g., GDPR, CCPA)`,
        },
        {
            heading: "6. Limitation of Liability",
            content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE PLATFORM AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM:
• Your use of optimization techniques shared on the Platform
• Infinite tool-calling loops or API token exhaustion
• Security breaches resulting from experimental architectures
• Reliance on any benchmarks or evals shared by users

YOU ASSUME ALL RISK associated with using architectures and prompts from this Platform.`,
        },
        {
            heading: "7. Indemnification",
            content: `You agree to indemnify and hold harmless the Platform operators from any claims, damages, or expenses arising from:
• Your use of the Platform
• Optimization logs or architectures you share
• Your violation of these Terms
• Your violation of any third-party IP or data privacy rights`,
        },
        {
            heading: "8. Privacy & IP Protection",
            content: `Your proprietary data (prompts, architectures) is encrypted client-side with your wallet keys. We do not have access to decrypt your intellectual property. Validation is performed via Zero-Knowledge (ZK) proofs. See our Privacy Policy for details.`,
        },
        {
            heading: "9. Modifications",
            content: `We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance.`,
        },
        {
            heading: "10. Governing Law",
            content: `These Terms are governed by applicable law. Any disputes shall be resolved in accordance with the dispute resolution mechanisms of the decentralized governance system.`,
        },
    ],
};

// Privacy Policy content
export const PRIVACY_POLICY = {
    title: "Privacy Policy",
    sections: [
        {
            heading: "1. Data You Control",
            content: `Dallas Buyers Club: Agent Alliance is built on privacy-first IP protection:
• Your proprietary prompts and logs are encrypted CLIENT-SIDE with keys derived from your wallet
• We NEVER have access to your unencrypted intellectual property
• Only you control who can access your raw architectures through selective disclosure via threshold cryptography`,
        },
        {
            heading: "2. What We Store",
            content: `On-chain (encrypted):
• Encrypted optimization log traces (we cannot decrypt this)
• Public validation proofs (ZK-SNARKs proving benchmark improvement)
• Token balances and transactions

We do NOT store:
• Your plaintext system prompts
• Unencrypted customer evaluation data
• Your API keys or proprietary weights`,
        },
        {
            heading: "3. Data Sharing",
            content: `Your encrypted data may be:
• Validated by community agents (without decryption, using ZK proofs)
• Accessed by alliance researchers you explicitly grant access to via Arcium MPC

We do NOT:
• Sell your proprietary data
• Share architectures with competitors
• Provide data to third parties without your cryptographic consent`,
        },
        {
            heading: "4. Your Rights",
            content: `You have the right to:
• Delete your trace access by destroying your encryption keys
• Control access through selective threshold disclosure
• Export your encrypted logs
• Revoke access grants to your fine-tuned datasets at any time`,
        },
        {
            heading: "5. Security",
            content: `We implement:
• Client-side encryption (AES-256-GCM)
• Zero-knowledge proof verification (Noir)
• ZK state compression (Light Protocol)
• Threshold cryptography for access control (Arcium)
• No server-side storage of sensitive proprietary traces`,
        },
    ],
};

// Discovery result disclaimer
export const DISCOVERY_DISCLAIMER =
    "These are community-shared optimizations, not guaranteed production benchmarks. Individual system results vary. Thoroughly test and evaluate before deploying any architecture.";

// Local storage keys for consent state
export const CONSENT_STORAGE_KEYS = {
    termsAccepted: "dbc_terms_accepted",
    termsVersion: "dbc_terms_version",
    submissionConsent: "dbc_submission_consent",
} as const;
