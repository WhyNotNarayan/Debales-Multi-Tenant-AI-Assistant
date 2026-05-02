import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Message } from '@/models/Message';
import { Conversation } from '@/models/Conversation';
import { generateAIResponse } from '@/lib/gemini';

import { z } from 'zod';

const messageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  await connectToDatabase();
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation || conversation.userId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  return NextResponse.json(messages);
}

import { generateAIStream } from '@/lib/gemini';

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const result = messageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { conversationId, content } = result.data;

    await connectToDatabase();
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation || conversation.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Save user message
    await Message.create({ conversationId, role: 'user', content });

    // Get history for AI
    const history = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(10);

    const aiResponse = await generateAIStream(conversation.projectId.toString(), content, history);

    if (typeof aiResponse === 'string') {
      const assistantMessage = await Message.create({
        conversationId,
        role: 'assistant',
        content: aiResponse,
      });
      return NextResponse.json(assistantMessage);
    }

    // Setup streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = "";
        try {
          for await (const chunk of aiResponse) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullText += content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          
          // Save the full assistant response once stream ends
          await Message.create({
            conversationId,
            role: 'assistant',
            content: fullText,
          });
          
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
