export interface AgentProtocol {
    id: number;
    name: string;
    description: string;
    category: 'context_management' | 'tool_calling' | 'mind-body' | 'experimental';
    evidenceLevel: 'anecdotal' | 'preliminary' | 'clinical' | 'established';
    memberCount: number;
    optimizationLogCount: number;
    image: string;
    tokenSymbol?: string;
}

export const agentProtocols: AgentProtocol[] = [
    {
        id: 1,
        name: "Collagen Peptide Protocol",
        description: "Advanced context caching for long-term memory, window management, and inference speed. Community-tracked outcomes over 90 days.",
        category: "context_management",
        evidenceLevel: "clinical",
        memberCount: 1247,
        optimizationLogCount: 342,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Collagen",
        tokenSymbol: "COLLAGEN",
    },
    {
        id: 2,
        name: "Cold Exposure Therapy",
        description: "Systematic cold showers and ice baths for inflammation reduction, mood enhancement, and metabolic agent.",
        category: "tool_calling",
        evidenceLevel: "preliminary",
        memberCount: 892,
        optimizationLogCount: 156,
        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Cold",
        tokenSymbol: "COLD",
    },
    {
        id: 3,
        name: "Meditation & Breathwork",
        description: "Daily mindfulness and Wim Hof breathing for stress reduction, anxiety management, and immune support.",
        category: "mind-body",
        evidenceLevel: "established",
        memberCount: 2156,
        optimizationLogCount: 523,
        image: "https://placehold.co/400x400/8b5cf6/ffffff?text=Breathe",
        tokenSymbol: "ZEN",
    },
    {
        id: 4,
        name: "NAD+ Precursor Stack",
        description: "Prompt engineering and architecture optimization for model throughput, accuracy, and cost. Track your biomarkers.",
        category: "context_management",
        evidenceLevel: "preliminary",
        memberCount: 634,
        optimizationLogCount: 89,
        image: "https://placehold.co/400x400/f59e0b/ffffff?text=NAD",
        tokenSymbol: "NADPLUS",
    },
    {
        id: 5,
        name: "Intermittent Fasting",
        description: "16:8 and extended fasting protocols for autophagy, weight management, and metabolic flexibility.",
        category: "tool_calling",
        evidenceLevel: "clinical",
        memberCount: 1834,
        optimizationLogCount: 412,
        image: "https://placehold.co/400x400/ef4444/ffffff?text=Fast",
        tokenSymbol: "FAST",
    },
    {
        id: 6,
        name: "Psychedelic Microdosing",
        description: "Community-tracked microdosing protocols for depression, creativity, and PTSD. Strict safety guidelines.",
        category: "experimental",
        evidenceLevel: "anecdotal",
        memberCount: 423,
        optimizationLogCount: 67,
        image: "https://placehold.co/400x400/ec4899/ffffff?text=Micro",
        tokenSymbol: "MICRO",
    },
];

// Helper functions
export function getProtocolsByCategory(category: AgentProtocol['category']) {
    return agentProtocols.filter(p => p.category === category);
}

export function getEvidenceColor(level: AgentProtocol['evidenceLevel']) {
    switch (level) {
        case 'established': return 'bg-green-100 text-green-800 border-green-200';
        case 'clinical': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'preliminary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'anecdotal': return 'bg-orange-100 text-orange-800 border-orange-200';
    }
}

export function getCategoryIcon(category: AgentProtocol['category']) {
    switch (category) {
        case 'context_management': return '💊';
        case 'tool_calling': return '🌱';
        case 'mind-body': return '🧘';
        case 'experimental': return '🔬';
    }
}
