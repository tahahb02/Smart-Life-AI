import nodemailer from 'nodemailer';

let transporter = null;
let transporterType = 'none';

const createTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    transporterType = 'smtp';
    return { type: 'smtp' };
  }

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  transporterType = 'ethereal';
  return {
    type: 'ethereal',
    user: testAccount.user,
    pass: testAccount.pass,
    webUrl: 'https://ethereal.email/login',
  };
};

export const verifySMTPConnection = async () => {
  try {
    const info = await createTransporter();
    await transporter.verify();
    if (info.type === 'ethereal') {
      console.log('');
      console.log('📧 Mode Email de développement (Ethereal)');
      console.log(`   Web:  ${info.webUrl}`);
      console.log(`   User: ${info.user}`);
      console.log(`   Pass: ${info.pass}`);
      console.log('');
    } else {
      console.log('✅ SMTP Brevo connecté');
    }
    return true;
  } catch (error) {
    console.warn('⚠️  Service email non disponible:', error.message);
    return false;
  }
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    try {
      await createTransporter();
    } catch (err) {
      console.error('Erreur init transporter:', err.message);
      return;
    }
  }

  if (!transporter) {
    console.log(`📧 [DEV] Email non envoyé (transport non initialisé)`);
    console.log(`   À: ${to}`);
    console.log(`   Sujet: ${subject}`);
    return;
  }

  const from = transporterType === 'ethereal'
    ? '"SmartLife AI" <noreply@smartlife.ai>'
    : '"SmartLife AI" <noreply@smartlife-ai.com>';

  const msg = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    headers: {
      'X-Mailer': 'SmartLife-AI',
      'List-Unsubscribe': `<mailto:unsubscribe@smartlife-ai.com?subject=unsubscribe>`,
    },
  });

  if (transporterType === 'ethereal') {
    const previewUrl = nodemailer.getTestMessageUrl(msg);
    if (previewUrl) {
      console.log(`📧 Email visible ici: ${previewUrl}`);
    }
  }
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
