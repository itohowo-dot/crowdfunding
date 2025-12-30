import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongodb';
import { Campaign, Contribution, Milestone, Vote, Refund, EventLog } from '@/lib/db/models';
import type { ChainhookPayload } from '@/lib/types/chainhooks';

// Verify webhook signature
function verifyWebhookSignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Extract function arguments from transaction
function extractFunctionArgs(tx: any): Record<string, any> {
  const args: Record<string, any> = {};
  
  if (tx.metadata?.contract_call?.function_args) {
    tx.metadata.contract_call.function_args.forEach((arg: any) => {
      if (arg.name && arg.repr) {
        args[arg.name] = arg.repr;
      }
    });
  }
  
  return args;
}

// Parse Clarity value
function parseValue(repr: string): any {
  if (repr.startsWith('u')) return parseInt(repr.slice(1));
  if (repr === 'true') return true;
  if (repr === 'false') return false;
  if (repr.startsWith('"')) return repr.slice(1, -1);
  return repr;
}

// Process chainhook event
async function processChainhookEvent(payload: ChainhookPayload): Promise<void> {
  await connectDB();

  // Process apply events (new blocks/transactions)
  for (const block of payload.apply) {
    for (const tx of block.transactions) {
      if (!tx.metadata?.contract_call || !tx.metadata.success) continue;

      const { contract_id, function_name } = tx.metadata.contract_call;
      const txId = tx.transaction_identifier.hash;
      const blockHeight = block.block_identifier.index;
      const sender = tx.metadata.sender;
      const args = extractFunctionArgs(tx);

      console.log(`Processing: ${function_name} on ${contract_id}`);

      // Log event
      await EventLog.create({
        eventType: function_name,
        campaignId: parseValue(args['campaign-id'] || '0'),
        txId,
        blockHeight,
        sender,
        data: args,
      });

      // Handle different contract functions
      switch (function_name) {
        case 'create-campaign':
          await handleCampaignCreated({
            campaignId: parseValue(args['campaign-id']),
            creator: sender,
            title: parseValue(args['title'] || ''),
            description: parseValue(args['description'] || ''),
            goal: parseValue(args['goal']),
            deadline: parseValue(args['deadline']),
            milestoneEnabled: parseValue(args['milestone-enabled'] || 'false'),
            createdAt: block.timestamp,
          });
          break;

        case 'contribute':
          await handleContribution({
            campaignId: parseValue(args['campaign-id']),
            contributor: sender,
            amount: parseValue(args['amount']),
            timestamp: block.timestamp,
            txId,
            blockHeight,
          });
          break;

        case 'claim-funds':
          await handleFundsClaimed({
            campaignId: parseValue(args['campaign-id']),
            timestamp: block.timestamp,
          });
          break;

        case 'refund':
          await handleRefund({
            campaignId: parseValue(args['campaign-id']),
            contributor: sender,
            amount: parseValue(args['amount']),
            timestamp: block.timestamp,
            txId,
            blockHeight,
          });
          break;

        case 'vote-on-milestone':
          await handleVote({
            campaignId: parseValue(args['campaign-id']),
            milestoneId: parseValue(args['milestone-id']),
            voter: sender,
            vote: parseValue(args['vote']),
            votingPower: parseValue(args['voting-power'] || '0'),
            timestamp: block.timestamp,
            txId,
          });
          break;

        case 'release-milestone-funds':
          await handleMilestoneRelease({
            campaignId: parseValue(args['campaign-id']),
            milestoneId: parseValue(args['milestone-id']),
            amount: parseValue(args['amount']),
            timestamp: block.timestamp,
          });
          break;
      }
    }
  }

  // Handle rollbacks (chain reorganizations)
  for (const block of payload.rollback) {
    console.log(`Rolling back block ${block.block_identifier.index}`);
    // You can implement rollback logic here if needed
    // For now, we'll just log it
  }
}

// Event handlers
async function handleCampaignCreated(data: any) {
  const campaign = await Campaign.findOne({ campaignId: data.campaignId });
  
  if (!campaign) {
    await Campaign.create(data);
    console.log(`✓ Campaign ${data.campaignId} created`);
  }
}

async function handleContribution(data: any) {
  // Check if contribution already exists
  const existing = await Contribution.findOne({ txId: data.txId });
  if (existing) return;

  // Create contribution
  await Contribution.create(data);

  // Update campaign raised amount and backer count
  await Campaign.findOneAndUpdate(
    { campaignId: data.campaignId },
    { 
      $inc: { raised: data.amount, backerCount: 1 },
      $set: { updatedAt: data.timestamp }
    }
  );

  console.log(`✓ Contribution ${data.amount} to campaign ${data.campaignId}`);
}

async function handleFundsClaimed(data: any) {
  await Campaign.findOneAndUpdate(
    { campaignId: data.campaignId },
    { 
      $set: { 
        status: 2, // successful
        updatedAt: data.timestamp 
      } 
    }
  );

  console.log(`✓ Funds claimed for campaign ${data.campaignId}`);
}

async function handleRefund(data: any) {
  // Check if refund already exists
  const existing = await Refund.findOne({ txId: data.txId });
  if (existing) return;

  // Create refund record
  await Refund.create(data);

  // Mark contribution as refunded
  await Contribution.updateMany(
    { campaignId: data.campaignId, contributor: data.contributor },
    { $set: { refunded: true } }
  );

  console.log(`✓ Refund processed for campaign ${data.campaignId}`);
}

async function handleVote(data: any) {
  // Check if vote already exists
  const existing = await Vote.findOne({ txId: data.txId });
  if (existing) return;

  // Create vote record
  await Vote.create(data);

  // Update milestone vote counts
  const update: any = {
    $inc: { totalVoters: 1 }
  };

  if (data.vote) {
    update.$inc.yesVotes = data.votingPower;
  } else {
    update.$inc.noVotes = data.votingPower;
  }

  await Milestone.findOneAndUpdate(
    { campaignId: data.campaignId, milestoneId: data.milestoneId },
    update
  );

  console.log(`✓ Vote recorded for milestone ${data.milestoneId}`);
}

async function handleMilestoneRelease(data: any) {
  await Milestone.findOneAndUpdate(
    { campaignId: data.campaignId, milestoneId: data.milestoneId },
    { 
      $set: { 
        status: 4, // released
        releasedAt: data.timestamp,
        approved: true
      } 
    }
  );

  console.log(`✓ Milestone ${data.milestoneId} funds released`);
}

// POST /api/chainhooks/webhook - Receive webhook events
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-chainhook-signature');
    const secret = process.env.SECRET_KEY!;

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload: ChainhookPayload = JSON.parse(rawBody);

    // Process the event
    await processChainhookEvent(payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// GET /api/chainhooks/webhook - Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Chainhooks webhook endpoint is ready' 
  });
}
