import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { ProductInstance } from '@/models/ProductInstance';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const productInstanceId = searchParams.get('productInstanceId');

  if (!projectId || user.projectId.toString() !== projectId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectToDatabase();
  const filter: any = { projectId, userId: user._id };
  if (productInstanceId) filter.productInstanceId = productInstanceId;

  const conversations = await Conversation.find(filter).sort({ updatedAt: -1 });
  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, productInstanceId, title } = await request.json();

  if (user.projectId.toString() !== projectId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectToDatabase();
  const conversation = await Conversation.create({
    projectId,
    productInstanceId,
    userId: user._id,
    title: title || 'New Chat',
  });

  return NextResponse.json(conversation);
}
