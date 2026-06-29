// apps/web/src/app/api/v1/payments/invoice/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../../../../../packages/db/src/supabase';
import { verifyAuth } from '../../../../../middleware/auth';
import { checkRole, ADMIN_STAFF_ROLES } from '../../../../../middleware/rbac';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    // Await params per Next.js 15 routing specification
    const params = await context.params;
    const invoiceId = params.id;

    if (!invoiceId) {
      return new NextResponse('Invoice ID is required', { status: 400 });
    }

    // 1. Authenticate user
    const user = await verifyAuth(req);
    if (!user) {
      return new NextResponse('Unauthorized. Please log in.', { status: 401 });
    }

    // 2. Query Invoice details along with booking and customer profile
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        booking:booking_id (
          id,
          customer_id,
          check_in,
          check_out,
          status,
          subtotal_amount,
          discount_amount,
          tax_amount,
          total_amount,
          customer:customer_id (
            email,
            first_name,
            last_name,
            phone
          )
        )
      `)
      .eq('id', invoiceId)
      .maybeSingle();

    if (invoiceError || !invoice) {
      console.error('Invoice query failed:', invoiceError);
      return new NextResponse('Invoice record not found.', { status: 404 });
    }

    const booking = invoice.booking as any;
    const customer = booking?.customer as any;

    // 3. RBAC Enforcement Security Rules
    const isStaff = checkRole(user.role as any, ADMIN_STAFF_ROLES);
    const isOwner = booking?.customer_id === user.id;

    if (!isStaff && !isOwner) {
      return new NextResponse('Access Denied. You do not possess the required credentials to view this invoice.', { status: 403 });
    }

    // 4. Return aesthetically gorgeous, styled HTML printable luxury invoice
    const customerName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Valued Guest' : 'Valued Guest';
    const customerEmail = customer?.email || 'hospitality@lhorizonroyal.com';
    const checkInDate = booking?.check_in || 'N/A';
    const checkOutDate = booking?.check_out || 'N/A';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>L'Horizon Royal - Invoice ${invoice.invoice_number}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #FAFAFA;
      color: #1A1A1A;
    }
    .serif-brand {
      font-family: 'Playfair Display', serif;
    }
    @media print {
      body {
        background-color: #FFFFFF;
        color: #000000;
      }
      .no-print {
        display: none !important;
      }
      .print-shadow-none {
        box-shadow: none !important;
        border: 1px solid #E5E7EB !important;
      }
    }
  </style>
</head>
<body class="p-6 md:p-12">

  <!-- Printable Container -->
  <div class="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-xl border border-gray-100 shadow-xl print-shadow-none relative">
    
    <!-- Print Action Trigger -->
    <div class="absolute top-6 right-6 no-print">
      <button 
        onclick="window.print()" 
        class="bg-[#D4AF37] hover:bg-[#C29E30] text-white px-4 py-2 rounded font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
      >
        Print Invoice
      </button>
    </div>

    <!-- Luxury Header Layout -->
    <div class="border-b border-gray-100 pb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="text-left">
        <h1 class="serif-brand text-3xl font-bold tracking-wider text-[#D4AF37]">L'HORIZON ROYAL</h1>
        <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 mt-1">French Riviera Sovereignty</p>
        <p class="text-xs text-gray-500 mt-4 leading-relaxed">
          Boulevard de la Croisette, 06400<br>
          Cannes, French Riviera, France<br>
          hospitality@lhorizonroyal.com
        </p>
      </div>

      <div class="text-left md:text-right">
        <span class="inline-block px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] uppercase font-semibold tracking-widest rounded-full mb-4">
          ${invoice.status.toUpperCase()}
        </span>
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice Number</h2>
        <p class="font-mono text-sm font-bold text-gray-800 mt-0.5">${invoice.invoice_number}</p>
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">Date of Emission</h2>
        <p class="text-xs text-gray-600 mt-0.5">${new Date(invoice.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
      </div>
    </div>

    <!-- Client & Stay info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-b border-gray-100 text-left">
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Billed To</h3>
        <p class="font-serif text-lg font-bold text-gray-800">${customerName}</p>
        <p class="text-xs text-gray-500 mt-1">${customerEmail}</p>
        ${customer?.phone ? `<p class="text-xs text-gray-500 mt-0.5">${customer.phone}</p>` : ''}
      </div>

      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Stay Details</h3>
        <p class="text-xs text-gray-600 font-semibold">Booking ID: <span class="font-mono text-gray-800">${invoice.booking_id.substring(0, 8).toUpperCase()}</span></p>
        <p class="text-xs text-gray-500 mt-2">
          Check-In: <span class="text-gray-800 font-semibold font-mono">${checkInDate}</span>
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Check-Out: <span class="text-gray-800 font-semibold font-mono">${checkOutDate}</span>
        </p>
      </div>
    </div>

    <!-- Ledger Items Table -->
    <div class="py-10">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            <th class="pb-3">Description of Luxury Accommodation</th>
            <th class="pb-3 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
          <tr>
            <td class="py-5 pr-4">
              <p class="font-serif text-base font-semibold text-gray-800">Premium Accommodation Stay</p>
              <p class="text-xs text-gray-400 mt-1">Includes unlimited spa lounge admission and private butler service</p>
            </td>
            <td class="py-5 text-right font-mono font-semibold text-gray-800">
              €${parseFloat(invoice.subtotal_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Financial Breakdown block -->
    <div class="border-t border-gray-200 pt-8 flex flex-col items-end">
      <div class="w-full md:w-80 space-y-3.5 text-sm text-gray-600 text-left">
        <div class="flex justify-between">
          <span>Subtotal Amount:</span>
          <span class="font-mono text-gray-800">€${parseFloat(invoice.subtotal_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="flex justify-between">
          <span>State Luxury VAT & Tourism Taxes:</span>
          <span class="font-mono text-gray-800">€${parseFloat(invoice.tax_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="flex justify-between border-t border-gray-100 pt-3 text-base text-gray-900 font-semibold">
          <span class="serif-brand text-lg text-[#D4AF37]">Total Amount Sovereign:</span>
          <span class="font-mono text-lg text-gray-900">€${parseFloat(invoice.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>

    <!-- Elegance Signature Footer -->
    <div class="border-t border-gray-100 mt-16 pt-10 text-center">
      <p class="serif-brand italic text-base text-gray-400">Where Endless Ocean Meets Regal Grandeur</p>
      <p class="text-[9px] uppercase tracking-widest text-gray-300 mt-2">Thank you for choosing L'Horizon Royal</p>
    </div>

  </div>

</body>
</html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error: any) {
    console.error('❌ Unhandled invoice render API error:', error);
    return new NextResponse('Internal server error occurred.', { status: 500 });
  }
}
