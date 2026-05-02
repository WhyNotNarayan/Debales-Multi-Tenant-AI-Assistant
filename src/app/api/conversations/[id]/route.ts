import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { Message } from '@/models/Message';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title } = await request.json();
  const { id } = await params;

  await connectToDatabase();
  const conversation = await Conversation.findOneAndUpdate(
    { _id: id, userId: user._id },
    { title },
    { new: true }
  );

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await connectToDatabase();
  const conversation = await Conversation.findOneAndDelete({ _id: id, userId: user._id });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
  }

  // Also delete all messages in this conversation
  await Message.deleteMany({ conversationId: id });

  return NextResponse.json({ message: 'Conversation deleted' });
}
