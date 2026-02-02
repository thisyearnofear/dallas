/**
 * Fleet Intelligence Page
 * Command center for autonomous AI agents (OpenClaw)
 */

import { AgentCommandCenter } from '../components/AgentCommandCenter';
import { withErrorBoundary } from '../components/ErrorBoundaryWrapper';

function FleetPage() {
    return (
        <div class="min-h-screen py-8 md:py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div class="container mx-auto px-4">
                <AgentCommandCenter />
            </div>
        </div>
    );
}

export default withErrorBoundary(FleetPage, 'FleetPage');
