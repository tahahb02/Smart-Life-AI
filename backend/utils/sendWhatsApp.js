import twilio from 'twilio';

let client = null;

const getClient = () => {
  if (client) return client;
  if (process.env.TWILIO_ACCOUNT_SID === 'your_twilio_sid') {
    return null;
  }
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    return client;
  } catch (error) {
    console.warn('⚠️  Twilio non disponible:', error.message);
    return null;
  }
};

export const verifyWhatsAppConnection = async () => {
  const twilioClient = getClient();
  if (!twilioClient) {
    console.warn('⚠️  WhatsApp (Twilio) non configuré');
    console.warn('   Configurez TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN dans backend/.env');
    return false;
  }
  try {
    await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ WhatsApp (Twilio) connecté');
    return true;
  } catch (error) {
    console.warn('⚠️  WhatsApp (Twilio) non disponible:', error.message);
    return false;
  }
};

export const sendWhatsAppOTP = async (to, code) => {
  const twilioClient = getClient();
  if (!twilioClient) {
    console.log(`📱 [DEV] WhatsApp non envoyé (Twilio non configuré)`);
    console.log(`   À: ${to}`);
    console.log(`   Code: ${code}`);
    return;
  }

  await twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body: `Votre code de vérification SmartLife AI est : ${code}\nCe code expire dans 10 minutes.`,
  });
};
