import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { User } from '@/types/user.types';

export const useSession = () => {
  return useQuery<User | null>({
    queryKey: ['sessionProfile'],
    queryFn: async () => {
      try {
        const response = await userService.getProfile();
        return response.data;
      } catch (error) {
        return null; // Gracefully handle unauthenticated state 
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't aggressively retry for auth status failures
    refetchOnWindowFocus: true, // Keep state fresh if user swaps tabs
  });
};
