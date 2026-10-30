/**
 * Email templates for ARTBYLOPSANG.
 *
 * Deliberately plain: table-free, inline styles only, system fonts, no remote
 * images — so they render the same in Gmail, Outlook and Apple Mail.
 */

const INK = '#1b1712';
const MUTED = '#6b6357';
const PAPER = '#f1ede4';
const LINE = '#ddd6c8';
const ACCENT = '#b4462f';

function siteUrl(path = '/') {
  const base = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  return base + path;
}

function layout({ heading, intro, body, cta, footNote }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:${PAPER};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${intro}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf9f4;border:1px solid ${LINE};border-radius:10px;">
            <tr>
              <td style="padding:28px 32px 0;">
                <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">
                  ARTBYLOPSANG
                </div>
                <h1 style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:normal;color:${INK};">
                  ${heading}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${INK};">
                <p style="margin:0 0 16px;">${intro}</p>
                ${body}
                ${
                  cta
                    ? `<p style="margin:24px 0 4px;">
                        <a href="${cta.href}" style="display:inline-block;padding:12px 22px;background:${INK};color:#fbf9f4;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">${cta.label}</a>
                      </p>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px 28px;">
                <hr style="border:0;border-top:1px solid ${LINE};margin:0 0 16px;" />
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
                  ${footNote || `You are receiving this because you have an account at ARTBYLOPSANG.`}
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">
            Original art &amp; prints
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function welcomeEmail(user) {
  const name = user.name || 'there';
  const intro = `Welcome, ${name} — your account is ready.`;
  return {
    subject: 'Welcome to ARTBYLOPSANG',
    text: [
      `Welcome, ${name}!`,
      '',
      'Your ARTBYLOPSANG account is ready. From your account page you can:',
      '  • track every order and its delivery timeline',
      '  • keep a wishlist of pieces you love',
      '  • request a return within the returns window',
      '  • review artworks you have bought',
      '',
      `Browse the gallery: ${siteUrl('/')}`,
      `Your account: ${siteUrl('/account')}`,
      '',
      'Reply to this email if you have a question about a piece.',
      'ARTBYLOPSANG — original art & prints',
    ].join('\n'),
    html: layout({
      heading: 'Welcome to the studio',
      intro,
      body: `<p style="margin:0 0 14px;">Your account is set up. From your account page you can:</p>
             <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8;">
               <li>track every order and its delivery timeline</li>
               <li>keep a wishlist of pieces you love</li>
               <li>request a return within the returns window</li>
               <li>review artworks you have bought</li>
             </ul>
             <p style="margin:0;">Questions about a piece? Just reply to this email.</p>`,
      cta: { label: 'Browse the gallery', href: siteUrl('/') },
      footNote: `You're receiving this because you created an ARTBYLOPSANG account with this address.`,
    }),
  };
}

export function newOrderEmail(order, summary = {}) {
  const customer = order.customer || {};
  const name =
    [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim() || customer.email || 'Guest';
  const items = order.items || [];
  const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const address = order.shippingInfo || {};
  const shipTo = [address.address, address.city, address.state, address.zip, address.country]
    .filter(Boolean)
    .join(', ');

  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${LINE};">${i.title || 'Artwork'}${i.quantity > 1 ? ` × ${i.quantity}` : ''}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${LINE};text-align:right;white-space:nowrap;">${money((i.price || 0) * (i.quantity || 1))}</td>
      </tr>`
    )
    .join('');

  return {
    subject: `New order ${order.orderNumber} — ${money(order.total)} from ${name}`,
    text: [
      `New order: ${order.orderNumber}`,
      `Buyer: ${name}${customer.email ? ` (${customer.email})` : ''}`,
      `Placed: ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}`,
      '',
      ...items.map(
        (i) => `  • ${i.title || 'Artwork'}${i.quantity > 1 ? ` × ${i.quantity}` : ''} — ${money((i.price || 0) * (i.quantity || 1))}`
      ),
      '',
      `Total: ${money(order.total)}`,
      shipTo ? `Ship to: ${shipTo}` : '',
      summary.items ? `${summary.items} piece${summary.items === 1 ? '' : 's'}` : '',
      '',
      `Open the admin panel: ${siteUrl('/admin')}`,
    ]
      .filter(Boolean)
      .join('\n'),
    html: layout({
      heading: 'New order in the studio',
      intro: `${name} just checked out — order ${order.orderNumber} for ${money(order.total)}.`,
      body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
                ${rows || `<tr><td style="padding:8px 0;">${items.length} item(s)</td></tr>`}
                <tr>
                  <td style="padding:12px 0 0;font-weight:bold;">Total</td>
                  <td style="padding:12px 0 0;text-align:right;font-weight:bold;white-space:nowrap;">${money(order.total)}</td>
                </tr>
              </table>
              <p style="margin:0 0 6px;"><strong>Buyer:</strong> ${name}${customer.email ? ` &lt;${customer.email}&gt;` : ''}</p>
              ${shipTo ? `<p style="margin:0 0 6px;"><strong>Ship to:</strong> ${shipTo}</p>` : ''}
              <p style="margin:0;"><strong>Placed:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}</p>`,
      cta: { label: 'Open Orders & Sales', href: siteUrl('/admin') },
      footNote: 'You are receiving this because you are an administrator of ARTBYLOPSANG. Order alerts can be managed from the admin panel.',
    }),
  };
}

export function accountDeactivatedEmail(user, { reason } = {}) {
  const name = user.name || 'there';
  const intro = `Hello ${name}, your ARTBYLOPSANG account has been deactivated.`;
  return {
    subject: 'Your ARTBYLOPSANG account has been deactivated',
    text: [
      `Hello ${name},`,
      '',
      'Your ARTBYLOPSANG account has been deactivated by the studio.',
      'You can no longer sign in, place orders, leave reviews or change your saved details.',
      reason ? `Note from the studio: ${reason}` : '',
      '',
      'Your past orders remain on record. If you believe this was a mistake, reply to this email and the studio can reactivate the account.',
      '',
      `ARTBYLOPSANG — original art & prints`,
    ]
      .filter(Boolean)
      .join('\n'),
    html: layout({
      heading: 'Your account was deactivated',
      intro,
      body: `<p style="margin:0 0 14px;">This was done by the studio. While the account is deactivated you cannot:</p>
             <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8;">
               <li>sign in to your account</li>
               <li>place a new order</li>
               <li>leave reviews or change saved details</li>
             </ul>
             ${
               reason
                 ? `<p style="margin:0 0 14px;padding:12px 14px;background:${PAPER};border-left:3px solid ${ACCENT};"><strong>Note from the studio:</strong> ${reason}</p>`
                 : ''
             }
             <p style="margin:0;">Your past orders stay on record. If you think this was a mistake, reply to this email and the studio can reactivate the account.</p>`,
      footNote: `You're receiving this because this address has an ARTBYLOPSANG account. This is a one-off account notice, not a newsletter.`,
    }),
  };
}
