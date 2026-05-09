import { useState, useEffect } from "preact/hooks";

interface IncompleteFlow {
    id: string;
    title: string;
    description: string;
    cta: string;
    link: string;
    timestamp: number;
}

const STORAGE_KEY = "dbc-incomplete-flows";

export function RetryFlowBanners() {
    const [flows, setFlows] = useState<IncompleteFlow[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        // Load incomplete flows from localStorage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as IncompleteFlow[];
                // Filter out flows older than 7 days
                const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                const valid = parsed.filter(f => f.timestamp > sevenDaysAgo && !dismissed.includes(f.id));
                setFlows(valid);
            }
        } catch {
            // Ignore
        }
    }, [dismissed]);

    if (flows.length === 0) return null;

    const handleDismiss = (flowId: string) => {
        setDismissed(prev => [...prev, flowId]);
        setFlows(prev => prev.filter(f => f.id !== flowId));
        // Persist dismissal
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.filter((f: any) => f.id !== flowId)));
            }
        } catch {
            // Ignore
        }
    };

    return (
        <>
            {flows.slice(0, 1).map((flow) => (
                <div
                    key={flow.id}
                    class="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-900 border-2 border-brand/50 shadow-xl rounded-2xl p-5 z-50 animate-slideInRight"
                >
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">📝</div>
                        <div class="flex-1">
                            <h3 class="font-bold text-slate-900 dark:text-white text-sm mb-1">
                                {flow.title}
                            </h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                {flow.description}
                            </p>
                            <div class="flex gap-2">
                                <a
                                    href={flow.link}
                                    class="flex-1 bg-brand text-white font-bold py-2 px-3 rounded-lg text-xs text-center hover:bg-brand/90 transition-all"
                                >
                                    {flow.cta}
                                </a>
                                <button
                                    onClick={() => handleDismiss(flow.id)}
                                    class="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold py-2 px-3 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

// Helper to track incomplete flows
export function trackIncompleteFlow(
    flowId: string,
    title: string,
    description: string,
    cta: string,
    link: string
) {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existing = stored ? JSON.parse(stored) : [];
        const updated = existing.filter((f: any) => f.id !== flowId);
        updated.push({
            id: flowId,
            title,
            description,
            cta,
            link,
            timestamp: Date.now(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
        // Ignore
    }
}

export default RetryFlowBanners;
