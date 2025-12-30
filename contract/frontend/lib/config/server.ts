export const config = {
  chainhooksApiKey: process.env.CHAINHOOKS_API_KEY!,
  webhookUrl: process.env.CHAINHOOKS_WEBHOOK_URL!,
  network: process.env.CHAINHOOKS_NETWORK || 'mainnet',
  secretKey: process.env.SECRET_KEY!,
  databaseUrl: process.env.DATABASE_URL!,
};

export const contracts = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  campaign: process.env.NEXT_PUBLIC_CAMPAIGN_CONTRACT!,
  tracker: process.env.NEXT_PUBLIC_TRACKER_CONTRACT!,
  milestone: process.env.NEXT_PUBLIC_MILESTONE_CONTRACT!,
};

export const network = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'mainnet';
export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.hiro.so';
