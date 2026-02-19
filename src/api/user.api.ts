import { mockGetUser, mockUpdateUser } from '../mock/handlers/user.handler';
import type { User } from '../types/user.types';

export const userApi = {
  getUser: () => mockGetUser(),
  updateUser: (updates: Partial<User>) => mockUpdateUser(updates),
};
