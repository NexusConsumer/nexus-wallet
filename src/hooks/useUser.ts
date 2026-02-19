import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import type { User } from '../types/user.types';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: userApi.getUser,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<User>) => userApi.updateUser(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
