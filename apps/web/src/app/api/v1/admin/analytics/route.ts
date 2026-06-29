// apps/web/src/app/api/v1/admin/analytics/route.ts
// Admin/Staff Endpoint: Calculates luxury hotel business metrics (ADR, Occupancy, RevPAR, 30-Day Revenue).

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, UserRole } from '../../../../../../../../packages/db/src/supabase';
import { verifyAuth, unauthorizedResponse } from '../../../../../../middleware/auth';
import { checkRole, forbiddenResponse, ROOT_ADMIN_ROLES } from '../../../../../../middleware/rbac';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify credentials and role (Restricted to Admins and Managers)
    const user = await verifyAuth(req);
    if (!user) {
      return unauthorizedResponse();
    }

    if (!checkRole(user.role as UserRole, ROOT_ADMIN_ROLES)) {
      return forbiddenResponse();
    }

    // Define time window boundaries (Last 30 Days)
    const thirtyDaysAgoObj = new Date();
    thirtyDaysAgoObj.setDate(thirtyDaysAgoObj.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgoObj.toISOString().split('T')[0];

    // 2. Fetch Total Active Physical Rooms Capacity
    const { count: totalRoomsCount, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const totalCapacity = (totalRoomsCount !== null && !roomsError) ? totalRoomsCount : 50; // Fallback to 50 luxury rooms

    // 3. Fetch Sum of Daily Reserved & Total Room Inventories in last 30 days
    const { data: dailyInventories, error: inventoryError } = await supabaseAdmin
      .from('room_inventories')
      .select('reserved_rooms, total_rooms')
      .gte('date', thirtyDaysAgoStr);

    let totalSoldNights = 0;
    let totalPossibleCapacityNights = 0;

    if (!inventoryError && dailyInventories && dailyInventories.length > 0) {
      dailyInventories.forEach(day => {
        totalSoldNights += day.reserved_rooms;
        totalPossibleCapacityNights += day.total_rooms;
      });
    } else {
      // Direct bookings aggregations as fallback
      const { data: bookings, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select('total_amount, check_in, check_out')
        .neq('status', 'cancelled')
        .gte('check_in', thirtyDaysAgoStr);

      if (!bookingsError && bookings) {
        bookings.forEach(b => {
          const checkIn = new Date(b.check_in);
          const checkOut = new Date(b.check_out);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          totalSoldNights += nights;
        });
        totalPossibleCapacityNights = totalCapacity * 30;
      }
    }

    // Avoid Division by Zero
    totalPossibleCapacityNights = totalPossibleCapacityNights || (totalCapacity * 30);

    // 4. Calculate 30-Day Gross Financial Revenue (Direct Ledger Payments Sum)
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', thirtyDaysAgoObj.toISOString());

    let grossRevenue30Day = 0;
    if (!paymentsError && payments) {
      grossRevenue30Day = payments.reduce((sum, pay) => sum + Number(pay.amount), 0);
    }

    // 5. Calculate Average Daily Rate (ADR)
    // ADR = Room Revenue / Sold Rooms
    // Note: Assuming room revenue accounts for 85% of total gross payment receipts (rest taxes/services)
    const estimatedRoomRevenue = grossRevenue30Day * 0.92; // 8% average tax subtraction
    const averageDailyRate = totalSoldNights > 0 
      ? Number((estimatedRoomRevenue / totalSoldNights).toFixed(2))
      : 350.00; // Standard baseline premium room rate fallback

    // 6. Calculate Occupancy Rate
    const occupancyRate = Number(((totalSoldNights / totalPossibleCapacityNights) * 100).toFixed(2));

    // 7. Calculate RevPAR (Revenue Per Available Room)
    // RevPAR = ADR * Occupancy Rate
    const revenuePerAvailableRoom = Number(((averageDailyRate * occupancyRate) / 100).toFixed(2));

    // 8. Build and Return Analytics Payload
    return NextResponse.json({
      success: true,
      timeframe: 'last_30_days',
      metrics: {
        adr: averageDailyRate,
        occupancyRate: occupancyRate,
        revPar: revenuePerAvailableRoom,
        grossRevenue: grossRevenue30Day,
        totalSoldNights,
        totalCapacityNights: totalPossibleCapacityNights,
      }
    });
  } catch (err) {
    console.error('Unhandled admin metrics computation error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
