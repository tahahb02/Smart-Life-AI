import nodemailer from 'nodemailer';

let transporter = null;
let transporterType = 'none';

const createTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
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
      console.log('✅ SMTP Gmail connecté');
    }
    return true;
  } catch (error) {
    console.warn('⚠️  Service email non disponible:', error.message);
    return false;
  }
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`📧 [DEV] Email non envoyé (transport non initialisé)`);
    console.log(`   À: ${to}`);
    console.log(`   Sujet: ${subject}`);
    return;
  }

  const from = transporterType === 'ethereal'
    ? '"SmartLife AI" <noreply@smartlife.ai>'
    : `"SmartLife AI" <${process.env.SMTP_USER}>`;

  const msg = await transporter.sendMail({ from, to, subject, html });

  if (transporterType === 'ethereal') {
    const previewUrl = nodemailer.getTestMessageUrl(msg);
    if (previewUrl) {
      console.log(`📧 Email visible ici: ${previewUrl}`);
    }
  }
};

export const sendOTPEmail = async (email, code) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Vérification SmartLife AI</h2>
      <p>Votre code de vérification est :</p>
      <h1 style="font-size: 48px; letter-spacing: 8px; text-align: center; color: #2563eb;">${code}</h1>
      <p style="font-size: 14px; color: #666;">Ce code expire dans 10 minutes.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Code de vérification SmartLife AI', html });
};
