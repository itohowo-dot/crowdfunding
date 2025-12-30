import { NextRequest, NextResponse } from 'next/server';
import { toggleChainhook } from '@/lib/chainhooks/client';

// POST /api/chainhooks/[uuid]/toggle - Enable/disable chainhook
export async function POST(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { enabled } = await request.json();
    
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    await toggleChainhook(params.uuid, enabled);
    return NextResponse.json({ success: true, enabled });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to toggle chainhook' },
      { status: 500 }
    );
  }
}
