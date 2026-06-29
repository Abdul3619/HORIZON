// apps/web/src/app/api/v1/payments/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../../../../packages/db/src/supabase';
import { verifyAuth, unauthorizedResponse } from '../../../../../middleware/auth';
import { PaymentGatewayRegistry } from '../../../../../../../../packages/payments/registry';
import { z } from 'zod';

const CheckoutSchema = z.object({
  bookingId: z.string().uuid()
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await verifyAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }

    // 2. Parse payload
    const rawBody = await req.json();
    const validated = CheckoutSchema.safeParse(rawBody);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { bookingId } = validated.data;
    const ipAddress = req.headers.get('x-forwarded-for') || '0.0.0.0';

    // 3. Duplicate Charges Guard: Check if a checkout or payment was initiated for this booking in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    
    const { data: recentInitiations, error: auditError } = await supabaseAdmin
      .from('financial_audit_logs')
      .select('*')
      .eq('action', 'INITIATE_PAYMENT_INTENT')
      .filter('details', 'like', `%booking:${bookingId}%`)
      .gt('created_at', thirtySecondsAgo);

    if (auditError) {
      console.error('Audit log check failed:', auditError);
    }

    if (recentInitiations && recentInitiations.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Security Guard: Duplicate charge request detected. A checkout session was already initiated for this booking in the last 30 seconds. Please check your open tabs or wait before trying again.' 
        },
        { status: 429 }
      );
    }

    // 4. Fetch the booking info from database
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        customer:customer_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking record not found.' },
        { status: 404 }
      );
    }

    if (booking.status === 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'This booking is already confirmed and paid.' },
        { status: 409 }
      );
    }

    const customer = booking.customer as any;
    const guestName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Valued Guest';
    const guestEmail = customer?.email || user.email || '';

    // 5. Use modular PaymentGatewayRegistry to resolve Stripe adapter
    const paymentAdapter = PaymentGatewayRegistry.getAdapter('stripe');

    // Create checkout session / intent
    const paymentResult = await paymentAdapter.createPaymentIntent({
      bookingId: booking.id,
      amount: parseFloat(booking.total_amount),
      currency: 'EUR',
      guestName,
      guestEmail,
      metadata: {
        initiatedBy: user.id
      }
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error || 'Gateway failed to initiate checkout session.' },
        { status: 500 }
      );
    }

    // 6. Record financial audit logs
    await supabaseAdmin.from('financial_audit_logs').insert({
      actor_id: user.id,
      action: 'INITIATE_PAYMENT_INTENT',
      details: `Initiated Stripe payment session for booking:${bookingId}. Gateway ref: ${paymentResult.gatewayReference}`,
      new_state: {
        bookingId,
        gatewayRef: paymentResult.gatewayReference,
        amount: booking.total_amount
      },
      ip_address: ipAddress
    });

    return NextResponse.json({
      success: true,
      message: 'Checkout session successfully initiated.',
      gatewayReference: paymentResult.gatewayReference,
      checkoutUrl: paymentResult.url
    });

  } catch (error: any) {
    console.error('❌ Unhandled checkout init API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred' }, { status: 500 });
  }
}
