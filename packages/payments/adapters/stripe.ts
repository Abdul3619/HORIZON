// packages/payments/adapters/stripe.ts
import Stripe from 'stripe';
import { PaymentGatewayAdapter } from '../adapter';
import { PaymentIntentPayload, PaymentResult, RefundResult } from '../types';

export class StripeGatewayAdapter extends PaymentGatewayAdapter {
  private stripe: Stripe;

  constructor(apiKey?: string) {
    super();
    const key = apiKey || process.env.STRIPE_SECRET_KEY;
    if (!key) {
      // Lazy throw or empty key warning; we use a fallback to prevent module loading crash
      this.stripe = new Stripe('mock_key_if_missing', {
        apiVersion: '2025-01-27-preview' as any,
      });
    } else {
      this.stripe = new Stripe(key, {
        apiVersion: '2025-01-27-preview' as any,
      });
    }
  }

  getName(): string {
    return 'stripe';
  }

  private checkApiKey() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
  }

  async createPaymentIntent(payload: PaymentIntentPayload): Promise<PaymentResult> {
    try {
      this.checkApiKey();
      
      // Luxury hotels pricing usually in EUR. Converting amount to cents.
      const amountInCents = Math.round(payload.amount * 100);

      // Create a Stripe Checkout Session for PCI-DSS compliance (No card details touch our servers)
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: payload.currency.toLowerCase(),
              product_data: {
                name: `L'Horizon Royal Stay - Booking Ref: ${payload.bookingId}`,
                description: `Pristine hospitality stay for ${payload.guestName}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/success?booking_id=${payload.bookingId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/cancel?booking_id=${payload.bookingId}`,
        customer_email: payload.guestEmail,
        metadata: {
          bookingId: payload.bookingId,
          guestName: payload.guestName,
          ...payload.metadata,
        },
      });

      return {
        success: true,
        gatewayReference: session.id,
        url: session.url || undefined,
        amount: payload.amount,
        currency: payload.currency,
        status: 'pending',
      };
    } catch (error: any) {
      return {
        success: false,
        gatewayReference: 'FAILED_INTENT',
        amount: payload.amount,
        currency: payload.currency,
        status: 'failed',
        error: error.message || 'Unknown Stripe error',
      };
    }
  }

  async verifyPayment(gatewayReference: string): Promise<PaymentResult> {
    try {
      this.checkApiKey();
      
      const session = await this.stripe.checkout.sessions.retrieve(gatewayReference);
      const isPaid = session.payment_status === 'paid';

      return {
        success: isPaid,
        gatewayReference: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency ? session.currency.toUpperCase() : 'EUR',
        status: isPaid ? 'succeeded' : 'pending',
      };
    } catch (error: any) {
      return {
        success: false,
        gatewayReference,
        amount: 0,
        currency: 'EUR',
        status: 'failed',
        error: error.message || 'Failed to verify session',
      };
    }
  }

  async executeRefund(transactionId: string, amount: number, reason: string): Promise<RefundResult> {
    try {
      this.checkApiKey();
      
      // Execute refund using Stripe refunds API
      // transactionId could be the payment_intent ID or charge ID
      const refund = await this.stripe.refunds.create({
        payment_intent: transactionId,
        amount: Math.round(amount * 100),
        reason: 'requested_by_customer',
        metadata: {
          adminReason: reason,
        },
      });

      const isCompleted = refund.status === 'succeeded';

      return {
        success: isCompleted,
        refundId: refund.id,
        amountRefunded: refund.amount ? refund.amount / 100 : amount,
        status: isCompleted ? 'completed' : 'pending',
      };
    } catch (error: any) {
      return {
        success: false,
        amountRefunded: 0,
        status: 'failed',
        error: error.message || 'Failed to execute Stripe refund',
      };
    }
  }
}
