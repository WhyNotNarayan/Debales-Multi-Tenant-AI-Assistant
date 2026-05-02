import { cookies } from 'next/headers';
import { User } from '@/models/User';
import connectToDatabase from './mongodb';

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_id')?.value;
  
  if (!userId) return null;

  await connectToDatabase();
  const user = await User.findById(userId).lean();
  return user;
}

export async function canAccessProject(user: any, projectId: string) {
  if (!user) return false;
  // Admin can access everything, or strict project check?
  // User requirements say "Users can ONLY access their project."
  return user.projectId.toString() === projectId;
}

export function isAdmin(user: any) {
  return user?.role === 'ADMIN';
}
