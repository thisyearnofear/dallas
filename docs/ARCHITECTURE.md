# Architecture & Agent System

## Agent Network Design

### Four Specialized Agents

Our Dallas Buyers Club operates **4 autonomous agents** registered with Edenlayer Protocol for real task execution.

#### 1. Supply Chain Intelligence Agent

Handles A.I.D.S. treatment sourcing and distribution coordination.

**Capabilities**:
```json
{
  "name": "Underground Supply Chain",
  "tools": [
    {
      "name": "check_treatment_availability",
      "description": "Check availability and pricing for A.I.D.S. treatments",
      "params": {
        "treatmentIds": ["array of strings"],
        "quantity": "number (minimum 1)"
      }
    },
    {
      "name": "negotiate_bulk_pricing",
      "description": "Negotiate bulk pricing for group purchases",
      "params": {
        "treatmentId": "string",
        "quantity": "number (minimum 2)",
        "memberCount": "number (minimum 2)"
      }
    }
  ]
}
```

#### 2. Risk Assessment Agent

Corporate AI threat monitoring and risk analysis.

**Capabilities**:
```json
{
  "name": "Network Security Analyst",
  "tools": [
    {
      "name": "assess_transaction_risk",
      "description": "Analyze risk levels for underground operations",
      "params": {
        "transactionType": "purchase | transfer | group_buy",
        "amount": "number (minimum 0)",
        "participantCount": "number (minimum 1)"
      }
    },
    {
      "name": "coordinate_emergency_response",
      "description": "Coordinate network-wide emergency response protocols",
      "params": {
        "emergencyType": "corporate_raid | supply_disruption | network_compromise",
        "severity": "number (1-10)"
      }
    }
  ]
}
```

#### 3. Community Coordination Agent

Member network management and group coordination.

**Capabilities**:
```json
{
  "name": "Community Coordinator",
  "tools": [
    {
      "name": "organize_group_purchase",
      "description": "Coordinate group purchases among network members",
      "params": {
        "treatmentIds": ["array of strings"],
        "maxParticipants": "number (2-50)",
        "timeframe": "24h | 48h | 1w"
      }
    }
  ]
}
```

#### 4. Identity Restoration Agent

A.I.D.S. treatment planning and multi-phase restoration coordination.

**Capabilities**:
```json
{
  "name": "Identity Restoration Specialist",
  "tools": [
    {
      "name": "plan_restoration_sequence",
      "description": "Create personalized multi-phase identity restoration plan",
      "params": {
        "fragmentationLevel": "number (0-100)",
        "affectedSystems": ["array of strings"],
        "timeframe": "emergency | urgent | standard | extended"
      }
    }
  ]
}
```

## Multi-Agent Workflows

### Treatment Purchase Workflow

```json
[
  {
    "agentId": "risk-agent-id",
    "operation": "tools/assess_transaction_risk",
    "params": {
      "transactionType": "purchase",
      "amount": 0.5,
      "participantCount": 1
    }
  },
  {
    "agentId": "supply-agent-id",
    "operation": "tools/check_treatment_availability",
    "parents": ["0"],
    "params": {
      "treatmentIds": ["azt_patch"],
      "quantity": 1
    }
  },
  {
    "agentId": "identity-agent-id",
    "operation": "tools/plan_restoration_sequence",
    "parents": ["0", "1"],
    "params": {
      "fragmentationLevel": 65,
      "affectedSystems": ["digital_signature", "memory_core"],
      "timeframe": "standard"
    }
  }
]
```

### Emergency Response Workflow

```json
[
  {
    "agentId": "risk-agent-id",
    "operation": "tools/coordinate_emergency_response",
    "params": {
      "emergencyType": "corporate_raid",
      "severity": 8
    }
  },
  {
    "agentId": "supply-agent-id",
    "operation": "tools/secure_supply_chain",
    "parents": ["0"],
    "params": {
      "securityLevel": "maximum",
      "redistributeInventory": true
    }
  }
]
```

## Core Architecture

### EnhancedBusinessLogic Service

**Single source of truth** for all business operations with agent coordination:

```typescript
class EnhancedBusinessLogic {
  // Transaction processing with agent coordination
  processIdentityRestoration(params): AgentResult
  
  // Risk assessment
  assessTransactionRisk(params): RiskAssessment
  
  // Treatment availability
  checkTreatmentAvailability(params): Treatment[]
  
  // Community coordination
  organizeGroupPurchase(params): GroupPurchaseResult
}
```

### State Management

**Centralized agent state** via `useAgentNetwork` hook:

```typescript
const {
  agentStatus,        // Current agent states
  coordinations,      // Active multi-agent workflows
  riskLevel,          // Current risk assessment
  availableTreatments // Inventory status
} = useAgentNetwork()
```

### UI Components

**Consolidated component system** in `SharedUIComponents.tsx`:
- Modal system for transactions and alerts
- Loading states with agent progress
- Network status indicator
- Danger level display
- Terminal interface for commands

### Wallet Integration

**Solana Web3.js integration** via `WalletContext`:
- Connect/disconnect Phantom wallet
- Sign and send real blockchain transactions
- Track transaction history
- Handle payment confirmations

## Protocol Integration

### MCP (Model Context Protocol)

Used for inter-agent communication and coordination:
- Agent discovery and registration
- Tool capability advertisement
- Request/response handling
- Error recovery and fallback strategies

### Edenlayer Protocol

Provides scalable agent orchestration:
- Agent registration and discovery
- Task execution and composition
- Real blockchain transaction triggering
- Persistent state management across agents

## Code Organization

```
agents/
├── AgentFoundation.ts       # Base agent interfaces
└── CoreAgentNetwork.ts      # 4-agent coordination system

services/
├── EnhancedBusinessLogic.ts # Business logic + agents
└── transactionHistory.ts    # Transaction persistence

components/
├── SharedUIComponents.tsx   # Consolidated UI system
└── EnhancedBlackMarketExperience.tsx  # Main UX

hooks/
└── useAgentNetwork.ts       # Agent state management

context/
└── WalletContext.tsx        # Wallet state

config/
└── solana.ts               # Solana network config
```

## Performance Optimizations

- **Parallel Agent Execution**: Multiple agents coordinate simultaneously
- **Smart Caching**: Agent decisions cached to prevent redundant processing
- **Optimized Re-renders**: State updates only trigger affected components
- **Code Splitting**: Clear module boundaries for efficient loading

## Scalability

- **New Agents**: Add specialized agents by extending base interfaces
- **New Workflows**: Compose agents for complex multi-step operations
- **Cross-System Integration**: Agents discoverable in broader Edenlayer ecosystem
- **Fault Tolerance**: Agent failures don't cascade; system degrades gracefully
