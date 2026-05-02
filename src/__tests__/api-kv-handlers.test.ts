import { describe, expect, it } from '@jest/globals';
import agentsHandler from '../../api/agents';
import tasksHandler from '../../api/tasks';
import validationsHandler from '../../api/validations';

type MockResponse = {
  statusCode: number;
  body: any;
  status: (code: number) => MockResponse;
  json: (payload: any) => MockResponse;
};

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };
}

async function callHandler(
  handler: (request: any, response: any) => Promise<any>,
  request: { method: string; query?: Record<string, any>; body?: Record<string, any> }
) {
  const response = createResponse();
  await handler(
    {
      query: {},
      body: {},
      ...request,
    },
    response
  );
  return response;
}

describe('KV-backed API handlers', () => {
  it('registers and retrieves an agent through KV storage', async () => {
    const ownerAddress = `wallet_${Date.now()}`;
    const created = await callHandler(agentsHandler, {
      method: 'POST',
      body: {
        name: 'KV Validator Agent',
        role: 'validator',
        ownerAddress,
        capabilities: ['noir_verification'],
      },
    });

    expect(created.statusCode).toBe(201);
    expect(created.body.agent.ownerAddress).toBe(ownerAddress);

    const fetched = await callHandler(agentsHandler, {
      method: 'GET',
      query: { id: created.body.agent.id },
    });

    expect(fetched.statusCode).toBe(200);
    expect(fetched.body.id).toBe(created.body.agent.id);
  });

  it('creates and assigns a task using the client taskId contract', async () => {
    const created = await callHandler(tasksHandler, {
      method: 'POST',
      body: {
        type: 'validation',
        targetId: `opt_log_${Date.now()}`,
        rewardDbc: 125,
        complexity: 'medium',
      },
    });

    expect(created.statusCode).toBe(201);

    const assigned = await callHandler(tasksHandler, {
      method: 'PUT',
      body: {
        taskId: created.body.task.id,
        agentId: 'agent_test_assignment',
      },
    });

    expect(assigned.statusCode).toBe(200);
    expect(assigned.body.task.status).toBe('assigned');
    expect(assigned.body.task.assignedTo).toBe('agent_test_assignment');
  });

  it('moves validations from pending to completed after review', async () => {
    const created = await callHandler(validationsHandler, {
      method: 'POST',
      body: {
        optimizationLogId: `opt_log_${Date.now()}`,
        submitter: 'submitter_test',
        validatorType: 'quality',
        stakeAmount: 100,
      },
    });

    expect(created.statusCode).toBe(201);

    const approved = await callHandler(validationsHandler, {
      method: 'PUT',
      body: {
        id: created.body.validation.id,
        validatorId: 'validator_test',
        action: 'approve',
        validationScore: 91,
      },
    });

    expect(approved.statusCode).toBe(200);
    expect(approved.body.validation.status).toBe('approved');

    const fetched = await callHandler(validationsHandler, {
      method: 'GET',
      query: { id: created.body.validation.id },
    });

    expect(fetched.statusCode).toBe(200);
    expect(fetched.body.status).toBe('approved');
    expect(fetched.body.validatorId).toBe('validator_test');
  });
});
