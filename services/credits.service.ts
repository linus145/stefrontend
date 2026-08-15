import { api } from '@/lib/api';
import { UserCredit, CreditTransaction } from '@/types/credits.types';

export const creditsService = {
  getBalance: (): Promise<{ data: UserCredit }> => {
    return api.get<{ data: UserCredit }>('/credits/balance/');
  },

  getTransactionHistory: (): Promise<{ data: CreditTransaction[] }> => {
    return api.get<{ data: CreditTransaction[] }>('/credits/history/');
  },

  purchaseCredits: (
    amount: number, 
    packageName: string = 'Credit Top-up',
    transactionId: string = '',
    paymentMethod: string = 'UPI',
    upiOrPhone: string = '',
    screenshotFile?: File | string | null
  ): Promise<{ data: any }> => {
    if (screenshotFile && typeof screenshotFile !== 'string') {
      const formData = new FormData();
      formData.append('amount', String(amount));
      formData.append('package_name', packageName);
      formData.append('transaction_id', transactionId);
      formData.append('payment_method', paymentMethod);
      formData.append('upi_or_phone', upiOrPhone);
      formData.append('screenshot', screenshotFile);

      return api.post<{ data: any }>('/credits/purchase/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return api.post<{ data: any }>('/credits/purchase/', { 
      amount, 
      package_name: packageName,
      transaction_id: transactionId,
      payment_method: paymentMethod,
      upi_or_phone: upiOrPhone,
      screenshot: typeof screenshotFile === 'string' ? screenshotFile : ''
    });
  },

  verifyPayment: (transactionId: string, action: string = 'approve'): Promise<{ data: any }> => {
    return api.post<{ data: any }>('/credits/verify-payment/', {
      transaction_id: transactionId,
      action
    });
  }
};
