export type PageRoute = '/' | '/pricing' | '/privacy' | '/legal' | '/login' | '/register' | '/dashboard' | '/auth/callback' | '/paiement/succes' | '/paiement/annule';

export interface PricingBreakdown {
  managersCount: number;
  employeesCount: number;
  managerPriceUnit: number;
  employeePriceUnit: number;
  totalManagersPrice: number;
  totalEmployeesPrice: number;
  totalMonthlyPrice: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'grace'
  | 'expired'
  | 'no_store'
  | 'no_subscription'
  | string;

export interface MySubscriptionData {
  status: SubscriptionStatus;
  role?: string;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  access_until?: string | null;
  employee_count?: number;
  store_name?: string;
  store_code?: string;
  [key: string]: any;
}

export interface CheckoutQuotePlan {
  key: '1m' | '12m' | string;
  label: string;
  months: number;
  amount: number;
  full_price?: number;
  discount?: number;
}

export interface CheckoutQuote {
  seats: number;
  monthly: number;
  plans: CheckoutQuotePlan[];
}
