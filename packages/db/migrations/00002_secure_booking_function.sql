-- 00002_secure_booking_function.sql
-- L'Horizon Royal - Transactional Booking Engine Stored Procedure
-- Prevent concurrent double-bookings under heavy traffic using pessimistic lock (FOR UPDATE).

CREATE OR REPLACE FUNCTION public.execute_secure_booking(
    p_customer_id UUID,
    p_room_class_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_promo_code VARCHAR(50) DEFAULT NULL,
    p_quantity INT DEFAULT 1,
    p_special_requests TEXT DEFAULT NULL,
    p_tax_rate DECIMAL(4,2) DEFAULT 0.08 -- 8% VAT
)
RETURNS JSONB AS $$
DECLARE
    v_booking_id UUID;
    v_promo_id UUID := NULL;
    v_discount_type VARCHAR(20);
    v_discount_value DECIMAL(12,2) := 0.00;
    v_base_price DECIMAL(12,2);
    v_calculated_subtotal DECIMAL(12,2) := 0.00;
    v_calculated_discount DECIMAL(12,2) := 0.00;
    v_calculated_tax DECIMAL(12,2) := 0.00;
    v_calculated_total DECIMAL(12,2) := 0.00;
    v_night_count INT;
    v_current_date DATE;
    v_inventory_total INT;
    v_inventory_reserved INT;
    v_inventory_price_mod DECIMAL(5,2);
    v_loop_price DECIMAL(12,2);
    v_errors TEXT;
    v_row_record RECORD;
BEGIN
    -- 1. Date range sanity checks
    IF p_check_out <= p_check_in THEN
        RAISE EXCEPTION 'Check-out date must be strictly after check-in date.';
    END IF;

    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Booking quantity must be 1 or greater.';
    END IF;

    -- Calculate total nights
    v_night_count := p_check_out - p_check_in;

    -- 2. Validate customer exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_customer_id) THEN
        RAISE EXCEPTION 'Customer ID % does not exist in profiles.', p_customer_id;
    END IF;

    -- 3. Resolve room class and fetch base price
    SELECT base_price_per_night INTO v_base_price
    FROM public.room_classes
    WHERE id = p_room_class_id;

    IF v_base_price IS NULL THEN
        RAISE EXCEPTION 'Room class ID % not found.', p_room_class_id;
    END IF;

    -- 4. PESSIMISTIC LOCKING LOOP & AVAILABILITY CHECKS
    -- Loop night-by-night from check-in to check-out (exclusive)
    FOR i IN 0..(v_night_count - 1) LOOP
        v_current_date := p_check_in + i;

        -- Check if row exists in room_inventories; insert if missing
        -- First lock the inventory row FOR UPDATE to prevent race conditions.
        SELECT total_rooms, reserved_rooms, price_modifier 
        INTO v_inventory_total, v_inventory_reserved, v_inventory_price_mod
        FROM public.room_inventories
        WHERE room_class_id = p_room_class_id AND date = v_current_date
        FOR UPDATE;

        IF NOT FOUND THEN
            -- If not initialized, assume a standard physical capacity of 10 rooms per category as fallback,
            -- or count the actual physically linked rooms in the rooms table.
            SELECT COUNT(*) INTO v_inventory_total
            FROM public.rooms
            WHERE room_class_id = p_room_class_id AND is_active = TRUE;

            IF v_inventory_total = 0 THEN
                v_inventory_total := 10; -- Standard luxury inventory block size fallback
            END IF;

            v_inventory_reserved := 0;
            v_inventory_price_mod := 1.00;

            -- Insert the inventory placeholder for this day
            INSERT INTO public.room_inventories (room_class_id, date, total_rooms, reserved_rooms, price_modifier)
            VALUES (p_room_class_id, v_current_date, v_inventory_total, 0, 1.00)
            ON CONFLICT (room_class_id, date) DO UPDATE 
            SET total_rooms = EXCLUDED.total_rooms
            RETURNING total_rooms, reserved_rooms, price_modifier 
            INTO v_inventory_total, v_inventory_reserved, v_inventory_price_mod;

            -- Re-lock FOR UPDATE after collision resolution
            SELECT total_rooms, reserved_rooms, price_modifier 
            INTO v_inventory_total, v_inventory_reserved, v_inventory_price_mod
            FROM public.room_inventories
            WHERE room_class_id = p_room_class_id AND date = v_current_date
            FOR UPDATE;
        END IF;

        -- Check availability
        IF (v_inventory_reserved + p_quantity) > v_inventory_total THEN
            RAISE EXCEPTION 'No availability for category % on date %. Requested: %, Free: %', 
                p_room_class_id, v_current_date, p_quantity, (v_inventory_total - v_inventory_reserved);
        END IF;

        -- Apply yield management price modifiers (dynamic pricing)
        v_loop_price := v_base_price * COALESCE(v_inventory_price_mod, 1.00);
        v_calculated_subtotal := v_calculated_subtotal + (v_loop_price * p_quantity);

        -- Update daily inventory (Increment reservation balance)
        UPDATE public.room_inventories
        SET reserved_rooms = reserved_rooms + p_quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE room_class_id = p_room_class_id AND date = v_current_date;
    END LOOP;

    -- 5. RESOLVE PROMOTIONAL CODE
    IF p_promo_code IS NOT NULL AND p_promo_code <> '' THEN
        SELECT id, discount_type, discount_value, minimum_order_amount, usage_limit, usage_count, is_active
        INTO v_promo_id, v_discount_type, v_discount_value, v_calculated_discount, v_row_record -- recycling variable names
        FROM public.promo_codes
        WHERE code = UPPER(p_promo_code) AND is_active = TRUE;

        IF v_promo_id IS NOT NULL THEN
            -- Check promotion dates
            IF NOT EXISTS (
                SELECT 1 FROM public.promo_codes 
                WHERE id = v_promo_id 
                  AND starts_at <= CURRENT_TIMESTAMP 
                  AND expires_at >= CURRENT_TIMESTAMP
            ) THEN
                v_promo_id := NULL; -- Expired or not started
            ELSIF v_row_record IS NOT NULL AND v_row_record.usage_limit IS NOT NULL AND v_row_record.usage_count >= v_row_record.usage_limit THEN
                v_promo_id := NULL; -- Limit exceeded
            ELSIF v_calculated_subtotal < COALESCE((SELECT minimum_order_amount FROM public.promo_codes WHERE id = v_promo_id), 0.00) THEN
                v_promo_id := NULL; -- Subtotal criteria not met
            ELSE
                -- Apply discount
                IF v_discount_type = 'percentage' THEN
                    v_calculated_discount := ROUND((v_calculated_subtotal * (v_discount_value / 100.00)), 2);
                ELSIF v_discount_type = 'fixed' THEN
                    v_calculated_discount := LEAST(v_discount_value, v_calculated_subtotal);
                END IF;

                -- Record promotion usage
                UPDATE public.promo_codes
                SET usage_count = usage_count + 1
                WHERE id = v_promo_id;
            END IF;
        END IF;
    END IF;

    -- Compute ultimate taxes and total amount
    v_calculated_tax := ROUND(((v_calculated_subtotal - v_calculated_discount) * p_tax_rate), 2);
    v_calculated_total := (v_calculated_subtotal - v_calculated_discount) + v_calculated_tax;

    -- 6. WRITE BOOKING TO TRANSACTION LOG
    INSERT INTO public.bookings (
        customer_id, check_in, check_out, promo_code_id, status, 
        subtotal_amount, discount_amount, tax_amount, total_amount, special_requests
    )
    VALUES (
        p_customer_id, p_check_in, p_check_out, v_promo_id, 'pending'::public.booking_status,
        v_calculated_subtotal, v_calculated_discount, v_calculated_tax, v_calculated_total, p_special_requests
    )
    RETURNING id INTO v_booking_id;

    -- Write associated Booking Items (Allocations per class)
    INSERT INTO public.booking_items (booking_id, room_class_id, price_per_night, quantity)
    VALUES (v_booking_id, p_room_class_id, v_base_price, p_quantity);

    -- Log transaction to Audit Log
    INSERT INTO public.audit_logs (actor_id, action, table_name, record_id, new_values)
    VALUES (
        p_customer_id, 
        'CREATE_BOOKING', 
        'bookings', 
        v_booking_id, 
        jsonb_build_object(
            'customer_id', p_customer_id,
            'check_in', p_check_in,
            'check_out', p_check_out,
            'total_amount', v_calculated_total,
            'promo_id', v_promo_id
        )
    );

    -- 7. RETURN COMPREHENSIVE INVOICE SUMMARY
    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'customer_id', p_customer_id,
        'check_in', p_check_in,
        'check_out', p_check_out,
        'nights', v_night_count,
        'subtotal', v_calculated_subtotal,
        'discount', v_calculated_discount,
        'tax', v_calculated_tax,
        'total_amount', v_calculated_total,
        'promo_applied', CASE WHEN v_promo_id IS NOT NULL THEN p_promo_code ELSE NULL END
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Standard error response fallback
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
