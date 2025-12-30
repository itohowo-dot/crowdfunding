import { config, contracts, network } from '@/lib/config/server';
import type {
  ChainhookDefinition,
  ChainhookRequest,
  ChainhookResponse,
  ChainhookEventType,
} from '@/lib/types/chainhooks';

const API_BASE = 'https://api.hiro.so/chainhooks';

/**
 * Create a simplified chainhook request into a full definition
 */
function createChainhookDefinition(request: ChainhookRequest): ChainhookDefinition {
  const { name, contractId, functionName, eventType, decodeValues = true } = request;

  let predicate: any = {};

  switch (eventType) {
    case 'contract_call':
      predicate = {
        scope: 'contract_call',
        contract_identifier: contractId,
        method: functionName,
      };
      break;
    case 'contract_deploy':
      predicate = {
        scope: 'contract_deploy',
        deployer: contractId?.split('.')[0],
      };
      break;
    case 'stx_transfer':
      predicate = {
        scope: 'stx_transfer_event',
      };
      break;
    case 'contract_log':
      predicate = {
        scope: 'print_event',
        contract_identifier: contractId,
      };
      break;
  }

  const networkConfig = {
    if_this: predicate,
    then_that: {
      http_post: {
        url: config.webhookUrl,
        authorization_header: `Bearer ${config.secretKey}`,
      },
    },
    decode_clarity_values: decodeValues,
    include_contract_abi: true,
  };

  return {
    name,
    version: 1,
    chains: ['stacks'],
    networks: {
      [network as 'mainnet' | 'testnet']: networkConfig,
    },
  };
}

/**
 * Create a new chainhook
 */
export async function createChainhook(request: ChainhookRequest): Promise<ChainhookResponse> {
  const definition = createChainhookDefinition(request);

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.chainhooksApiKey}`,
    },
    body: JSON.stringify(definition),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create chainhook: ${error}`);
  }

  return response.json();
}

/**
 * List all registered chainhooks
 */
export async function getChainhooks(): Promise<ChainhookResponse[]> {
  const response = await fetch(API_BASE, {
    headers: {
      'Authorization': `Bearer ${config.chainhooksApiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch chainhooks');
  }

  return response.json();
}

/**
 * Get a specific chainhook by UUID
 */
export async function getChainhook(uuid: string): Promise<ChainhookResponse> {
  const response = await fetch(`${API_BASE}/${uuid}`, {
    headers: {
      'Authorization': `Bearer ${config.chainhooksApiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch chainhook');
  }

  return response.json();
}

/**
 * Update a chainhook
 */
export async function updateChainhook(
  uuid: string,
  definition: Partial<ChainhookDefinition>
): Promise<ChainhookResponse> {
  const response = await fetch(`${API_BASE}/${uuid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.chainhooksApiKey}`,
    },
    body: JSON.stringify(definition),
  });

  if (!response.ok) {
    throw new Error('Failed to update chainhook');
  }

  return response.json();
}

/**
 * Delete a chainhook
 */
export async function deleteChainhook(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${uuid}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${config.chainhooksApiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete chainhook');
  }
}

/**
 * Enable or disable a chainhook
 */
export async function toggleChainhook(uuid: string, enabled: boolean): Promise<void> {
  const response = await fetch(`${API_BASE}/${uuid}/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.chainhooksApiKey}`,
    },
    body: JSON.stringify({ enabled }),
  });

  if (!response.ok) {
    throw new Error('Failed to toggle chainhook');
  }
}

/**
 * Register all crowdfunding platform chainhooks
 */
export async function registerPlatformChainhooks() {
  const campaignContract = `${contracts.address}.${contracts.campaign}`;
  const trackerContract = `${contracts.address}.${contracts.tracker}`;
  const milestoneContract = `${contracts.address}.${contracts.milestone}`;

  const hooks = [
    // Campaign creation
    {
      name: 'campaign-created',
      contractId: campaignContract,
      functionName: 'create-campaign',
      eventType: 'contract_call' as ChainhookEventType,
    },
    // Contributions
    {
      name: 'contribution-made',
      contractId: campaignContract,
      functionName: 'contribute',
      eventType: 'contract_call' as ChainhookEventType,
    },
    // Fund claiming
    {
      name: 'funds-claimed',
      contractId: campaignContract,
      functionName: 'claim-funds',
      eventType: 'contract_call' as ChainhookEventType,
    },
    // Refunds
    {
      name: 'refund-processed',
      contractId: campaignContract,
      functionName: 'refund',
      eventType: 'contract_call' as ChainhookEventType,
    },
    // Milestone voting
    {
      name: 'vote-cast',
      contractId: milestoneContract,
      functionName: 'vote-on-milestone',
      eventType: 'contract_call' as ChainhookEventType,
    },
    // Milestone release
    {
      name: 'milestone-released',
      contractId: milestoneContract,
      functionName: 'release-milestone-funds',
      eventType: 'contract_call' as ChainhookEventType,
    },
  ];

  const results = [];
  for (const hook of hooks) {
    try {
      const result = await createChainhook(hook);
      results.push(result);
      console.log(`✓ Registered: ${hook.name}`);
    } catch (error) {
      console.error(`✗ Failed to register: ${hook.name}`, error);
    }
  }

  return results;
}
