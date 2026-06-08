export interface UserCredit {
  balance: number;
  last_allocated_plan_type: string;
  updated_at: string;
  plan_limit: number;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  activity_type: 'allocation' | 'burn' | 'purchase' | 'refund';
  description: string;
  created_at: string;
}
