// apps/web/src/app/api/v1/payments/webhook/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../../../../../../packages/db/src/supabase';

// Explicitly export config for App Router to receive raw body correctly
export const dynamic = 'force-dynamic';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = new Stripe(stripeSecretKey || 'mock', {
  apiVersion: '2025-01-27-preview' as any,
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    // Cryptographic signature validation
    try {
      if (!stripeSecretKey || !webhookSecret) {
        console.warn('⚠️ Stripe credentials or Webhook Secret missing. Emulating webhook payload parse for staging/development.');
        // Parse directly for testing/local environments when secret is missing
        event = JSON.parse(rawBody) as Stripe.Event;
      } else {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      }
    } catch (err: any) {
      console.error(`❌ Webhook cryptographic signature verification failed: ${err.message}`);
      return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status: 400 });
    }

    const eventId = event.id;

    // 1. Idempotency Check / Redundant Event Detection
    const { data: existingLog, error: logCheckError } = await supabaseAdmin
      .from('financial_audit_logs')
      .select('id')
      .eq('details', `Processed Stripe Webhook Event ID: ${eventId}`)
      .maybeSingle();

    if (existingLog) {
      console.log(`ℹ️ Event ${eventId} was already processed. Skipping to avoid redundant updates.`);
      return NextResponse.json({ success: true, message: 'Event already processed' }, { status: 200 });
    }

    // 2. Event Routing
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
      const gatewayRef = session.id;

      if (!bookingId) {
        return NextResponse.json({ success: false, error: 'No bookingId metadata found in Stripe session' }, { status: 400 });
      }

      console.log(`⚡ Processing successful payment for booking ${bookingId} via Stripe Session ${gatewayRef}`);

      // Call the stored procedure to atomically process the payment, insert transaction,
      // update statuses, write invoices and record audits under pessimistic write-locks.
      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
        'confirm_booking_payment_atomic',
        {
          p_booking_id: bookingId,
          p_gateway_ref: gatewayRef,
          p_amount: amountTotal,
          p_payment_method: 'stripe',
          p_actor_id: null, // System event
          p_ip_address: req.headers.get('x-forwarded-for') || '0.0.0.0'
        }
      );

      if (rpcError) {
        console.error('❌ Atomic billing procedure failed inside transaction block:', rpcError);
        return NextResponse.json({ success: false, error: rpcError.message }, { status: 500 });
      }

      if (!rpcResult || !rpcResult.success) {
        console.error('❌ Transaction logic error returned by database:', rpcResult?.error);
        return NextResponse.json({ success: false, error: rpcResult?.error || 'Database RPC failure' }, { status: 400 });
      }

      // Record successful webhook verification log to prevent event duplication
      await supabaseAdmin.from('financial_audit_logs').insert({
        action: 'STRIPE_WEBHOOK_PROCESSED',
        details: `Processed Stripe Webhook Event ID: ${eventId}`,
        new_state: {
          eventId,
          bookingId,
          gatewayRef,
          amountTotal,
          invoiceNumber: rpcResult.invoice_number
        }
      });

      console.log(`✅ Webhook fully finalized. Generated invoice: ${rpcResult.invoice_number}`);
    }

    return NextResponse.json({ success: true, eventProcessed: event.type }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Unhandled webhook processing error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred' }, { status: 500 });
  }
}
