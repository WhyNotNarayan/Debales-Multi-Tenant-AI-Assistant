import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Integration } from '@/models/Integration';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  await connectToDatabase();
  const integration = await Integration.findOne({ projectId });
  return NextResponse.json(integration);
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId, shopifyEnabled, crmEnabled } = await request.json();

  await connectToDatabase();
  const integration = await Integration.findOneAndUpdate(
    { projectId },
    { shopifyEnabled, crmEnabled },
    { new: true, upsert: true }
  );

  return NextResponse.json(integration);
}
