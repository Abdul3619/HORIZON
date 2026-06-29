// apps/web/src/app/api/v1/rooms/route.ts
// Public Endpoint: Query available room classes based on guest count and date range availability.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../../packages/db/src/supabase';
import { RoomQuerySchema } from '../../../../../../packages/db/src/schema';

export async function GET(req: NextRequest) {
  try {
    // 1. Extract query parameters from request URL
    const { searchParams } = new URL(req.url);
    const queryData = {
      checkIn: searchParams.get('checkIn'),
      checkOut: searchParams.get('checkOut'),
      guests: searchParams.get('guests') || '1',
      roomClassSlug: searchParams.get('roomClassSlug') || undefined,
    };

    // 2. Validate using Zod
    const validated = RoomQuerySchema.safeParse(queryData);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { checkIn, checkOut, guests, roomClassSlug } = validated.data;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) {
      return NextResponse.json(
        { success: false, error: 'Check-out date must be after check-in date.' },
        { status: 400 }
      );
    }

    // 3. Query all available room classes matching capacity rules
    let classQuery = supabaseAdmin
      .from('room_classes')
      .select('*')
      .lte('max_guests_adults', guests); // Simple filter matching guests limit

    if (roomClassSlug) {
      classQuery = classQuery.eq('slug', roomClassSlug);
    }

    const { data: roomClasses, error: classError } = await classQuery;

    if (classError) {
      console.error('Database query error:', classError);
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }

    // 4. Check dynamic day-by-day room inventory for each category
    const availableClasses = [];

    for (const roomClass of roomClasses) {
      // Query daily records in range
      const { data: inventories, error: invError } = await supabaseAdmin
        .from('room_inventories')
        .from('room_inventories')
        .select('date, total_rooms, reserved_rooms, price_modifier')
        .eq('room_class_id', roomClass.id)
        .gte('date', checkIn)
        .lt('date', checkOut);

      if (invError) {
        console.error(`Inventory check error for room class ${roomClass.id}:`, invError);
        continue;
      }

      // Check if fully booked on any night of the range
      let isBookable = true;
      let totalCalculatedCost = 0;
      const daysCounted = new Map<string, boolean>();

      // Loop day-by-day to verify availability
      for (let i = 0; i < totalNights; i++) {
        const dateObj = new Date(checkInDate);
        dateObj.setDate(dateObj.getDate() + i);
        const dateStr = dateObj.toISOString().split('T')[0];

        const invRecord = inventories.find(inv => inv.date === dateStr);
        const reserved = invRecord ? invRecord.reserved_rooms : 0;
        
        // Resolve capacity from rooms if inventory doesn't exist
        let totalRooms = invRecord ? invRecord.total_rooms : 0;
        if (!invRecord) {
          const { count, error: countError } = await supabaseAdmin
            .from('rooms')
            .select('*', { count: 'exact', head: true })
            .eq('room_class_id', roomClass.id)
            .eq('is_active', true);
          
          totalRooms = (!countError && count !== null) ? count : 10;
        }

        if (reserved + 1 > totalRooms) {
          isBookable = false;
          break;
        }

        const priceMod = invRecord ? Number(invRecord.price_modifier) : 1.00;
        totalCalculatedCost += Number(roomClass.base_price_per_night) * priceMod;
      }

      if (isBookable) {
        availableClasses.push({
          ...roomClass,
          calculated_total_price: totalCalculatedCost,
          average_price_per_night: totalCalculatedCost / totalNights,
          nights: totalNights,
        });
      }
    }

    return NextResponse.json({
      success: true,
      checkIn,
      checkOut,
      nights: totalNights,
      results: availableClasses,
    });
  } catch (err) {
    console.error('Unhandled room classes search error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
