import { api } from '@/lib/api';
import { UserCredit, CreditTransaction } from '@/types/credits.types';

export const creditsService = {
  getBalance: (): Promise<{ data: UserCredit }> => {
    return api.get<{ data: UserCredit }>('/credits/balance/');
  },

  getTransactionHistory: (): Promise<{ data: CreditTransaction[] }> => {
    return api.get<{ data: CreditTransaction[] }>('/credits/history/');
  }
};
