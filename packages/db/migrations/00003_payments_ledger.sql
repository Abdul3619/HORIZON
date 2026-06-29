-- 00003_payments_ledger.sql
-- L'Horizon Royal - Financial Audit Ledgers, Taxes & Transactional Rules
-- Target: PostgreSQL 15+ (Supabase)

-- ==========================================
-- 1. TAX CONFIGURATIONS
-- ==========================================
CREATE TABLE public.tax_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'VAT', 'Tourism Levy', 'Service Charge'
    rate_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Luxury Taxes
INSERT INTO public.tax_configurations (name, rate_percentage)
VALUES 
    ('Luxury VAT', 8.00),
    ('French Riviera Tourism Levy', 4.00),
    ('Regal Service Surcharge', 5.00)
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 2. IMMUTABLE FINANCIAL LEDGER (TRANSACTIONS)
-- ==========================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    gateway_reference VARCHAR(255) UNIQUE NOT NULL, -- e.g. ch_xxxx or pi_xxxx
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    status VARCHAR(50) NOT NULL, -- 'pending', 'succeeded', 'failed', 'refunded'
    payment_method VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. MANUAL BANK TRANSFER RECEIPTS
-- ==========================================
CREATE TABLE public.payment_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    file_url TEXT NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewer_id UUID REFERENCES public.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. REFUND REQUESTS
-- ==========================================
CREATE TABLE public.refund_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE RESTRICT,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
    reviewer_id UUID REFERENCES public.users(id),
    rejection_reason TEXT,
    gateway_refund_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. AUTOMATED CHECKOUT INVOICES
-- ==========================================
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- LHR-YEAR-XXXXX
    subtotal_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid', 'voided'
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. IMMUTABLE FINANCIAL AUDIT LOGS
-- ==========================================
CREATE TABLE public.financial_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- 'CONFIRM_MANUAL_PAYMENT', 'EXECUTE_REFUND', etc.
    details TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. SECURE DATABASE RULES (DELETE & UPDATE BLOCKERS)
-- ==========================================
-- Guarantee immutable financial history by blocking all DELETE or UPDATE statements 
-- on transactions and financial audit logs.

CREATE OR REPLACE FUNCTION public.block_financial_mutations()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutable Financial Security Rule violation. Mutation or removal of financial records is strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

-- Protect transactions from delete and update
CREATE OR REPLACE TRIGGER protect_transactions_immutability
    BEFORE UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.block_financial_mutations();

-- Protect financial audit logs from delete and update
CREATE OR REPLACE TRIGGER protect_audit_logs_immutability
    BEFORE UPDATE OR DELETE ON public.financial_audit_logs
    FOR EACH ROW EXECUTE FUNCTION public.block_financial_mutations();


-- ==========================================
-- 8. ATOMIC PAYMENT CONFIRMATION STORED PROCEDURE
-- ==========================================
CREATE OR REPLACE FUNCTION public.confirm_booking_payment_atomic(
    p_booking_id UUID,
    p_gateway_ref VARCHAR(255),
    p_amount DECIMAL(12,2),
    p_payment_method VARCHAR(50),
    p_actor_id UUID DEFAULT NULL,
    p_ip_address VARCHAR(45) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_booking_status VARCHAR(50);
    v_invoice_id UUID;
    v_invoice_number VARCHAR(100);
    v_subtotal DECIMAL(12,2);
    v_tax DECIMAL(12,2);
    v_total DECIMAL(12,2);
    v_transaction_id UUID;
    v_room_class_id UUID;
    v_check_in DATE;
    v_check_out DATE;
    v_nights INT;
    v_item RECORD;
BEGIN
    -- 1. Pessimistic lock on booking record
    SELECT status, subtotal_amount, tax_amount, total_amount, check_in, check_out
    INTO v_booking_status, v_subtotal, v_tax, v_total, v_check_in, v_check_out
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking record not found.');
    END IF;

    IF v_booking_status = 'confirmed' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Booking is already confirmed.');
    END IF;

    -- 2. Write transaction to ledger
    INSERT INTO public.transactions (booking_id, gateway_reference, amount, currency, status, payment_method)
    VALUES (p_booking_id, p_gateway_ref, p_amount, 'EUR', 'succeeded', p_payment_method)
    RETURNING id INTO v_transaction_id;

    -- 3. Confirm the booking status
    UPDATE public.bookings
    SET status = 'confirmed'::public.booking_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_booking_id;

    -- 4. Generate unique invoice record
    v_invoice_number := 'LHR-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0');
    
    INSERT INTO public.invoices (booking_id, invoice_number, subtotal_amount, tax_amount, total_amount, status)
    VALUES (p_booking_id, v_invoice_number, v_subtotal, v_tax, v_total, 'paid')
    RETURNING id INTO v_invoice_id;

    -- 5. Record financial audit logs
    INSERT INTO public.financial_audit_logs (actor_id, action, details, previous_state, new_state, ip_address)
    VALUES (
        p_actor_id,
        'CONFIRM_BOOKING_PAYMENT_ATOMIC',
        'Atomic checkout completed for booking ID: ' || p_booking_id::text || '. Generated invoice: ' || v_invoice_number,
        jsonb_build_object('status', v_booking_status),
        jsonb_build_object('status', 'confirmed', 'transaction_id', v_transaction_id, 'invoice_id', v_invoice_id),
        p_ip_address
    );

    RETURN jsonb_build_object(
        'success', true,
        'invoice_number', v_invoice_number,
        'transaction_id', v_transaction_id,
        'booking_id', p_booking_id,
        'amount_paid', p_amount
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
