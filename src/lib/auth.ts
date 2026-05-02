import { cookies } from 'next/headers';
import { User } from '@/models/User';
import connectToDatabase from './mongodb';
import mongoose from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MEMBER';
  projectId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export async function getSession(): Promise<IUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_id')?.value;
  
  if (!userId) return null;

  await connectToDatabase();
  const user = await User.findById(userId).lean();
  return user as unknown as IUser;
}

export async function canAccessProject(user: IUser | null, projectId: string) {
  if (!user) return false;
  return user.projectId.toString() === projectId;
}

export function isAdmin(user: IUser | null) {
  return user?.role === 'ADMIN';
}
