// Chainhook Event Types
export type ChainhookEventType = 
  | 'contract_call' 
  | 'contract_deploy' 
  | 'stx_transfer' 
  | 'contract_log';

// Chainhook Definition
export interface ChainhookDefinition {
  uuid?: string;
  name: string;
  version?: number;
  chains: Array<'stacks'>;
  networks: {
    mainnet?: {
      if_this: ChainhookPredicate;
      then_that: {
        http_post: {
          url: string;
          authorization_header?: string;
        };
      };
      start_block?: number;
      end_block?: number;
      expire_after_occurrence?: number;
      decode_clarity_values?: boolean;
      include_contract_abi?: boolean;
    };
    testnet?: {
      if_this: ChainhookPredicate;
      then_that: {
        http_post: {
          url: string;
          authorization_header?: string;
        };
      };
      start_block?: number;
      end_block?: number;
      expire_after_occurrence?: number;
      decode_clarity_values?: boolean;
      include_contract_abi?: boolean;
    };
  };
}

// Chainhook Predicate
export interface ChainhookPredicate {
  scope: 'txid' | 'contract_call' | 'contract_deploy' | 'stx_transfer_event' | 'print_event';
  txid?: string;
  contract_identifier?: string;
  method?: string;
  deployer?: string;
}

// Simplified Chainhook Request
export interface ChainhookRequest {
  name: string;
  contractId?: string;
  functionName?: string;
  eventType: ChainhookEventType;
  decodeValues?: boolean;
  enableOnRegistration?: boolean;
}

// Chainhook Response
export interface ChainhookResponse {
  uuid: string;
  name: string;
  status: 'enabled' | 'disabled';
  networks: string[];
}

// Chainhook Payload (Webhook)
export interface ChainhookPayload {
  apply: ChainhookBlock[];
  rollback: ChainhookBlock[];
  chainhook: {
    uuid: string;
    predicate: ChainhookPredicate;
  };
}

export interface ChainhookBlock {
  block_identifier: {
    index: number;
    hash: string;
  };
  parent_block_identifier: {
    index: number;
    hash: string;
  };
  timestamp: number;
  transactions: ChainhookTransaction[];
  metadata: any;
}

export interface ChainhookTransaction {
  transaction_identifier: {
    hash: string;
  };
  operations: any[];
  metadata: {
    success: boolean;
    raw_tx: string;
    result: string;
    sender: string;
    fee: string;
    kind?: {
      type: string;
      data: any;
    };
    receipt?: {
      mutated_contracts_radius: string[];
      mutated_assets_radius: string[];
      contract_calls_stack: any[];
      events: any[];
    };
    description?: string;
    sponsor?: string;
    execution_cost?: any;
    contract_call?: {
      contract_id: string;
      function_name: string;
      function_args: any[];
    };
  };
}

// Campaign Events (from our contracts)
export interface CampaignCreatedEvent {
  campaignId: number;
  creator: string;
  goal: number;
  deadline: number;
  milestoneEnabled: boolean;
  title: string;
  description: string;
}

export interface ContributionMadeEvent {
  campaignId: number;
  contributor: string;
  amount: number;
  timestamp: number;
  totalRaised: number;
}

export interface GoalReachedEvent {
  campaignId: number;
  finalAmount: number;
  backerCount: number;
  timestamp: number;
}

export interface MilestoneCreatedEvent {
  campaignId: number;
  milestoneId: number;
  amount: number;
  title: string;
  votingDuration: number;
}

export interface VoteCastEvent {
  campaignId: number;
  milestoneId: number;
  voter: string;
  vote: boolean;
  votingPower: number;
}

export interface MilestoneReleasedEvent {
  campaignId: number;
  milestoneId: number;
  amount: number;
  recipient: string;
  timestamp: number;
}

export interface RefundProcessedEvent {
  campaignId: number;
  contributor: string;
  amount: number;
  timestamp: number;
}
