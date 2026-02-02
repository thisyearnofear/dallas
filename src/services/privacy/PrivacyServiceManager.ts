/**
 * PrivacyServiceManager - Centralized Privacy Service Coordination
 * 
 * Manages initialization and coordination of all privacy services:
 * - NoirService (ZK proofs)
 * - LightProtocolService (ZK compression)
 * - ArciumMPCService (Threshold decryption)
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Enhances existing case study flow
 * - DRY: Single initialization point for all privacy services
 * - CLEAN: Clear separation between service types
 * - MODULAR: Each service can be used independently
 */

import { noirService, NoirService } from './NoirService';
import { lightProtocolService, LightProtocolService } from './LightProtocolService';
import { arciumMPCService, ArciumMPCService } from './ArciumMPCService';

// Service status tracking
export interface PrivacyServiceStatus {
    noir: { initialized: boolean; error?: string };
    lightProtocol: { initialized: boolean; error?: string };
    arciumMPC: { initialized: boolean; error?: string };
    allInitialized: boolean;
}

// Complete case study privacy processing
export interface PrivacyCaseStudyData {
    // Original data
    baselineSeverity: number;
    outcomeSeverity: number;
    durationDays: number;
    costUsd: number;
    treatmentProtocol: string;
    hasBaseline: boolean;
    hasOutcome: boolean;
    hasDuration: boolean;
    hasProtocol: boolean;
    hasCost: boolean;

    // Encrypted data
    encryptedBaseline?: Uint8Array;
    encryptedOutcome?: Uint8Array;
    metadataHash?: Uint8Array;
}

// Complete privacy processing result
export interface PrivacyProcessingResult {
    // ZK Proofs
    zkProofs: Array<{
        circuitType: string;
        proof: Uint8Array;
        publicInputs: any;
        verified: boolean;
    }>;

    // Compression
    compression: {
        compressedAccount: string;
        originalSize: number;
        compressedSize: number;
        compressionRatio: number;
    };

    // MPC session (if requested)
    mpcSession?: {
        sessionId: string;
        status: string;
        threshold: number;
        committee: string[];
    };

    // Processing metadata
    processingTime: number;
    success: boolean;
    errors: string[];
}

/**
 * PrivacyServiceManager - Main coordination class
 */
export class PrivacyServiceManager {
    private initializationPromise: Promise<void> | null = null;
    private status: PrivacyServiceStatus = {
        noir: { initialized: false },
        lightProtocol: { initialized: false },
        arciumMPC: { initialized: false },
        allInitialized: false,
    };

    /**
     * Initialize all privacy services
     * Safe to call multiple times - will only initialize once
     */
    async initialize(): Promise<PrivacyServiceStatus> {
        if (this.initializationPromise) {
            await this.initializationPromise;
            return this.status;
        }

        this.initializationPromise = this.performInitialization();
        await this.initializationPromise;
        return this.status;
    }

    /**
     * Perform actual initialization of all services
     */
    private async performInitialization(): Promise<void> {
        console.log('🔐 Initializing privacy services...');
        const startTime = Date.now();

        // Initialize services in parallel for better performance
        const initPromises = [
            this.initializeNoir(),
            this.initializeLightProtocol(),
            this.initializeArciumMPC(),
        ];

        await Promise.allSettled(initPromises);

        // Update overall status
        this.status.allInitialized =
            this.status.noir.initialized &&
            this.status.lightProtocol.initialized &&
            this.status.arciumMPC.initialized;

        const duration = Date.now() - startTime;
        console.log(`🔐 Privacy services initialized in ${duration}ms`);

        if (this.status.allInitialized) {
            console.log('✅ All privacy services ready');
        } else {
            console.warn('⚠️ Some privacy services failed to initialize - using fallbacks');
        }
    }

    /**
     * Initialize Noir service
     */
    private async initializeNoir(): Promise<void> {
        try {
            await noirService.initialize();
            this.status.noir.initialized = true;
            console.log('✅ Noir ZK proof service ready');
        } catch (error) {
            this.status.noir.error = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Noir service failed:', error);
        }
    }

    /**
     * Initialize Light Protocol service
     */
    private async initializeLightProtocol(): Promise<void> {
        try {
            await lightProtocolService.initialize();
            this.status.lightProtocol.initialized = true;
            console.log('✅ Light Protocol compression service ready');
        } catch (error) {
            this.status.lightProtocol.error = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Light Protocol service failed:', error);
        }
    }

    /**
     * Initialize Arcium MPC service
     */
    private async initializeArciumMPC(): Promise<void> {
        try {
            await arciumMPCService.initialize();
            this.status.arciumMPC.initialized = true;
            console.log('✅ Arcium MPC service ready');
        } catch (error) {
            this.status.arciumMPC.error = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Arcium MPC service failed:', error);
        }
    }

    /**
     * Get current service status
     */
    getStatus(): PrivacyServiceStatus {
        return { ...this.status };
    }

    /**
     * Check if all services are ready
     */
    isReady(): boolean {
        return this.status.allInitialized;
    }

    /**
     * Get individual service instances
     */
    getServices() {
        return {
            noir: noirService,
            lightProtocol: lightProtocolService,
            arciumMPC: arciumMPCService,
        };
    }

    /**
     * Process case study with full privacy stack
     * Generates ZK proofs, compresses data, and optionally creates MPC session
     */
    async processPrivacyCaseStudy(
        data: PrivacyCaseStudyData,
        options: {
            generateProofs?: boolean;
            compressData?: boolean;
            createMPCSession?: boolean;
            mpcJustification?: string;
        } = {}
    ): Promise<PrivacyProcessingResult> {
        const startTime = Date.now();
        const errors: string[] = [];

        const {
            generateProofs = true,
            compressData = true,
            createMPCSession = false,
            mpcJustification = '',
        } = options;

        // Ensure services are initialized
        await this.initialize();

        const result: PrivacyProcessingResult = {
            zkProofs: [],
            compression: {
                compressedAccount: '',
                originalSize: 0,
                compressedSize: 0,
                compressionRatio: 1,
            },
            processingTime: 0,
            success: false,
            errors: [],
        };

        try {
            // Step 1: Generate ZK proofs
            if (generateProofs && this.status.noir.initialized) {
                console.log('🔐 Generating ZK proofs...');
                try {
                    const proofs = await noirService.generateValidationProofs(data);
                    result.zkProofs = proofs.map(proof => ({
                        circuitType: proof.circuitType,
                        proof: proof.proof,
                        publicInputs: proof.publicInputs,
                        verified: proof.verified,
                    }));
                    console.log(`✅ Generated ${proofs.length} ZK proofs`);
                } catch (error) {
                    const errorMsg = `ZK proof generation failed: ${error}`;
                    errors.push(errorMsg);
                    console.error('❌', errorMsg);
                }
            }

            // Step 2: Compress data
            if (compressData && this.status.lightProtocol.initialized) {
                console.log('⚡ Compressing case study data...');
                try {
                    // Prepare data for compression
                    const compressionData = {
                        encryptedBaseline: data.encryptedBaseline || new TextEncoder().encode(data.baselineSeverity.toString()),
                        encryptedOutcome: data.encryptedOutcome || new TextEncoder().encode(data.outcomeSeverity.toString()),
                        treatmentProtocol: data.treatmentProtocol,
                        durationDays: data.durationDays,
                        costUSD: data.costUsd,
                        metadataHash: data.metadataHash || crypto.getRandomValues(new Uint8Array(32)),
                    };

                    const compressed = await lightProtocolService.compressCaseStudy(compressionData);
                    result.compression = {
                        compressedAccount: compressed.compressedAccount.toString(),
                        originalSize: compressed.originalSize,
                        compressedSize: compressed.compressedSize,
                        compressionRatio: compressed.achievedRatio,
                    };
                    console.log(`✅ Compressed data ${compressed.achievedRatio}x (${compressed.originalSize} → ${compressed.compressedSize} bytes)`);
                } catch (error) {
                    const errorMsg = `Data compression failed: ${error}`;
                    errors.push(errorMsg);
                    console.error('❌', errorMsg);
                }
            }

            // Step 3: Create MPC session (optional)
            if (createMPCSession && this.status.arciumMPC.initialized && mpcJustification) {
                console.log('🔐 Creating MPC session...');
                try {
                    // This would typically be called by researchers requesting access
                    // For now, we'll create a mock session
                    result.mpcSession = {
                        sessionId: `mpc_${Date.now()}`,
                        status: 'pending',
                        threshold: 3,
                        committee: ['validator1', 'validator2', 'validator3', 'validator4', 'validator5'],
                    };
                    console.log(`✅ Created MPC session: ${result.mpcSession.sessionId}`);
                } catch (error) {
                    const errorMsg = `MPC session creation failed: ${error}`;
                    errors.push(errorMsg);
                    console.error('❌', errorMsg);
                }
            }

            result.success = errors.length === 0;
            result.errors = errors;
            result.processingTime = Date.now() - startTime;

            console.log(`🔐 Privacy processing completed in ${result.processingTime}ms`);
            return result;

        } catch (error) {
            const errorMsg = `Privacy processing failed: ${error}`;
            errors.push(errorMsg);

            result.success = false;
            result.errors = errors;
            result.processingTime = Date.now() - startTime;

            console.error('❌ Privacy processing failed:', error);
            return result;
        }
    }

    /**
     * Get privacy processing statistics
     */
    getPrivacyStats(): {
        noir: { circuitsLoaded: number; proofsGenerated: number };
        lightProtocol: { totalCompressed: number; averageRatio: number };
        arciumMPC: { activeSessions: number };
    } {
        const services = this.getServices();

        return {
            noir: {
                circuitsLoaded: services.noir.getAvailableCircuits().length,
                proofsGenerated: 0, // Would track in production
            },
            lightProtocol: {
                totalCompressed: services.lightProtocol.getStats().totalCompressed,
                averageRatio: services.lightProtocol.getStats().averageRatio,
            },
            arciumMPC: {
                activeSessions: 0, // Would track active sessions
            },
        };
    }

    /**
     * Validate privacy configuration
     * Checks that all required services are properly configured
     */
    validatePrivacyConfig(): {
        isValid: boolean;
        issues: string[];
        recommendations: string[];
    } {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check Noir service
        if (!this.status.noir.initialized) {
            issues.push('Noir ZK proof service not initialized');
            recommendations.push('Install @noir-lang/noir_js and @noir-lang/backend_barretenberg');
        }

        // Check Light Protocol service
        if (!this.status.lightProtocol.initialized) {
            issues.push('Light Protocol compression service not initialized');
            recommendations.push('Install @lightprotocol/stateless.js');
        }

        // Check Arcium MPC service
        if (!this.status.arciumMPC.initialized) {
            issues.push('Arcium MPC service not initialized');
            recommendations.push('Install @arcium-hq/client');
        }

        // General recommendations
        if (issues.length > 0) {
            recommendations.push('Run `npm install` to ensure all privacy dependencies are installed');
            recommendations.push('Check network connectivity for service initialization');
        }

        return {
            isValid: issues.length === 0,
            issues,
            recommendations,
        };
    }
}

// Export singleton instance
export const privacyServiceManager = new PrivacyServiceManager();

// Export default for convenience
export default privacyServiceManager;