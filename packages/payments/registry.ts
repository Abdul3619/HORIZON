// packages/payments/registry.ts
import { PaymentGatewayAdapter } from './adapter';
import { StripeGatewayAdapter } from './adapters/stripe';

export class PaymentGatewayRegistry {
  private static adapters: Map<string, PaymentGatewayAdapter> = new Map();

  // Pre-register default Stripe adapter
  static {
    const stripeAdapter = new StripeGatewayAdapter();
    this.adapters.set(stripeAdapter.getName(), stripeAdapter);
  }

  /**
   * Register a custom gateway adapter
   */
  static registerAdapter(name: string, adapter: PaymentGatewayAdapter): void {
    this.adapters.set(name, adapter);
  }

  /**
   * Resolve and get a payment gateway adapter by name
   */
  static getAdapter(name: string): PaymentGatewayAdapter {
    const adapter = this.adapters.get(name.toLowerCase());
    if (!adapter) {
      throw new Error(`Payment gateway adapter '${name}' is not registered in the system registry.`);
    }
    return adapter;
  }

  /**
   * Get all registered adapter names
   */
  static getRegisteredNames(): string[] {
    return Array.from(this.adapters.keys());
  }
}
