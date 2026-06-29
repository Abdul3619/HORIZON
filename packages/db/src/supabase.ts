// packages/db/src/supabase.ts
// Supabase Client Config & Typed Database Interfaces
import { createClient } from '@supabase/supabase-js';

// Access Environment variables (Node/Server environment variables)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mock.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-role-key';

if (!process.env.SUPABASE_URL) {
  console.warn('Missing SUPABASE_URL environment variable. Using mock values.');
}

// 1. PUBLIC CLIENT (respects Row-Level Security)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// 2. PRIVILEGED ADMINISTRATIVE CLIENT (Bypasses RLS triggers/policies safely on the backend)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// 3. FACTORY FOR USER-SPECIFIC SESSION CLIENT
export function getSupabaseUserClient(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

// ==========================================
// DATABASE TYPES
// ==========================================
export type UserRole = 'admin' | 'manager' | 'receptionist' | 'staff' | 'customer';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'crypto' | 'stripe';

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomClass {
  id: string;
  hotel_id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price_per_night: number;
  max_guests_adults: number;
  max_guests_children: number;
  size_sq_ft: number;
  amenities: string[];
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_class_id: string;
  room_number: string;
  floor: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomInventory {
  id: string;
  room_class_id: string;
  date: string;
  total_rooms: number;
  reserved_rooms: number;
  price_modifier: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  check_in: string;
  check_out: string;
  promo_code_id: string | null;
  status: BookingStatus;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  room_class_id: string;
  room_id: string | null;
  price_per_night: number;
  quantity: number;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  transaction_id: string | null;
  amount: number;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  raw_payload: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  starts_at: string;
  expires_at: string;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_resolved: boolean;
  created_at: string;
}
