// MCP Demo Page - Showcase Model Context Protocol agent coordination
// Following Core Principles: CLEAN, MODULAR

import MCPAgentDashboard from "../components/MCPAgentDashboard";
import { NetworkStatus } from "../components/SharedUIComponents";

export default function MCPDemoPage() {
  return (
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div class="max-w-7xl mx-auto p-4">
        {/* Page Header */}
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
            🤖 MCP AGENT COORDINATION
          </h1>
          <h2 class="text-xl text-green-600 dark:text-green-400 mb-4">
            Dallas Underground A.I.D.S. Treatment Network
          </h2>
          <p class="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Real-time demonstration of Model Context Protocol integration with autonomous agents.
            Watch as Supply Chain, Risk Assessment, Community Coordination, and Identity Restoration 
            agents work together to manage underground operations.
          </p>
        </div>

        {/* Network Status */}
        <div class="mb-6">
          <NetworkStatus />
        </div>

        {/* Main MCP Dashboard */}
        <MCPAgentDashboard />

        {/* Technical Information */}
        <div class="mt-8 grid md:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">🔧 Technical Implementation</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">MCP Protocol:</span>
                <span class="text-green-600 dark:text-green-400 font-mono">@modelcontextprotocol/sdk</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Agent Framework:</span>
                <span class="text-green-600 dark:text-green-400 font-mono">Custom TypeScript</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Coordination:</span>
                <span class="text-green-600 dark:text-green-400 font-mono">Real-time Multi-Agent</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Integration:</span>
                <span class="text-green-600 dark:text-green-400 font-mono">Solana Blockchain</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <h3 class="text-lg font-bold text-purple-600 dark:text-purple-400 mb-3">🏆 Hackathon Innovation</h3>
            <div class="space-y-2 text-sm">
              <div class="text-slate-700 dark:text-slate-300">✅ First underground marketplace with autonomous agents</div>
              <div class="text-slate-700 dark:text-slate-300">✅ MCP-coordinated multi-agent decision making</div>
              <div class="text-slate-700 dark:text-slate-300">✅ Real blockchain integration with agent optimization</div>
              <div class="text-slate-700 dark:text-slate-300">✅ Compelling resistance narrative + AI agency themes</div>
              <div class="text-slate-700 dark:text-slate-300">✅ Live demonstration of agentic economy concepts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}