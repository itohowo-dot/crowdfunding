import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Contribution, Campaign } from '@/lib/db/models';

// GET /api/users/[address]/contributions - Get all contributions by a user
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    await connectDB();

    const contributions = await Contribution
      .find({ contributor: params.address })
      .sort({ timestamp: -1 })
      .lean();

    // Get campaign details for each contribution
    const contributionsWithCampaigns = await Promise.all(
      contributions.map(async (contribution) => {
        const campaign = await Campaign
          .findOne({ campaignId: contribution.campaignId })
          .lean();

        return {
          ...contribution,
          campaign,
        };
      })
    );

    // Calculate stats
    const stats = {
      totalContributed: contributions.reduce((sum, c) => sum + c.amount, 0),
      totalCampaigns: new Set(contributions.map(c => c.campaignId)).size,
      totalContributions: contributions.length,
    };

    return NextResponse.json({
      contributions: contributionsWithCampaigns,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching user contributions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
