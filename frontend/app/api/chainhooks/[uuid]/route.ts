import { NextRequest, NextResponse } from 'next/server';
import { getChainhook, updateChainhook, deleteChainhook } from '@/lib/chainhooks/client';

// GET /api/chainhooks/[uuid] - Get specific chainhook
export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const chainhook = await getChainhook(params.uuid);
    return NextResponse.json(chainhook);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chainhook' },
      { status: 500 }
    );
  }
}

// PUT /api/chainhooks/[uuid] - Update chainhook
export async function PUT(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const body = await request.json();
    const chainhook = await updateChainhook(params.uuid, body);
    return NextResponse.json(chainhook);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update chainhook' },
      { status: 500 }
    );
  }
}

// DELETE /api/chainhooks/[uuid] - Delete chainhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    await deleteChainhook(params.uuid);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete chainhook' },
      { status: 500 }
    );
  }
}
