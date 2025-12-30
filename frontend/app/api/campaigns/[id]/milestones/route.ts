import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Milestone, Vote } from '@/lib/db/models';

// GET /api/campaigns/[id]/milestones - Get all milestones for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const campaignId = parseInt(params.id);
    const milestones = await Milestone
      .find({ campaignId })
      .sort({ createdAt: 1 })
      .lean();

    // Get votes for each milestone
    const milestonesWithVotes = await Promise.all(
      milestones.map(async (milestone) => {
        const votes = await Vote
          .find({ campaignId, milestoneId: milestone.milestoneId })
          .lean();

        return {
          ...milestone,
          votes: votes.length,
          voteDetails: votes,
        };
      })
    );

    return NextResponse.json({ milestones: milestonesWithVotes });
  } catch (error: any) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}
