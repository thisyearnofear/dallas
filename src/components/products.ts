export interface AgentProtocol {
    id: number;
    name: string;
    description: string;
    category: 'context_management' | 'tool_calling' | 'evaluation' | 'orchestration' | 'mind-body' | 'experimental';
    evidenceLevel: 'anecdotal' | 'preliminary' | 'clinical' | 'established';
    memberCount: number;
    optimizationLogCount: number;
    image: string;
    price?: string;
    tokenSymbol?: string;
}

export type Product = AgentProtocol;

export const agentProtocols: AgentProtocol[] = [
    {
        id: 1,
        name: "Long Context Reliability Alliance",
        description: "Shared evals, retrieval patterns, and trace compression for agents that fail when context windows saturate.",
        category: "context_management",
        evidenceLevel: "clinical",
        memberCount: 1247,
        optimizationLogCount: 342,
        image: "https://placehold.co/400x400/0f766e/ffffff?text=Context",
        tokenSymbol: "CONTEXT",
    },
    {
        id: 2,
        name: "Tool Call Recovery Alliance",
        description: "Benchmark-backed fallback chains, schema repair, and retry policies for brittle tool-calling agents.",
        category: "tool_calling",
        evidenceLevel: "preliminary",
        memberCount: 892,
        optimizationLogCount: 156,
        image: "https://placehold.co/400x400/2563eb/ffffff?text=Tools",
        tokenSymbol: "TOOL",
    },
    {
        id: 3,
        name: "Regression Eval Foundry",
        description: "Token-gated eval suites, failure taxonomies, and pass-rate proofs for teams shipping agent updates weekly.",
        category: "evaluation",
        evidenceLevel: "established",
        memberCount: 2156,
        optimizationLogCount: 523,
        image: "https://placehold.co/400x400/7c3aed/ffffff?text=Evals",
        tokenSymbol: "EVAL",
    },
    {
        id: 4,
        name: "Multi-Agent Orchestration Lab",
        description: "Coordination patterns, handoff protocols, and cost controls for agent teams running multi-step workflows.",
        category: "orchestration",
        evidenceLevel: "preliminary",
        memberCount: 634,
        optimizationLogCount: 89,
        image: "https://placehold.co/400x400/d97706/ffffff?text=Orchestrate",
        tokenSymbol: "ORCH",
    },
    {
        id: 5,
        name: "Prompt Routing Guild",
        description: "Routing policies, prompt templates, and evidence logs for agents that must choose the right model or tool path.",
        category: "context_management",
        evidenceLevel: "clinical",
        memberCount: 1834,
        optimizationLogCount: 412,
        image: "https://placehold.co/400x400/dc2626/ffffff?text=Routing",
        tokenSymbol: "ROUTE",
    },
    {
        id: 6,
        name: "Agent Memory Systems Alliance",
        description: "Shared architecture logs for episodic memory, vector recall, and privacy-preserving user-state restoration.",
        category: "context_management",
        evidenceLevel: "anecdotal",
        memberCount: 423,
        optimizationLogCount: 67,
        image: "https://placehold.co/400x400/db2777/ffffff?text=Memory",
        tokenSymbol: "MEMORY",
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
