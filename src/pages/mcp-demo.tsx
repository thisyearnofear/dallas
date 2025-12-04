// MCP Demo Page - Showcase Model Context Protocol agent coordination
// Following Core Principles: CLEAN, MODULAR

import MCPAgentDashboard from "../components/MCPAgentDashboard";
import { NetworkStatus } from "../components/SharedUIComponents";

export default function MCPDemoPage() {
  return (
    <div class="min-h-screen bg-black">
      <div class="max-w-7xl mx-auto p-4">
        {/* Page Header */}
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-yellow-400 mb-2">
            🤖 MCP AGENT COORDINATION
          </h1>
          <h2 class="text-xl text-green-400 mb-4">
            Dallas Underground A.I.D.S. Treatment Network
          </h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
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
          <div class="bg-gray-900 p-6 border border-gray-600">
            <h3 class="text-lg font-bold text-blue-400 mb-3">🔧 Technical Implementation</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">MCP Protocol:</span>
                <span class="text-green-400">@modelcontextprotocol/sdk</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Agent Framework:</span>
                <span class="text-green-400">Custom TypeScript</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Coordination:</span>
                <span class="text-green-400">Real-time Multi-Agent</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Integration:</span>
                <span class="text-green-400">Solana Blockchain</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 p-6 border border-gray-600">
            <h3 class="text-lg font-bold text-purple-400 mb-3">🏆 Hackathon Innovation</h3>
            <div class="space-y-2 text-sm">
              <div class="text-gray-300">✅ First underground marketplace with autonomous agents</div>
              <div class="text-gray-300">✅ MCP-coordinated multi-agent decision making</div>
              <div class="text-gray-300">✅ Real blockchain integration with agent optimization</div>
              <div class="text-gray-300">✅ Compelling resistance narrative + AI agency themes</div>
              <div class="text-gray-300">✅ Live demonstration of agentic economy concepts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}