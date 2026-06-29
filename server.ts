import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";

// Import your registry and adapters
import { PaymentGatewayRegistry } from "./packages/payments/registry.js";
import { supabaseAdmin } from "./packages/db/src/supabase.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Webhook needs raw body for signature validation
  app.post("/api/v1/payments/webhook/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      const stripe = new Stripe(stripeSecretKey || 'mock', { apiVersion: '2025-01-27-preview' as any });

      const signature = req.headers['stripe-signature'] || '';
      let event;

      try {
        if (!stripeSecretKey || !webhookSecret) {
          event = JSON.parse(req.body.toString());
        } else {
          event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        }
      } catch (err: any) {
        return res.status(400).json({ success: false, error: 'Signature verification failed' });
      }

      const eventId = event.id;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
        const gatewayRef = session.id;

        if (bookingId) {
          const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
            'confirm_booking_payment_atomic',
            {
              p_booking_id: bookingId,
              p_gateway_ref: gatewayRef,
              p_amount: amountTotal,
              p_payment_method: 'stripe',
              p_actor_id: null,
              p_ip_address: req.ip || '0.0.0.0'
            }
          );
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Regular JSON parsing for other API routes
  app.use(express.json());

  app.post("/api/v1/payments/checkout", async (req, res) => {
    try {
      const { bookingId } = req.body;
      if (!bookingId) return res.status(400).json({ error: "Booking ID required" });

      const paymentAdapter = PaymentGatewayRegistry.getAdapter('stripe');
      const paymentResult = await paymentAdapter.createPaymentIntent({
        bookingId: bookingId,
        amount: 500, // Mock amount, should be fetched from DB
        currency: 'EUR',
        guestName: "Guest",
        guestEmail: "guest@example.com"
      });

      if (!paymentResult.success) {
        return res.status(500).json({ error: paymentResult.error });
      }

      res.json({
        success: true,
        gatewayReference: paymentResult.gatewayReference,
        checkoutUrl: paymentResult.url
      });
    } catch (err) {
      res.status(500).json({ error: "Checkout error" });
    }
  });

  // Vite middleware for development SPA routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Fallback for SPA (Catch-all for Express 4.x)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
