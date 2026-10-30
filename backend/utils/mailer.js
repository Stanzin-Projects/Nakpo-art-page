import { Resend } from 'resend';

/**
 * Transactional email through Resend.
 *
 * The API key is read lazily (dotenv runs after module evaluation) and the
 * whole thing degrades to a no-op when no key is configured, so the shop keeps
 * working — sign-ups and admin actions never fail because email is unset.
 */

let client = null;

export function isEmailConfigured() {
  return Boolean(String(process.env.RESEND_API_KEY || '').trim());
}

function getClient() {
  if (!client) client = new Resend(String(process.env.RESEND_API_KEY).trim());
  return client;
}

function fromAddress() {
  // onboarding@resend.dev is Resend's shared test sender: it only delivers to
  // the address that owns the API key until a domain is verified.
  return process.env.EMAIL_FROM || 'ARTBYLOPSANG <onboarding@resend.dev>';
}

/**
 * Send one email. Never throws — returns { ok, id } or { ok: false, skipped | error }.
 */
export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!to) return { ok: false, error: 'Missing recipient' };
  if (!isEmailConfigured()) {
    console.warn(`[email] Skipped "${subject}" to ${to} — RESEND_API_KEY is not set.`);
    return { ok: false, skipped: true, reason: 'not-configured' };
  }
  try {
    const { data, error } = await getClient().emails.send({
      from: fromAddress(),
      to: [to],
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error(`[email] Resend rejected "${subject}" to ${to}:`, error.message || error);
      return { ok: false, error: error.message || 'Resend rejected the message' };
    }
    console.log(`[email] Sent "${subject}" to ${to} (${data?.id})`);
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err.message);
    return { ok: false, error: err.message };
  }
}
