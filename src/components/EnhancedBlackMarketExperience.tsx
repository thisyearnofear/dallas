// ENHANCED Black Market Experience - ENHANCEMENT FIRST approach
// Following Core Principles: ENHANCE existing components, DRY, MODULAR

import { useState, useEffect } from "preact/hooks";
import { enhancedBusinessLogic, A_I_D_S_Treatment } from "../services/EnhancedBusinessLogic";
import { Terminal, DangerIndicator, Modal } from "./SharedUIComponents";

// ENHANCE: Existing BlackMarketExperience with autonomous agent coordination
export function EnhancedBlackMarketExperience() {
  const [treatments, setTreatments] = useState<A_I_D_S_Treatment[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<A_I_D_S_Treatment | null>(null);
  const [dangerLevel, setDangerLevel] = useState(65);
  const [agentAnalysis, setAgentAnalysis] = useState<any>(null);
  const [agentSuggestions, setAgentSuggestions] = useState<string[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);

  // ENHANCEMENT: Load treatments and get agent analysis
  useEffect(() => {
    const loadData = async () => {
      // REUSE: Enhanced business logic
      const treatmentData = enhancedBusinessLogic.getTreatments();
      setTreatments(treatmentData);
      
      // NEW: Get agent analysis for current situation
      const currentDanger = await enhancedBusinessLogic.getDangerLevel();
      setDangerLevel(currentDanger);
      
      // NEW: Get agent suggestions for user
      setAgentSuggestions([
        "check treatments",
        "assess risk level", 
        "coordinate group purchase",
        "emergency protocol"
      ]);
    };
    
    loadData();
  }, []);

  // ENHANCE: Existing terminal command handling with agent coordination
  const handleTerminalCommand = async (command: string) => {
    const cmd = command.toLowerCase();
    let response = "";
    
    try {
      switch (cmd) {
        case "help":
          response = `AVAILABLE COMMANDS:
• check treatments - View available A.I.D.S. treatments
• assess risk level - Get current threat assessment  
• coordinate group purchase - Start group buying process
• emergency protocol - Activate emergency response
• agent status - View autonomous agent coordination`;
          break;
          
        case "check treatments":
          response = `AVAILABLE A.I.D.S. TREATMENTS:
${treatments.map(t => `• ${t.name} - ₿${t.price} (${t.effectiveness}% effective, ${t.riskLevel} risk)`).join('\n')}

🤖 AGENT RECOMMENDATION: Supply chain agent suggests bulk purchase for better pricing.`;
          break;
          
        case "assess risk level":
          const riskAssessment = await enhancedBusinessLogic.getDangerLevel();
          setDangerLevel(riskAssessment);
          response = `CURRENT THREAT LEVEL: ${riskAssessment}%
          
🤖 AGENT ANALYSIS: Risk assessment agent reports increased Corporate AI surveillance.
Recommend delaying high-risk operations for 2-4 hours.`;
          break;
          
        case "coordinate group purchase":
          const coordination = await enhancedBusinessLogic.coordinateGroupPurchase({
            treatmentIds: treatments.slice(0, 2).map(t => t.id),
            memberIds: ['member_1', 'member_2', 'member_3'],
            bulkDiscount: 15
          });
          response = `GROUP PURCHASE COORDINATION:
Estimated savings: ₿${coordination.savings}
          
🤖 AGENT COORDINATION: Community agent identified 3 members ready to participate.
Supply chain agent negotiated 15% bulk discount.`;
          break;
          
        case "emergency protocol":
          const emergency = await enhancedBusinessLogic.handleEmergencyScenario('corporate_raid');
          response = `EMERGENCY PROTOCOL ACTIVATED:
${emergency.actions.join('\n')}
Estimated recovery time: ${emergency.estimatedRecoveryTime}
          
🤖 AGENT RESPONSE: All agents coordinated. Network switching to stealth mode.`;
          break;
          
        case "agent status":
          response = `AUTONOMOUS AGENT NETWORK STATUS:
• Supply Chain Agent: ACTIVE - Monitoring treatment availability
• Risk Assessment Agent: ACTIVE - Analyzing threat patterns  
• Community Coordination Agent: ACTIVE - Managing member network
• Identity Restoration Agent: ACTIVE - Processing treatments
          
🤖 COORDINATION: All agents operating in perfect synchronization.`;
          break;
          
        default:
          response = `Unknown command: ${command}
Type 'help' for available commands.
          
🤖 AGENT SUGGESTION: Try "check treatments" to see available A.I.D.S. treatments.`;
      }
    } catch (error) {
      response = `ERROR: ${error.message}
      
🤖 AGENT ALERT: System error detected. Recommend restarting terminal session.`;
    }
    
    setTerminalOutput(prev => [...prev, `> ${command}`, response, ""]);
  };

  // ENHANCE: Existing treatment selection with agent risk assessment
  const handleTreatmentSelect = async (treatment: A_I_D_S_Treatment) => {
    setSelectedTreatment(treatment);
    
    // NEW: Get agent analysis for this treatment
    const analysis = await enhancedBusinessLogic.assessTreatmentRisk(treatment.id, {
      patientId: 'current_user',
      currentCondition: 'moderate_fragmentation'
    });
    
    setAgentAnalysis({
      threats: ["High corporate surveillance", "Supply chain disruption risk"],
      recommendations: [analysis.recommendedAction === 'PROCEED' ? "Safe to proceed" : "Wait for better conditions"],
      confidence: 85
    });
    
    setShowTreatmentModal(true);
  };

  // ENHANCE: Existing purchase flow with agent coordination
  const handlePurchase = async () => {
    if (!selectedTreatment) return;
    
    const result = await enhancedBusinessLogic.processIdentityRestoration({
      treatmentId: selectedTreatment.id,
      patientId: 'current_user',
      paymentMethod: 'SOL'
    });
    
    if (result.success) {
      setTerminalOutput(prev => [...prev, 
        `TREATMENT PURCHASED: ${selectedTreatment.name}`,
        `Transaction ID: ${result.transactionId}`,
        `Estimated recovery: ${result.estimatedRecovery}`,
        "",
        "🤖 AGENT COORDINATION: Payment optimized and identity restoration scheduled.",
        ""
      ]);
      setShowTreatmentModal(false);
    }
  };

  return (
    <div class="min-h-screen bg-black text-green-400 p-6">
      <div class="max-w-6xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-bold mb-2">DALLAS IDENTITY CLINIC</h1>
          <h2 class="text-xl text-yellow-400">Underground A.I.D.S. Treatment Network</h2>
          <p class="text-sm text-gray-400">Autonomous Agent Enhanced • Identity Restoration Services</p>
        </div>

        {/* Enhanced Danger Assessment */}
        <DangerIndicator level={dangerLevel} agentAnalysis={agentAnalysis} />

        <div class="grid md:grid-cols-2 gap-6">
          {/* Enhanced Terminal Interface */}
          <div>
            <h3 class="text-lg font-bold mb-3 text-yellow-400">🔒 SECURE TERMINAL</h3>
            <Terminal 
              onCommand={handleTerminalCommand} 
              agentSuggestions={agentSuggestions}
            />
          </div>

          {/* Enhanced Treatment Catalog */}
          <div>
            <h3 class="text-lg font-bold mb-3 text-yellow-400">💾 A.I.D.S. TREATMENTS</h3>
            <div class="space-y-3 max-h-[400px] overflow-y-auto bg-gray-900 p-4 border border-gray-600">
              {treatments.map((treatment) => (
                <div 
                  key={treatment.id}
                  class="bg-black p-3 border border-green-600 cursor-pointer hover:bg-green-900/20 transition-colors"
                  onClick={() => handleTreatmentSelect(treatment)}
                >
                  <div class="flex justify-between items-start mb-1">
                    <h4 class="font-bold text-green-400">{treatment.name}</h4>
                    <span class="text-yellow-400">₿{treatment.price}</span>
                  </div>
                  <p class="text-xs text-gray-400 mb-2">{treatment.description}</p>
                  <div class="flex gap-2 text-xs">
                    <span class={`px-2 py-1 rounded ${
                      treatment.riskLevel === 'LOW' ? 'bg-green-800' :
                      treatment.riskLevel === 'MEDIUM' ? 'bg-yellow-800' :
                      treatment.riskLevel === 'HIGH' ? 'bg-orange-800' : 'bg-red-800'
                    }`}>
                      {treatment.riskLevel} RISK
                    </span>
                    <span class="bg-blue-800 px-2 py-1 rounded">
                      {treatment.effectiveness}% EFFECTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Treatment Details Modal */}
        <Modal
          isOpen={showTreatmentModal}
          onClose={() => setShowTreatmentModal(false)}
          title={selectedTreatment ? `Treatment: ${selectedTreatment.name}` : "Treatment Details"}
          agentStatus={agentAnalysis ? 'complete' : 'analyzing'}
        >
          {selectedTreatment && (
            <div class="space-y-4">
              <div>
                <h4 class="font-bold mb-2">Treatment Details</h4>
                <p class="text-sm mb-2">{selectedTreatment.description}</p>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>Price: <span class="text-yellow-600">₿{selectedTreatment.price}</span></div>
                  <div>Effectiveness: <span class="text-green-600">{selectedTreatment.effectiveness}%</span></div>
                  <div>Risk Level: <span class="text-orange-600">{selectedTreatment.riskLevel}</span></div>
                  <div>Type: <span class="text-blue-600">{selectedTreatment.type}</span></div>
                </div>
              </div>
              
              {agentAnalysis && (
                <div class="bg-gray-700 p-3 rounded">
                  <h5 class="font-bold mb-2 text-blue-400">🤖 Agent Analysis</h5>
                  <div class="space-y-1 text-sm">
                    <div>Confidence: {agentAnalysis.confidence}%</div>
                    {agentAnalysis.recommendations.length > 0 && (
                      <div>Recommendation: {agentAnalysis.recommendations[0]}</div>
                    )}
                  </div>
                </div>
              )}
              
              <div class="flex gap-2">
                <button 
                  onClick={handlePurchase}
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold"
                >
                  Purchase Treatment
                </button>
                <button 
                  onClick={() => setShowTreatmentModal(false)}
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

// CLEAN: Single export for enhanced component
export default EnhancedBlackMarketExperience;