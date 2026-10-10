import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, incidentId, dashboardUrl } = req.body;

  if (!to || !incidentId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const trackingLink = `${dashboardUrl || 'https://safechain-portal.vercel.app'}/?id=${incidentId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'SafeChain Alerts <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject: `🚨 EMERGENCY ALERT: SafeChain Incident #${incidentId}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #dc2626; margin-top: 0;">EMERGENCY DISTRESS ACTIVATED</h2>
          <p style="color: #374151; font-size: 15px; line-height: 1.5;">
            An emergency SOS signal was triggered on the associated mobile device. Real-time telemetry, cyclic camera evidence, and audio streaming have started.
          </p>
          <div style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-family: monospace; font-size: 14px;">
            <strong>Incident ID:</strong> ${incidentId}
          </div>
          <div style="margin: 24px 0;">
            <a href="${trackingLink}" target="_blank" style="background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
              Open Live Tracking Portal
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">
            Portal URL: <a href="${trackingLink}" style="color: #4b5563;">${trackingLink}</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Error]', error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: err.message });
  }
}