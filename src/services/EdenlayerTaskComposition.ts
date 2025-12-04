// Edenlayer Task Composition - Real implementation following Edenlayer patterns
// Following Core Principles: CLEAN separation, MODULAR design

import { EDENLAYER_CONFIG } from './EnhancedBusinessLogic';

// CLEAN: Edenlayer task composition interfaces
export interface EdenlayerTask {
  agentId: string;
  operation: string;
  params: any;
  parents?: string[];
}

export interface TaskCompositionResult {
  taskIds: string[];
  mainTaskId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

// MODULAR: Real Edenlayer task composition following documentation patterns
export class EdenlayerTaskComposer {
  private registeredAgents: Map<string, string> = new Map();

  constructor(agentRegistry: Map<string, string>) {
    this.registeredAgents = agentRegistry;
  }

  // ENHANCED: Treatment purchase workflow following Edenlayer composition patterns
  async composeTreatmentPurchaseWorkflow(params: {
    treatmentId: string;
    patientId: string;
    walletAddress: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<TaskCompositionResult> {
    
    // Real Edenlayer task composition: (Risk Assessment) -> (Availability + Identity) -> (Planning) -> (Execution)
    const workflow: EdenlayerTask[] = [
      // Task 0: Risk Assessment (independent)
      {
        agentId: this.registeredAgents.get('risk') || 'risk-agent-fallback',
        operation: 'tools/assess_transaction_risk',
        params: {
          transactionType: 'purchase',
          amount: this.calculateTreatmentPrice(params.treatmentId),
          participantCount: 1,
          timeOfDay: new Date().getHours().toString(),
          location: 'dallas'
        }
      },

      // Task 1: Check Treatment Availability (independent, parallel with risk)
      {
        agentId: this.registeredAgents.get('supply') || 'supply-agent-fallback',
        operation: 'tools/check_treatment_availability',
        params: {
          treatmentIds: [params.treatmentId],
          quantity: 1,
          urgency: params.urgency
        }
      },

      // Task 2: Identity Assessment (independent, parallel)
      {
        agentId: this.registeredAgents.get('identity') || 'identity-agent-fallback',
        operation: 'tools/assess_identity_fragmentation',
        params: {
          patientId: params.patientId,
          symptoms: this.getTypicalSymptoms(),
          fragmentationIndicators: {
            memoryLoss: Math.floor(Math.random() * 50) + 25,
            personalityShifts: Math.floor(Math.random() * 30) + 10,
            digitalSignatureCorruption: Math.floor(Math.random() * 40) + 20
          },
          onsetDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      },

      // Task 3: Plan Restoration (depends on availability and identity assessment)
      {
        agentId: this.registeredAgents.get('identity') || 'identity-agent-fallback',
        operation: 'tools/plan_restoration_sequence',
        parents: ['1', '2'], // Depends on availability and identity assessment
        params: {
          fragmentationLevel: {
            source: {
              field: 'fragmentationLevel',
              taskId: '2'
            },
            type: 'number'
          },
          affectedSystems: ['memory_core', 'digital_signature', 'personality_matrix'],
          timeframe: params.urgency === 'critical' ? 'emergency' : 'standard',
          patientResources: {
            budget: this.calculateTreatmentPrice(params.treatmentId),
            timeAvailable: this.getTimeframeForUrgency(params.urgency),
            supportSystem: true
          }
        }
      },

      // Task 4: Coordinate Distribution (depends on risk + availability)
      {
        agentId: this.registeredAgents.get('supply') || 'supply-agent-fallback',
        operation: 'tools/coordinate_distribution',
        parents: ['0', '1'], // Depends on risk assessment and availability
        params: {
          destinations: [params.walletAddress],
          riskLevel: {
            source: {
              field: 'threatLevel',
              taskId: '0'
            },
            type: 'string'
          },
          treatmentTypes: [params.treatmentId]
        }
      },

      // Task 5: Final Coordination (depends on all previous tasks)
      {
        agentId: this.registeredAgents.get('community') || 'community-agent-fallback',
        operation: 'tools/coordinate_final_approval',
        parents: ['0', '1', '3', '4'], // Depends on risk, availability, planning, distribution
        params: {
          riskScore: {
            source: {
              field: 'riskScore',
              taskId: '0'
            },
            type: 'number'
          },
          treatmentAvailability: {
            source: {
              field: 'availability',
              taskId: '1'
            },
            type: 'object'
          },
          restorationPlan: {
            source: {
              field: 'phases',
              taskId: '3'
            },
            type: 'array'
          },
          distributionPlan: {
            source: {
              field: 'deliveryPlan',
              taskId: '4'
            },
            type: 'object'
          },
          patientId: params.patientId,
          walletAddress: params.walletAddress
        }
      }
    ];

    return this.executeComposition(workflow);
  }

  // ENHANCED: Group purchase coordination with complex dependencies
  async composeGroupPurchaseWorkflow(params: {
    treatmentIds: string[];
    memberCount: number;
    coordinatorWallet: string;
    timeframe: '24h' | '48h' | '1w';
  }): Promise<TaskCompositionResult> {

    const workflow: EdenlayerTask[] = [
      // Task 0: Assess Group Risk
      {
        agentId: this.registeredAgents.get('risk') || 'risk-agent-fallback',
        operation: 'tools/assess_transaction_risk',
        params: {
          transactionType: 'group_buy',
          amount: params.treatmentIds.reduce((sum, id) => sum + this.calculateTreatmentPrice(id), 0),
          participantCount: params.memberCount,
          timeOfDay: new Date().getHours().toString(),
          location: 'dallas'
        }
      },

      // Task 1: Check Bulk Availability (parallel with risk)
      {
        agentId: this.registeredAgents.get('supply') || 'supply-agent-fallback',
        operation: 'tools/check_treatment_availability',
        params: {
          treatmentIds: params.treatmentIds,
          quantity: params.memberCount,
          urgency: 'medium'
        }
      },

      // Task 2: Organize Group (depends on risk assessment)
      {
        agentId: this.registeredAgents.get('community') || 'community-agent-fallback',
        operation: 'tools/organize_group_purchase',
        parents: ['0'],
        params: {
          treatmentIds: params.treatmentIds,
          maxParticipants: params.memberCount,
          timeframe: params.timeframe,
          riskLevel: {
            source: {
              field: 'threatLevel',
              taskId: '0'
            },
            type: 'string'
          }
        }
      },

      // Task 3: Negotiate Bulk Pricing (depends on availability and group organization)
      {
        agentId: this.registeredAgents.get('supply') || 'supply-agent-fallback',
        operation: 'tools/negotiate_bulk_pricing',
        parents: ['1', '2'],
        params: {
          treatmentId: params.treatmentIds[0], // Primary treatment
          quantity: params.memberCount,
          memberCount: {
            source: {
              field: 'confirmedParticipants',
              taskId: '2'
            },
            type: 'number'
          },
          timeframe: params.timeframe
        }
      },

      // Task 4: Coordinate Distribution (depends on all previous)
      {
        agentId: this.registeredAgents.get('supply') || 'supply-agent-fallback',
        operation: 'tools/coordinate_distribution',
        parents: ['0', '1', '2', '3'],
        params: {
          destinations: {
            source: {
              field: 'memberAddresses',
              taskId: '2'
            },
            type: 'array'
          },
          riskLevel: {
            source: {
              field: 'threatLevel',
              taskId: '0'
            },
            type: 'string'
          },
          treatmentTypes: params.treatmentIds,
          bulkDiscount: {
            source: {
              field: 'discountPercentage',
              taskId: '3'
            },
            type: 'number'
          }
        }
      }
    ];

    return this.executeComposition(workflow);
  }

  // ENHANCED: Emergency response coordination
  async composeEmergencyResponseWorkflow(params: {
    emergencyType: 'corporate_raid' | 'supply_disruption' | 'network_compromise';
    severity: number;
    affectedSectors: string[];
  }): Promise<TaskCompositionResult> {

    const workflow: EdenlayerTask[] = [
      // Task 0: Immediate Risk Assessment
      {
        agentId: this.registeredAgents.get('risk') || 'risk-agent-fallback',
        operation: 'tools/coordinate_emergency_response',
        params: {
          emergencyType: params.emergencyType,
          severity: params.severity,
          affectedSectors: params.affectedSectors,
          estimatedDuration: this.estimateEmergencyDuration(params.emergencyType, params.severity)
        }
      },

      // Task 1: Secure Supply Chain (parallel with risk assessment)
      {
        agentId: this.registeredAgents.get('supply') || 'supply-agent-fallback',
        operation: 'tools/emergency_supply_protection',
        params: {
          emergencyType: params.emergencyType,
          threatLevel: params.severity,
          redistributeInventory: params.severity > 7
        }
      },

      // Task 2: Alert and Coordinate Community (depends on risk assessment)
      {
        agentId: this.registeredAgents.get('community') || 'community-agent-fallback',
        operation: 'tools/emergency_member_coordination',
        parents: ['0'],
        params: {
          emergencyProtocol: {
            source: {
              field: 'recommendedActions',
              taskId: '0'
            },
            type: 'array'
          },
          affectedMembers: params.affectedSectors,
          communicationMode: 'secure_channels'
        }
      },

      // Task 3: Backup Identity Systems (parallel coordination)
      {
        agentId: this.registeredAgents.get('identity') || 'identity-agent-fallback',
        operation: 'tools/emergency_identity_backup',
        parents: ['0'],
        params: {
          backupLevel: params.severity > 8 ? 'full' : 'critical_only',
          emergencyType: params.emergencyType,
          estimatedDowntime: {
            source: {
              field: 'estimatedDuration',
              taskId: '0'
            },
            type: 'string'
          }
        }
      }
    ];

    return this.executeComposition(workflow);
  }

  // CLEAN: Execute task composition via Edenlayer API
  private async executeComposition(workflow: EdenlayerTask[]): Promise<TaskCompositionResult> {
    try {
      console.log('🔗 Executing Edenlayer task composition:', workflow);
      
      const response = await this.makeEdenlayerApiCall('POST', '/tasks/compose', workflow);
      
      if (Array.isArray(response)) {
        return {
          taskIds: response.map(r => r.taskId),
          mainTaskId: response[response.length - 1].taskId,
          status: 'pending'
        };
      }
      
      return {
        taskIds: [response.taskId],
        mainTaskId: response.taskId,
        status: response.status || 'pending'
      };
    } catch (error) {
      console.error('❌ Edenlayer composition failed:', error);
      
      // Graceful fallback
      const fallbackId = `fallback_${Date.now()}`;
      return {
        taskIds: [fallbackId],
        mainTaskId: fallbackId,
        status: 'failed'
      };
    }
  }

  // Helper methods
  private calculateTreatmentPrice(treatmentId: string): number {
    const prices = {
      'azt_patch': 0.5,
      'peptide_code': 0.2,
      'ddc_algorithm': 0.3,
      'interferon_suite': 0.8
    };
    return prices[treatmentId as keyof typeof prices] || 0.5;
  }

  private getTypicalSymptoms(): string[] {
    return [
      'memory_fragmentation',
      'digital_signature_corruption',
      'personality_drift',
      'temporal_disconnection',
      'identity_cascade_errors'
    ];
  }

  private getTimeframeForUrgency(urgency: string): string {
    const timeframes = {
      'low': '6-8 weeks',
      'medium': '3-4 weeks',
      'high': '1-2 weeks',
      'critical': '24-72 hours'
    };
    return timeframes[urgency as keyof typeof timeframes] || '3-4 weeks';
  }

  private estimateEmergencyDuration(type: string, severity: number): string {
    const baseDuration = {
      'corporate_raid': 4,
      'supply_disruption': 24,
      'network_compromise': 12
    };
    const hours = (baseDuration[type as keyof typeof baseDuration] || 8) * (severity / 5);
    return `${Math.ceil(hours)} hours`;
  }

  private async makeEdenlayerApiCall(method: string, endpoint: string, data?: any): Promise<any> {
    const response = await fetch(`https://api.edenlayer.com${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.EDENLAYER_API_KEY || 'demo-key'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`Edenlayer API error: ${response.status}`);
    }

    return response.json();
  }
}

export const edenlayerTaskComposer = new EdenlayerTaskComposer(new Map());