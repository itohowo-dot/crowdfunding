import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Campaign, Contribution, Milestone } from '@/lib/db/models';

// GET /api/campaigns/[id] - Get specific campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const campaignId = parseInt(params.id);
    const campaign = await Campaign.findOne({ campaignId }).lean();

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Get additional data
    const contributions = await Contribution
      .find({ campaignId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const milestones = await Milestone
      .find({ campaignId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      campaign,
      contributions,
      milestones,
    });
  } catch (error: any) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}
