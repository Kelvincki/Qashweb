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
