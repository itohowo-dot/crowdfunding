import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Contribution } from '@/lib/db/models';

// GET /api/campaigns/[id]/contributions - Get all contributions for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const campaignId = parseInt(params.id);
    const contributions = await Contribution
      .find({ campaignId })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({ contributions });
  } catch (error: any) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
