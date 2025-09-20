// src/lib/mailSender.ts
// Utility to send alert emails. Replace with real implementation as needed.

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email alert. This is a placeholder for integration with a real email service.
 * @param options MailOptions
 * @returns Promise<boolean> success
 */
export async function sendAlertMail(options: MailOptions): Promise<boolean> {
  try {
    const res = await fetch('/api/sendMail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    if (!res.ok) throw new Error('Failed to send mail');
    return true;
  } catch (err) {
    console.error('Mail send error:', err);
    return false;
  }
}
