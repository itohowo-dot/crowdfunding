/// <reference types="node" />

declare global {
  var mongoose: {
    conn: any;
    promise: any;
  };

  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      MONGODB_URI: string;
      CHAINHOOKS_API_KEY: string;
      CHAINHOOKS_WEBHOOK_URL: string;
      CHAINHOOKS_NETWORK: 'mainnet' | 'testnet';
      SECRET_KEY: string;
      NEXT_PUBLIC_CONTRACT_ADDRESS: string;
      NEXT_PUBLIC_CAMPAIGN_CONTRACT: string;
      NEXT_PUBLIC_TRACKER_CONTRACT: string;
      NEXT_PUBLIC_MILESTONE_CONTRACT: string;
      NEXT_PUBLIC_STACKS_NETWORK: 'mainnet' | 'testnet';
      NEXT_PUBLIC_API_URL: string;
    }
  }
}

export {};
