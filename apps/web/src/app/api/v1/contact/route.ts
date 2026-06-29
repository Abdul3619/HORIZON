// apps/web/src/app/api/v1/contact/route.ts
// Public Endpoint: Store contact inquiries and support messages.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../../packages/db/src/supabase';
import { ContactMessageSchema } from '../../../../../../packages/db/src/schema';
import { applyRateLimit } from '../../../../middleware/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce strict rate-limiting (e.g., maximum 3 contact messages per minute per IP to prevent bot spamming)
    const rateLimitCheck = await applyRateLimit(req, 3, 1);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: rateLimitCheck.headers }
      );
    }

    // 2. Parse and Validate Request Body using Zod
    const rawBody = await req.json();
    const validated = ContactMessageSchema.safeParse(rawBody);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400, headers: rateLimitCheck.headers }
      );
    }

    const { name, email, subject, message } = validated.data;

    // 3. Store the Message in PostgreSQL Database
    const { data: storedMessage, error: insertError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name,
        email,
        subject: subject || 'No Subject Provided',
        message,
        is_resolved: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Contact message insertion failed:', insertError);
      return NextResponse.json(
        { success: false, error: 'Unable to process your request at this time.' },
        { status: 500, headers: rateLimitCheck.headers }
      );
    }

    // 4. Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been successfully dispatched to L\'Horizon Royal staff.',
        data: {
          id: storedMessage.id,
          created_at: storedMessage.created_at,
        },
      },
      { status: 201, headers: rateLimitCheck.headers }
    );
  } catch (err) {
    console.error('Unhandled contact message route handler error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
