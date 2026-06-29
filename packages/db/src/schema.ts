// packages/db/src/schema.ts
// Fully Typed Schema Validations via Zod for Request Handlers

import { z } from 'zod';

// ==========================================
// AUTH & USERS VALIDATION
// ==========================================
export const UserProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(50).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

// ==========================================
// CONTACT MESSAGES VALIDATION
// ==========================================
export const ContactMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(255),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters long').max(255).optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

// ==========================================
// ROOM AVAILABILITY VALIDATION
// ==========================================
export const RoomQuerySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in must be a valid ISO Date (YYYY-MM-DD)'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out must be a valid ISO Date (YYYY-MM-DD)'),
  guests: z.coerce.number().int().min(1).max(10).default(1),
  roomClassSlug: z.string().optional(),
});

// ==========================================
// TRANSACTIONS & BOOKINGS VALIDATION
// ==========================================
export const CreateBookingSchema = z.object({
  roomClassId: z.string().uuid('Invalid room class unique identifier'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in must be YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out must be YYYY-MM-DD'),
  promoCode: z.string().max(50).trim().toUpperCase().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  specialRequests: z.string().max(2000).optional().nullable(),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'crypto', 'stripe']).default('stripe'),
  token: z.string().optional(), // For payment processing simulators
});

// ==========================================
// ADMIN BOOKING STATUS UPDATES VALIDATION
// ==========================================
export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']),
  roomId: z.string().uuid('Invalid room physical identification assignment').optional().nullable(),
});
