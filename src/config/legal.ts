// Legal configuration - Single source of truth for all disclaimers and terms
// Following Core Principles: DRY, CLEAN separation

export const LEGAL_CONFIG = {
  version: '1.0.0',
  lastUpdated: '2026-01-27',
  
  // Platform positioning - wellness experiments, not medical treatment
  positioning: {
    category: 'wellness-experiments',
    examples: [
      'Collagen supplementation for 30 days',
      'Cold exposure protocols',
      'Sleep optimization experiments', 
      'Dietary interventions (intermittent fasting, elimination diets)',
      'Exercise regimen tracking',
      'Mindfulness and stress management',
    ],
    prohibited: [
      'Prescription medication advice',
      'Controlled substance protocols',
      'Diagnostic claims',
      'Treatment for serious medical conditions',
      'Claims that replace professional medical care',
    ],
  },
} as const;

// Disclaimer banner text (shown persistently)
export const DISCLAIMER_BANNER = {
  short: 'This platform shares wellness experiments, not medical advice.',
  full: 'Dallas Buyers Club is a community for sharing personal wellness experiences. Nothing here constitutes medical advice. Always consult a healthcare professional before making health decisions.',
};

// Pre-submission consent (required before case study submission)
export const SUBMISSION_CONSENT = {
  title: 'Before You Share',
  checkboxes: [
    {
      id: 'not-medical-advice',
      required: true,
      label: 'I understand this platform is for sharing personal wellness experiments, not medical advice.',
    },
    {
      id: 'personal-responsibility',
      required: true,
      label: 'I take full responsibility for my health decisions and will consult professionals for medical concerns.',
    },
    {
      id: 'accurate-experience',
      required: true,
      label: 'The experience I am sharing is my own genuine experience.',
    },
    {
      id: 'age-verification',
      required: true,
      label: 'I am 18 years of age or older.',
    },
  ],
};

// Terms of Service content
export const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  sections: [
    {
      heading: '1. Acceptance of Terms',
      content: `By accessing or using Dallas Buyers Club ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.`,
    },
    {
      heading: '2. Nature of the Platform',
      content: `The Platform is a decentralized community for sharing personal wellness experiences and experiments. The Platform does NOT provide:
• Medical advice, diagnosis, or treatment
• Recommendations for prescription medications
• Professional healthcare services

All content shared by users represents their personal experiences only.`,
    },
    {
      heading: '3. No Medical Advice',
      content: `IMPORTANT: Nothing on this Platform should be construed as medical advice. The experiences shared by community members are anecdotal and may not apply to your situation. Always consult a qualified healthcare provider before:
• Starting any new supplement or wellness protocol
• Making changes to existing treatments
• Addressing any health concerns`,
    },
    {
      heading: '4. User Responsibilities',
      content: `You agree to:
• Be 18 years of age or older
• Share only your own genuine experiences
• Not share information about controlled substances
• Not make claims that could be interpreted as medical advice
• Take full responsibility for your own health decisions
• Consult healthcare professionals for medical concerns`,
    },
    {
      heading: '5. Prohibited Content',
      content: `You may NOT share content that:
• Provides or solicits advice about prescription medications
• Involves controlled or illegal substances
• Makes diagnostic or treatment claims
• Could endanger others' health
• Violates any applicable laws`,
    },
    {
      heading: '6. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE PLATFORM AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM:
• Your use of information shared on the Platform
• Health decisions you make based on community content
• Any adverse outcomes from wellness experiments
• Reliance on any content shared by users

YOU ASSUME ALL RISK associated with using information from this Platform.`,
    },
    {
      heading: '7. Indemnification',
      content: `You agree to indemnify and hold harmless the Platform operators from any claims, damages, or expenses arising from:
• Your use of the Platform
• Content you share
• Your violation of these Terms
• Your violation of any third-party rights`,
    },
    {
      heading: '8. Privacy & Data',
      content: `Your data is encrypted client-side with your wallet keys. We do not have access to decrypt your health information. See our Privacy Policy for details on data handling.`,
    },
    {
      heading: '9. Modifications',
      content: `We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance.`,
    },
    {
      heading: '10. Governing Law',
      content: `These Terms are governed by applicable law. Any disputes shall be resolved in accordance with the dispute resolution mechanisms of the decentralized governance system.`,
    },
  ],
};

// Privacy Policy content  
export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  sections: [
    {
      heading: '1. Data You Control',
      content: `Dallas Buyers Club is built on privacy-first principles:
• Your health data is encrypted CLIENT-SIDE with keys derived from your wallet
• We NEVER have access to your unencrypted health information
• Only you control who can access your data through selective disclosure`,
    },
    {
      heading: '2. What We Store',
      content: `On-chain (encrypted):
• Encrypted case study data (we cannot decrypt this)
• Public validation proofs
• Token balances and transactions

We do NOT store:
• Your real identity
• Unencrypted health information
• Your IP address or location`,
    },
    {
      heading: '3. Data Sharing',
      content: `Your encrypted data may be:
• Validated by community validators (without decryption, using ZK proofs)
• Accessed by parties you explicitly grant access to via threshold decryption

We do NOT:
• Sell your data
• Share data with advertisers
• Provide data to third parties without your cryptographic consent`,
    },
    {
      heading: '4. Your Rights',
      content: `You have the right to:
• Delete your data by destroying your encryption keys
• Control access through selective disclosure
• Export your encrypted data
• Revoke access grants at any time`,
    },
    {
      heading: '5. Security',
      content: `We implement:
• Client-side encryption (AES-256-GCM)
• Zero-knowledge proof verification
• Threshold cryptography for access control
• No server-side storage of sensitive data`,
    },
  ],
};

// Discovery result disclaimer
export const DISCOVERY_DISCLAIMER = 
  'These are community-shared experiences, not medical recommendations. Individual results vary. Consult a healthcare professional before trying any protocol.';

// Local storage keys for consent state
export const CONSENT_STORAGE_KEYS = {
  termsAccepted: 'dbc_terms_accepted',
  termsVersion: 'dbc_terms_version',
  submissionConsent: 'dbc_submission_consent',
} as const;
