import { NextRequest, NextResponse } from 'next/server';
import { createChainhook, getChainhooks } from '@/lib/chainhooks/client';
import type { ChainhookRequest } from '@/lib/types/chainhooks';

// GET /api/chainhooks - List all chainhooks
export async function GET() {
  try {
    const chainhooks = await getChainhooks();
    return NextResponse.json(chainhooks);
  } catch (error: any) {
    console.error('Error fetching chainhooks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chainhooks' },
      { status: 500 }
    );
  }
}

// POST /api/chainhooks - Create a new chainhook
export async function POST(request: NextRequest) {
  try {
    const body: ChainhookRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, eventType' },
        { status: 400 }
      );
    }

    const chainhook = await createChainhook(body);
    return NextResponse.json(chainhook, { status: 201 });
  } catch (error: any) {
    console.error('Error creating chainhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create chainhook' },
      { status: 500 }
    );
  }
}
