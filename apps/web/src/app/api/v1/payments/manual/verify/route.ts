// apps/web/src/app/api/v1/payments/manual/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../../../../packages/db/src/supabase';
import { verifyAuth, unauthorizedResponse } from '../../../../../middleware/auth';
import { checkRole, forbiddenResponse, ADMIN_STAFF_ROLES } from '../../../../../middleware/rbac';
import { z } from 'zod';

const VerifyReceiptSchema = z.object({
  bookingId: z.string().uuid(),
  receiptId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  amount: z.number().positive(),
  rejectionReason: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await verifyAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }

    // 2. Authorize user (Only admin, manager, receptionist roles permitted)
    const isAuthorized = checkRole(user.role as any, ADMIN_STAFF_ROLES);
    if (!isAuthorized) {
      return forbiddenResponse();
    }

    // 3. Parse and validate body
    const rawBody = await req.json();
    const validated = VerifyReceiptSchema.safeParse(rawBody);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { bookingId, receiptId, action, amount, rejectionReason } = validated.data;
    const ipAddress = req.headers.get('x-forwarded-for') || '0.0.0.0';

    // Fetch the receipt to ensure validity
    const { data: receipt, error: fetchError } = await supabaseAdmin
      .from('payment_receipts')
      .select('*')
      .eq('id', receiptId)
      .maybeSingle();

    if (fetchError || !receipt) {
      return NextResponse.json(
        { success: false, error: 'Receipt record not found or lookup failed.' },
        { status: 404 }
      );
    }

    if (receipt.verification_status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `This receipt has already been processed and is currently '${receipt.verification_status}'.` },
        { status: 409 }
      );
    }

    if (action === 'approve') {
      // Execute the atomic payment stored procedure (Locks booking, completes transaction, writes invoice, writes audit logs)
      const gatewayRef = `BANK_TXN_${receiptId.substring(0, 8).toUpperCase()}`;
      
      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
        'confirm_booking_payment_atomic',
        {
          p_booking_id: bookingId,
          p_gateway_ref: gatewayRef,
          p_amount: amount,
          p_payment_method: 'bank_transfer',
          p_actor_id: user.id,
          p_ip_address: ipAddress
        }
      );

      if (rpcError) {
        console.error('❌ Manual approval RPC failed:', rpcError);
        return NextResponse.json({ success: false, error: rpcError.message }, { status: 500 });
      }

      if (!rpcResult || !rpcResult.success) {
        console.error('❌ Transaction exception inside atomic payment block:', rpcResult?.error);
        return NextResponse.json({ success: false, error: rpcResult?.error || 'Procedure execution failed' }, { status: 400 });
      }

      // Update manual receipt status to approved
      await supabaseAdmin
        .from('payment_receipts')
        .update({
          verification_status: 'approved',
          reviewer_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', receiptId);

      // Record verification confirmation audit log
      await supabaseAdmin.from('financial_audit_logs').insert({
        actor_id: user.id,
        action: 'CONFIRM_MANUAL_PAYMENT',
        details: `Staff user '${user.email}' approved manual payment bank receipt ID: ${receiptId}. Issued Invoice: ${rpcResult.invoice_number}`,
        new_state: {
          receiptId,
          bookingId,
          amount,
          invoiceNumber: rpcResult.invoice_number,
          transactionId: rpcResult.transaction_id
        },
        ip_address: ipAddress
      });

      return NextResponse.json({
        success: true,
        message: 'Manual bank receipt successfully verified and atomic transaction committed.',
        details: rpcResult
      });

    } else {
      // Action is Reject
      if (!rejectionReason || rejectionReason.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'A rejection reason is strictly required when rejecting a manual receipt.' },
          { status: 400 }
        );
      }

      // Update manual receipt status to rejected
      await supabaseAdmin
        .from('payment_receipts')
        .update({
          verification_status: 'rejected',
          reviewer_id: user.id,
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', receiptId);

      // Record rejection audit log
      await supabaseAdmin.from('financial_audit_logs').insert({
        actor_id: user.id,
        action: 'REJECT_MANUAL_PAYMENT',
        details: `Staff user '${user.email}' rejected manual receipt ID: ${receiptId}. Reason: ${rejectionReason}`,
        new_state: {
          receiptId,
          bookingId,
          rejectionReason
        },
        ip_address: ipAddress
      });

      return NextResponse.json({
        success: true,
        message: 'Manual bank receipt rejected successfully. Status updated to rejected.'
      });
    }

  } catch (error: any) {
    console.error('❌ Unhandled manual receipt verification error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred' }, { status: 500 });
  }
}
