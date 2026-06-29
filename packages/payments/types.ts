// packages/payments/types.ts

export interface PaymentIntentPayload {
  bookingId: string;
  amount: number; // in cents or currency units depending on implementation
  currency: string;
  guestName: string;
  guestEmail: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  gatewayReference: string;
  clientSecret?: string;
  url?: string; // Redirect URL for Stripe Checkout / Hosted elements
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amountRefunded: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}
