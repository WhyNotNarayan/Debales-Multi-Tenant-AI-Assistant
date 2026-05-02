import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { DashboardConfig } from '@/models/DashboardConfig';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId || user.projectId.toString() !== projectId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectToDatabase();
  const config = await DashboardConfig.findOne({ projectId });
  
  if (!config) {
    // Default config if none exists
    return NextResponse.json({
      sections: [
        { title: 'Overview', widgets: ['usersCount', 'conversationCount'] },
        { title: 'Integrations', widgets: ['shopifyStatus', 'crmStatus'] }
      ]
    });
  }

  return NextResponse.json(config);
}
