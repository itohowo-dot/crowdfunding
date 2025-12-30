import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
  stringUtf8CV,
  boolCV,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const CAMPAIGN_CONTRACT = process.env.NEXT_PUBLIC_CAMPAIGN_CONTRACT!;
const TRACKER_CONTRACT = process.env.NEXT_PUBLIC_TRACKER_CONTRACT!;
const MILESTONE_CONTRACT = process.env.NEXT_PUBLIC_MILESTONE_CONTRACT!;

/**
 * Create a new campaign
 */
export async function createCampaign(
  senderAddress: string,
  title: string,
  description: string,
  goal: number,
  durationDays: number,
  milestoneEnabled: boolean
) {
  const functionArgs = [
    stringAsciiCV(title),
    stringUtf8CV(description),
    uintCV(goal),
    uintCV(durationDays),
    boolCV(milestoneEnabled),
  ];

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CAMPAIGN_CONTRACT,
    functionName: 'create-campaign',
    functionArgs,
    senderKey: '', // Will be signed by wallet
    validateWithAbi: true,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };

  return makeContractCall(txOptions);
}

/**
 * Contribute to a campaign
 */
export async function contribute(
  senderAddress: string,
  campaignId: number,
  amount: number
) {
  const functionArgs = [
    uintCV(campaignId),
    uintCV(amount),
  ];

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CAMPAIGN_CONTRACT,
    functionName: 'contribute',
    functionArgs,
    senderKey: '',
    validateWithAbi: true,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
  };

  return makeContractCall(txOptions);
}

/**
 * Claim funds for successful campaign
 */
export async function claimFunds(
  senderAddress: string,
  campaignId: number
) {
  const functionArgs = [uintCV(campaignId)];

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CAMPAIGN_CONTRACT,
    functionName: 'claim-funds',
    functionArgs,
    senderKey: '',
    validateWithAbi: true,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
  };

  return makeContractCall(txOptions);
}

/**
 * Request refund for failed campaign
 */
export async function refund(
  senderAddress: string,
  campaignId: number
) {
  const functionArgs = [uintCV(campaignId)];

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CAMPAIGN_CONTRACT,
    functionName: 'refund',
    functionArgs,
    senderKey: '',
    validateWithAbi: true,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
  };

  return makeContractCall(txOptions);
}

/**
 * Vote on milestone
 */
export async function voteOnMilestone(
  senderAddress: string,
  campaignId: number,
  milestoneId: number,
  approve: boolean
) {
  const functionArgs = [
    uintCV(campaignId),
    uintCV(milestoneId),
    boolCV(approve),
  ];

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: MILESTONE_CONTRACT,
    functionName: 'vote-on-milestone',
    functionArgs,
    senderKey: '',
    validateWithAbi: true,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
  };

  return makeContractCall(txOptions);
}

/**
 * Add milestone to campaign
 */
export async function addMilestone(
  senderAddress: string,
  campaignId: number,
  title: string,
  description: string,
  amount: number,
  votingDuration: number
) {
  const functionArgs = [
    uintCV(campaignId),
    stringAsciiCV(title),
    stringUtf8CV(description),
    uintCV(amount),
    uintCV(votingDuration),
  ];

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: MILESTONE_CONTRACT,
    functionName: 'add-milestone',
    functionArgs,
    senderKey: '',
    validateWithAbi: true,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
  };

  return makeContractCall(txOptions);
}

/**
 * Release milestone funds
 */
export async function releaseMilestoneFunds(
  senderAddress: string,
  campaignId: number,
  milestoneId: number
) {
  const functionArgs = [
    uintCV(campaignId),
    uintCV(milestoneId),
  ];

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: MILESTONE_CONTRACT,
    functionName: 'release-milestone-funds',
    functionArgs,
    senderKey: '',
    validateWithAbi: true,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
  };

  return makeContractCall(txOptions);
}

/**
 * Utility: Convert STX to microSTX
 */
export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1_000_000);
}

/**
 * Utility: Convert microSTX to STX
 */
export function microStxToStx(microStx: number): number {
  return microStx / 1_000_000;
}

/**
 * Utility: Convert block time to milliseconds
 */
export function blockTimeToMs(blocks: number): number {
  return blocks * 10 * 60 * 1000; // 10 minutes per block
}

/**
 * Utility: Get campaign status text
 */
export function getCampaignStatus(status: number): string {
  const statuses = ['Unknown', 'Active', 'Successful', 'Failed', 'Cancelled'];
  return statuses[status] || 'Unknown';
}

/**
 * Utility: Get milestone status text
 */
export function getMilestoneStatus(status: number): string {
  const statuses = ['Pending', 'Voting', 'Approved', 'Rejected', 'Released'];
  return statuses[status] || 'Unknown';
}

/**
 * Utility: Get reward tier name
 */
export function getRewardTier(amount: number): string {
  if (amount >= 10_000_000_000) return 'Platinum'; // 10,000 STX
  if (amount >= 1_000_000_000) return 'Gold';      // 1,000 STX
  if (amount >= 100_000_000) return 'Silver';      // 100 STX
  return 'Bronze';                                  // < 100 STX
}
