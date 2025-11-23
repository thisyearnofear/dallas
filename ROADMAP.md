# Hackathon Roadmap: The Dallas Buyers Club (Health AI Edition)

This document outlines the strategic roadmap for adapting the "Dallas Buyers Club" project for a privacy-focused AI hackathon.

## Why This Is a Strong Fit

This project is strategically positioned to maximize winning potential across multiple high-value tracks.

*   **Perfect Track Alignment**:
    *   **Privacy-Preserving AI & Computation ($33k+ base)**: This is our primary track. The project's core is private health AI.
    *   **Creative Privacy Applications ($7k+)**: Medical AI is an unexpected and high-impact application for privacy tech in a hackathon setting.
    *   **Privacy Infrastructure & Developer Tools ($37k+)**: Success in this track is possible if we build robust, reusable developer tools.
*   **High-Impact Narrative**:
    *   **Unexpected & Practical**: Medical AI isn't common in crypto hackathons, which helps us meet the "surprise us" criteria for creative bounties.
    *   **Multi-Bounty Eligible**: The same codebase can be submitted to 4-5 different sponsor bounties.
    *   **Authentic Founder Story**: Leveraging a personal story about healthcare struggles creates a powerful and memorable narrative for judges.
    *   **Privacy as a Core Need**: The project naturally aligns with privacy technology due to the sensitive nature of health data (e.g., HIPAA compliance).
    *   **Cross-Chain Integration**: The plan involves integrating multiple sponsors (NEAR, Nillion, Starknet), demonstrating broad technical capability.

## Winning Strategy: Target Specific Bounties

### 1. NEAR - Privacy-Preserving AI ($25k)
*   **Concept**: Build an AI health advisor that helps users manage their health privately using Zcash (ZEC) for payments. The agent can suggest treatments, find specialists, and facilitate private payments.
*   **Technology**: Use NEAR AI's TEE-based inference for the medical AI component.
*   **Prize Potential**: Aim for a top 5 position ($3-5k).

### 2. Nillion - Private AI Track ($25k NIL)
*   **Concept**: A private medical diagnosis AI that runs computation directly on encrypted health data.
*   **Technology**: Utilize `nilAI` (private LLMs) to analyze medical records stored in `nilDB`.
*   **Prize Potential**: Target 1st place ($15k in NIL tokens).

### 3. Starknet - Creative Wildcard ($20k)
*   **Concept**: A private medical AI marketplace on Starknet where patients upload encrypted records, AI models privately bid to provide a diagnosis, and payments are settled in ZEC with all identities shielded.
*   **Technology**: Starknet for the marketplace logic and Zcash for private payments.
*   **Prize Potential**: Hits the "unexpected, high-impact" criteria perfectly.

### 4. Arcium - Private DeFi ($10.5k)
*   **Concept**: A "Private Health Insurance Pool" where users contribute ZEC to risk pools without revealing their health conditions.
*   **Technology**: Smart contracts on Solana using Arcium's encrypted compute.

## Architectural Approach & The `open-health` Repository

Our strategy is predicated on integrating the [OpenHealthForAll/open-health](https://github.com/OpenHealthForAll/open-health) repository.

**Analysis**:
The `open-health` project provides powerful features for parsing medical data and interacting with AI models. However, its core logic (data parsing, AI interaction) runs on a backend server and it is designed to be used with Docker.

**Constraint vs. Requirement**:
Your preference is to avoid Docker or a self-hosted backend. However, the hackathon bounties (NEAR TEE inference, Nillion's nilAI, etc.) all require backend components to perform the necessary private computations. A purely frontend application cannot meet the technical requirements of these bounties.

**Proposed Solution: Serverless Backend**:
To resolve this, we will use a **serverless backend** (e.g., Vercel Functions). This approach provides the required backend processing power without the operational overhead of managing a traditional server, satisfying the spirit of the "no self-hosted backend" constraint.

## Concerns & Risks

*   **Timeline**: The 3-week timeline is extremely tight for a multi-chain integration. We must prioritize ruthlessly.
*   **Technical Depth**: We need actual working privacy technology, not just mockups. Judges are highly technical and will test the privacy guarantees.
*   **Architecture**: Integrating `open-health` requires a backend, and our success depends on implementing a lightweight serverless architecture quickly.

## Recommended Timeline

### Week 1: Core Functionality (NEAR AI + Nillion)
*   **[ ] Backend Setup**: Initialize a serverless backend using Vercel Functions.
*   **[ ] Basic Medical Record Upload**: Implement a simple frontend interface for uploading health records.
*   **[ ] Backend Logic**: Port or adapt the core data parsing logic from `open-health` to run in our serverless environment.
*   **[ ] Nillion Integration**: Store the parsed (or encrypted) health data using Nillion's `nilDB`.
*   **[ ] NEAR AI Integration**: Implement a basic medical query that uses NEAR AI's TEE-based inference.
*   **[ ] Zcash Payment**: Add a simple Zcash payment integration for a core action.

### Week 2: Feature Expansion & Documentation
*   **[ ] Starknet Marketplace Logic**: If time permits, begin implementing the private bidding logic for the Starknet bounty.
*   **[ ] UX/UI & Demo**: Refine the user experience and create a compelling demo flow.
*   **[ ] Documentation**: Start documenting the architecture, setup, and features. Clear documentation is critical for judges to understand the project.

### Week 3: Polish, Test, and Submit
*   **[ ] End-to-End Testing**: Rigorously test the full workflow, especially the privacy-preserving features.
*   **[ ] Finalize Submission**: Prepare the video demo, finalize the submission text for each bounty, and deploy the final version.
