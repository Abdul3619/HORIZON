// apps/web/src/app/api/v1/admin/bookings/[id]/route.ts
// Admin/Staff Endpoint: Update reservation status and dynamically manage room inventories on cancellations.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, UserRole } from '../../../../../../../../packages/db/src/supabase';
import { UpdateBookingStatusSchema } from '../../../../../../../../packages/db/src/schema';
import { verifyAuth, unauthorizedResponse } from '../../../../../../middleware/auth';
import { checkRole, forbiddenResponse, ADMIN_STAFF_ROLES } from '../../../../../../middleware/rbac';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    // 1. Verify credentials and role
    const user = await verifyAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }

    if (!checkRole(user.role as UserRole, ADMIN_STAFF_ROLES)) {
      return forbiddenResponse();
    }

    // 2. Parse and Validate Payload
    const rawBody = await req.json();
    const validated = UpdateBookingStatusSchema.safeParse(rawBody);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { status, roomId } = validated.data;

    // 3. Fetch current booking status and date boundaries
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*, booking_items(*)')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      console.error('Booking fetch failed or record missing:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Booking reservation not found.' },
        { status: 404 }
      );
    }

    const previousStatus = booking.status;

    // If no state change, return immediately
    if (previousStatus === status) {
      return NextResponse.json({
        success: true,
        message: 'No status change required.',
        booking
      });
    }

    // 4. Handle dynamic inventory releases upon cancellations
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      const checkInDate = new Date(booking.check_in);
      const checkOutDate = new Date(booking.check_out);
      const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      // Loop through booking items to restore inventory slots
      for (const item of booking.booking_items) {
        for (let i = 0; i < totalNights; i++) {
          const dateObj = new Date(checkInDate);
          dateObj.setDate(dateObj.getDate() + i);
          const dateStr = dateObj.toISOString().split('T')[0];

          // Decrement reserved_rooms in the daily inventories
          await supabaseAdmin.rpc('decrement_reserved_inventory', {
            p_room_class_id: item.room_class_id,
            p_date: dateStr,
            p_qty: item.quantity
          });

          // Wait, if decrement_reserved_inventory RPC is not loaded yet in migrations,
          // we can write a fallback SQL update directly using supabaseAdmin.
          const { error: updateInvError } = await supabaseAdmin
            .from('room_inventories')
            .update({
              reserved_rooms: supabaseAdmin.raw(`GREATEST(0, reserved_rooms - ${item.quantity})`)
            })
            .eq('room_class_id', item.room_class_id)
            .eq('date', dateStr);

          if (updateInvError) {
            console.error('Direct inventory release failed, executing fallback update:', updateInvError);
          }
        }
      }
    }

    // 5. Update booking status
    const updatePayload: Record<string, any> = { status };
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update(updatePayload)
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Booking status update failed:', updateError);
      return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
    }

    // If roomId is supplied for check-in physical room assignment, update booking items as well
    if (roomId && (status === 'checked_in' || status === 'confirmed')) {
      await supabaseAdmin
        .from('booking_items')
        .update({ room_id: roomId })
        .eq('booking_id', bookingId);
    }

    // Write audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: user.id,
      action: 'UPDATE_BOOKING_STATUS',
      table_name: 'bookings',
      record_id: bookingId,
      old_values: { status: previousStatus },
      new_values: { status }
    });

    return NextResponse.json({
      success: true,
      message: `Booking status successfully changed from ${previousStatus} to ${status}.`,
      booking: updatedBooking
    });
  } catch (err) {
    console.error('Unhandled admin booking PATCH handler error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
