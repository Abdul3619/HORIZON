// packages/payments/adapter.ts
import { PaymentIntentPayload, PaymentResult, RefundResult } from './types';

export abstract class PaymentGatewayAdapter {
  abstract getName(): string;
  
  abstract createPaymentIntent(payload: PaymentIntentPayload): Promise<PaymentResult>;
  
  abstract verifyPayment(gatewayReference: string): Promise<PaymentResult>;
  
  abstract executeRefund(transactionId: string, amount: number, reason: string): Promise<RefundResult>;
}
