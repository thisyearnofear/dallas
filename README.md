# Dallas Buyers Club: Autonomous A.I.D.S. Network

**Submission for NullShot Hacks**  
*Underground marketplace where autonomous agents coordinate real Solana transactions to fight Identity Disintegration.*

---

## 🎯 The Concept

A cyberpunk evolution of the Dallas Buyers Club: an underground resistance network fighting corporate AI control through identity restoration algorithms. 

In this world, **A.I.D.S.** stands for **Autonomous Identity Disintegration Syndrome** - a condition where digital identities fragment and dissolve. Ron Woodroof operates a node in the network, using autonomous agents to coordinate the distribution of forbidden "treatment" algorithms.

**The Twist**: Users participate in a **functional agentic economy** where AI agents coordinate real value transfer on the Solana blockchain.

## 🚀 Quick Start

**Live Demo**: https://dallasbuyersclub.vercel.app

**Local Development**:
```bash
# 1. Install dependencies
npm install

# 2. Start the underground network interface
npm run dev

# 3. Visit http://localhost:5173
# 4. Connect Phantom wallet
# 5. Type "help" in the terminal or click "Purchase" to watch agents coordinate
```

**Running Tests**:
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode for development
```

## ✨ Key Features

- **🤖 Functional Agentic Economy**: 4 core autonomous agents (Supply, Risk, Community, Identity) coordinate operations in real-time.
- **💸 Real Solana Transactions**: Agents don't just simulate; they execute actual value transfers on devnet/mainnet.
- **🧠 Dual-Protocol Coordination**: Integrates **MCP** (Model Context Protocol) and **Edenlayer** for advanced task composition.
- **🛡️ Dynamic Risk Assessment**: Real-time threat monitoring adjusts pricing and availability based on "corporate surveillance" levels.
- **📟 Immersive Terminal Interface**: Retro-cyberpunk UI that feels like hacking into a 1991 resistance network.

## 🏗️ Technical Architecture

This project is built on a clean, modular architecture promoting separation of concerns:

- **Frontend**: Preact + TypeScript + Tailwind CSS
- **Blockchain**: Solana (Web3.js) for real transaction execution
- **Agent System**: 
  - `CoreAgentNetwork`: Centralized coordination engine
  - `EdenlayerTaskComposer`: Complex workflow composition
  - `AgentMCPIntegration`: Standardized protocol for agent communication
- **State Management**: React Context + Custom Hooks (`useAgentNetwork`)

### Project Structure

```
src/
├── agents/              # Autonomous coordination logic
├── services/            # Business logic & Edenlayer integration
├── components/          # Consolidated UI components
├── hooks/               # Centralized state management
├── context/             # Wallet & Global state
└── pages/               # Application routes
```

## 📜 The Story: A.I.D.S. Theme

We evolved the narrative to **Autonomous Identity Disintegration Syndrome** to respect the original history while creating a relevant cyberpunk metaphor:

- **The Crisis**: Digital identities fragment, wallets corrupt, and users lose their digital self.
- **The Solution**: Identity Restoration Algorithms (AZT-Patch, Peptide-Code).
- **The Paradox**: Using autonomous AI agents to fight the loss of human autonomy.

## 🧪 Testing

The project includes comprehensive test coverage for core components:

- **Agent Network Tests**: Verify agent instantiation, decision-making, and coordination
- **Solana Configuration Tests**: Validate blockchain setup and transaction defaults
- **Edenlayer Integration Tests**: Test MCP protocol registration and agent capabilities

Run tests with `npm test` to ensure all systems are operational before submission. See [TESTING.md](TESTING.md) for detailed test documentation.

## 📋 Submission Checklist

- [x] Live deployment: https://dallasbuyersclub.vercel.app
- [x] Agent network coordination tested
- [x] Solana devnet integration configured
- [x] Edenlayer MCP protocol defined
- [x] Test suite implemented
- [x] Environment variables documented
- [x] Immersive cyberpunk UI complete

---

*Built with ❤️ for NullShot Hacks*