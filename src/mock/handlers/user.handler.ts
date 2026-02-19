import { mockUser } from '../data/user.mock';
import type { User } from '../../types/user.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetUser(): Promise<User> {
  await delay(200);
  return { ...mockUser };
}

export async function mockUpdateUser(updates: Partial<User>): Promise<User> {
  await delay(400);
  return { ...mockUser, ...updates };
}
