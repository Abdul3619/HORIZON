-- 00001_initial_schema.sql
-- L'Horizon Royal - Relational Database Schema & Migrations
-- Target Database: PostgreSQL 15+ (Supabase compatible)

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'receptionist', 'staff', 'customer');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
CREATE TYPE public.payment_method AS ENUM ('credit_card', 'bank_transfer', 'crypto', 'stripe');

-- ==========================================
-- 1. GLOBAL HOTELS TABLE
-- ==========================================
CREATE TABLE public.hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    phone VARCHAR(50),
    email VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. CUSTOMER PROFILES (USERS)
-- ==========================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    role public.user_role NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. ROOM CLASSES & ROOMS
-- ==========================================
CREATE TABLE public.room_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'Royal Suite', 'Prestige Lake View'
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    base_price_per_night DECIMAL(12,2) NOT NULL,
    max_guests_adults INT NOT NULL DEFAULT 2,
    max_guests_children INT NOT NULL DEFAULT 0,
    size_sq_ft INT NOT NULL,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_class_id UUID NOT NULL REFERENCES public.room_classes(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    floor INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'clean', -- clean, dirty, maintenance
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_class_id, room_number)
);

-- ==========================================
-- 4. DAILY ROOM INVENTORY TRACKER
-- ==========================================
-- Tracks dynamic availability balances per room class per day.
CREATE TABLE public.room_inventories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_class_id UUID NOT NULL REFERENCES public.room_classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_rooms INT NOT NULL, -- Total rooms of this class available physically
    reserved_rooms INT NOT NULL DEFAULT 0, -- Count of actively booked rooms
    price_modifier DECIMAL(5,2) DEFAULT 1.00, -- Dynamic yield management multiplier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_class_id, date)
);

-- ==========================================
-- 5. PROMOTION CODES
-- ==========================================
CREATE TABLE public.promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'ROYAL15'
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- percentage, fixed
    discount_value DECIMAL(12,2) NOT NULL,
    minimum_order_amount DECIMAL(12,2) DEFAULT 0.00,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT,
    usage_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. TRANSACTIONS & BOOKINGS
-- ==========================================
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    promo_code_id UUID REFERENCES public.promo_codes(id),
    status public.booking_status NOT NULL DEFAULT 'pending',
    subtotal_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates_validity CHECK (check_out > check_in)
);

CREATE TABLE public.booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    room_class_id UUID NOT NULL REFERENCES public.room_classes(id) ON DELETE RESTRICT,
    room_id UUID REFERENCES public.rooms(id), -- Nullable initially, physical room allocated on check-in or later
    price_per_night DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. PAYMENTS & FINANCIAL AUDIT LEDGERS
-- ==========================================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    transaction_id VARCHAR(255) UNIQUE, -- Processor transaction ID (Stripe Chg ID)
    amount DECIMAL(12,2) NOT NULL,
    status public.payment_status NOT NULL DEFAULT 'pending',
    payment_method public.payment_method NOT NULL DEFAULT 'credit_card',
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. REVIEWS, SERVICES, GALLERY & CONTACTS
-- ==========================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    room_class_id UUID NOT NULL REFERENCES public.room_classes(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- e.g., 'Butler Service', 'Spa'
    price DECIMAL(12,2) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    url TEXT NOT NULL,
    category VARCHAR(100), -- room, dining, wellness, exterior
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. AUDIT LOGS
-- ==========================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- 'CREATE_BOOKING', 'UPDATE_ROOM', etc.
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- INDEX OPTIMIZATIONS (B-TREE)
-- ==========================================
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_dates ON public.bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_room_inventories_lookup ON public.room_inventories(room_class_id, date);
CREATE INDEX idx_rooms_lookup ON public.rooms(room_class_id, status) WHERE is_active = TRUE;
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_promo_codes_lookup ON public.promo_codes(code) WHERE is_active = TRUE;


-- ==========================================
-- AUTH SYNCHRONIZATION TRIGGER (Supabase Auth -> Public Users)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_first_name VARCHAR(100);
    v_last_name VARCHAR(100);
    v_role public.user_role;
BEGIN
    -- Parse first and last names from raw_user_meta_data if present
    v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'firstName', '');
    v_last_name := COALESCE(new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'lastName', '');
    v_role := COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'customer'::public.user_role);

    INSERT INTO public.users (id, email, first_name, last_name, role, avatar_url)
    VALUES (
        new.id,
        new.email,
        v_first_name,
        v_last_name,
        v_role,
        COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
        last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        updated_at = CURRENT_TIMESTAMP;

    -- Inject Custom Claim back into App Metadata so user has it instantly in their JWT
    UPDATE auth.users
    SET raw_app_metadata = jsonb_set(
        COALESCE(raw_app_metadata, '{}'::jsonb),
        '{role}',
        to_jsonb(v_role::text)
    )
    WHERE id = new.id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- ROLE UPDATES CLAIM SYNCHRONIZATION TRIGGER
-- ==========================================
-- Automatically updates user claims when administrative actions update public.users.role.
CREATE OR REPLACE FUNCTION public.handle_user_role_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE auth.users
        SET raw_app_metadata = jsonb_set(
            COALESCE(raw_app_metadata, '{}'::jsonb),
            '{role}',
            to_jsonb(NEW.role::text)
        )
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_public_user_role_updated
    AFTER UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_role_update();


-- ==========================================
-- STORAGE BUCKETS CONFIGURATIONS & POLICIES
-- ==========================================
-- Create stubs for private receipts & public gallery storage rules
-- Note: Supabase structures buckets within storage.buckets and storage.objects.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('receipts', 'receipts', false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Receipts (Private)
-- Access is restricted to the specific customer (using folder name as user ID match) or admin/staff
CREATE POLICY "Allow users to manage their own receipts" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'receipts' AND 
  (
    (auth.uid()::text = (storage.foldername(name))[1]) OR 
    (COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), 'customer') IN ('admin', 'manager', 'receptionist'))
  )
);

-- RLS Policy: Gallery (Public view, staff managed)
CREATE POLICY "Allow public select on gallery bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Allow staff to upload/delete from gallery bucket"
ON storage.objects FOR ALL
USING (
  bucket_id = 'gallery' AND 
  (COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), 'customer') IN ('admin', 'manager', 'receptionist', 'staff'))
);
