// packages/notification/dispatcher.ts
// Event-Driven Notification Dispatcher Wrapper
// Pre-wired for enterprise integration with Twilio, Resend, or SendGrid.

import { EventEmitter } from 'events';

export interface EmailPayload {
  to: string;
  subject: string;
  templateName: string;
  context: Record<string, any>;
}

export interface SMSPayload {
  to: string;
  message: string;
}

export interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationDispatcher extends EventEmitter {
  private static instance: NotificationDispatcher;

  private constructor() {
    super();
    this.registerDefaultListeners();
  }

  /**
   * Singleton accessor ensuring a single event bus across serverless processes
   */
  public static getInstance(): NotificationDispatcher {
    if (!NotificationDispatcher.instance) {
      NotificationDispatcher.instance = new NotificationDispatcher();
    }
    return NotificationDispatcher.instance;
  }

  /**
   * Registers default handlers for real-time notification dispatches
   */
  private registerDefaultListeners() {
    this.on('notification:email', async (payload: EmailPayload) => {
      await this.sendEmail(payload);
    });

    this.on('notification:sms', async (payload: SMSPayload) => {
      await this.sendSMS(payload);
    });

    this.on('notification:push', async (payload: PushPayload) => {
      await this.sendPush(payload);
    });
  }

  /**
   * Dispatch Booking Confirmation
   */
  public async dispatchBookingConfirmation(email: string, phone: string | null, details: any) {
    // 1. Queue Email Dispatch
    this.emit('notification:email', {
      to: email,
      subject: `Your Sovereign Sanctuary at L'Horizon Royal: Reservation Confirmed [Ref: ${details.bookingId}]`,
      templateName: 'booking_confirmation',
      context: details
    });

    // 2. Queue SMS Alert if phone is provided
    if (phone) {
      this.emit('notification:sms', {
        to: phone,
        message: `L'Horizon Royal: Your luxury suite is confirmed for ${details.checkIn} to ${details.checkOut}. Thank you for your reservation.`
      });
    }
  }

  /**
   * Dispatch Cancellation Alert
   */
  public async dispatchCancellationAlert(email: string, phone: string | null, details: any) {
    this.emit('notification:email', {
      to: email,
      subject: `Cancellation Notice - Reservation [Ref: ${details.bookingId}] - L'Horizon Royal`,
      templateName: 'booking_cancellation',
      context: details
    });

    if (phone) {
      this.emit('notification:sms', {
        to: phone,
        message: `L'Horizon Royal: Your booking Ref ${details.bookingId} has been successfully cancelled. Refunds are being processed immediately.`
      });
    }
  }

  /**
   * Downstream Email Provider Adapter (Stub)
   */
  private async sendEmail(payload: EmailPayload): Promise<boolean> {
    try {
      console.log(`[Notification-Email] Sending template '${payload.templateName}' to ${payload.to}...`);
      
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.info('[Notification-Email] RESEND_API_KEY missing. Simulated console dispatch output only.');
        return true;
      }

      // Pre-wired for Resend integration
      // const res = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${apiKey}`
      //   },
      //   body: JSON.stringify({
      //     from: "L'Horizon Royal <hospitality@lhorizonroyal.com>",
      //     to: [payload.to],
      //     subject: payload.subject,
      //     html: `<p>Simulated html context loading template ${payload.templateName}</p>`
      //   })
      // });
      return true;
    } catch (err) {
      console.error('[Notification-Email] Email dispatch failed:', err);
      return false;
    }
  }

  /**
   * Downstream SMS Provider Adapter (Stub)
   */
  private async sendSMS(payload: SMSPayload): Promise<boolean> {
    try {
      console.log(`[Notification-SMS] Sending alert to ${payload.to}: "${payload.message}"`);
      
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      if (!twilioSid) {
        console.info('[Notification-SMS] TWILIO credentials missing. Console simulation complete.');
        return true;
      }
      return true;
    } catch (err) {
      console.error('[Notification-SMS] SMS dispatch failed:', err);
      return false;
    }
  }

  /**
   * Downstream Push Provider Adapter (Stub)
   */
  private async sendPush(payload: PushPayload): Promise<boolean> {
    try {
      console.log(`[Notification-Push] Dispatching in-app alert to user '${payload.userId}': "${payload.title}"`);
      return true;
    } catch (err) {
      console.error('[Notification-Push] Push alert failed:', err);
      return false;
    }
  }
}
export const notificationDispatcher = NotificationDispatcher.getInstance();
