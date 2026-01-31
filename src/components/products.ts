export interface WellnessProtocol {
    id: number;
    name: string;
    description: string;
    category: 'supplement' | 'lifestyle' | 'mind-body' | 'experimental';
    evidenceLevel: 'anecdotal' | 'preliminary' | 'clinical' | 'established';
    memberCount: number;
    caseStudyCount: number;
    image: string;
    tokenSymbol?: string;
}

export const wellnessProtocols: WellnessProtocol[] = [
    {
        id: 1,
        name: "Collagen Peptide Protocol",
        description: "Daily collagen supplementation for joint health, skin elasticity, and gut healing. Community-tracked outcomes over 90 days.",
        category: "supplement",
        evidenceLevel: "clinical",
        memberCount: 1247,
        caseStudyCount: 342,
        image: "https://placehold.co/400x400/10b981/ffffff?text=Collagen",
        tokenSymbol: "COLLAGEN",
    },
    {
        id: 2,
        name: "Cold Exposure Therapy",
        description: "Systematic cold showers and ice baths for inflammation reduction, mood enhancement, and metabolic health.",
        category: "lifestyle",
        evidenceLevel: "preliminary",
        memberCount: 892,
        caseStudyCount: 156,
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
        caseStudyCount: 523,
        image: "https://placehold.co/400x400/8b5cf6/ffffff?text=Breathe",
        tokenSymbol: "ZEN",
    },
    {
        id: 4,
        name: "NAD+ Precursor Stack",
        description: "NMN and NR supplementation for cellular energy, longevity, and metabolic health. Track your biomarkers.",
        category: "supplement",
        evidenceLevel: "preliminary",
        memberCount: 634,
        caseStudyCount: 89,
        image: "https://placehold.co/400x400/f59e0b/ffffff?text=NAD",
        tokenSymbol: "NADPLUS",
    },
    {
        id: 5,
        name: "Intermittent Fasting",
        description: "16:8 and extended fasting protocols for autophagy, weight management, and metabolic flexibility.",
        category: "lifestyle",
        evidenceLevel: "clinical",
        memberCount: 1834,
        caseStudyCount: 412,
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
        caseStudyCount: 67,
        image: "https://placehold.co/400x400/ec4899/ffffff?text=Micro",
        tokenSymbol: "MICRO",
    },
];

// Helper functions
export function getProtocolsByCategory(category: WellnessProtocol['category']) {
    return wellnessProtocols.filter(p => p.category === category);
}

export function getEvidenceColor(level: WellnessProtocol['evidenceLevel']) {
    switch (level) {
        case 'established': return 'bg-green-100 text-green-800 border-green-200';
        case 'clinical': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'preliminary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'anecdotal': return 'bg-orange-100 text-orange-800 border-orange-200';
    }
}

export function getCategoryIcon(category: WellnessProtocol['category']) {
    switch (category) {
        case 'supplement': return '💊';
        case 'lifestyle': return '🌱';
        case 'mind-body': return '🧘';
        case 'experimental': return '🔬';
    }
}
