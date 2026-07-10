const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = process.env.SMTP_USER || 'noreply@smartlife-ai.com';
const SENDER_NAME = 'SmartLife AI';

export const sendEmail = async ({ to, subject, html }) => {
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY non configurée');
    return;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', response.status, data.message || JSON.stringify(data));
      return;
    }

    console.log('Email envoyé à:', to, '- messageId:', data.messageId);
  } catch (error) {
    console.error('Erreur envoi email:', error.message);
  }
};

export const verifySMTPConnection = async () => {
  if (!BREVO_API_KEY) {
    console.warn('⚠️  BREVO_API_KEY non configurée');
    return false;
  }
  console.log('✅ Brevo API prête');
  return true;
};

export const sendOTPEmail = async (email, code) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px 24px;text-align:center;">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.2);margin:0 auto 12px;line-height:48px;font-size:22px;color:#fff;font-weight:bold;">S</div>
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">SmartLife AI</h1>
        </div>
        <div style="padding:32px 24px;text-align:center;">
          <p style="color:#374151;font-size:15px;margin:0 0 8px;">Votre code de vérification</p>
          <div style="background:#f0f4ff;border-radius:12px;padding:16px 24px;margin:16px 0;display:inline-block;">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#2563eb;font-family:monospace;">${code}</span>
          </div>
          <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">Ce code expire dans <strong>10 minutes</strong>.</p>
        </div>
        <div style="padding:16px 24px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: 'Code de vérification SmartLife AI', html });
};
