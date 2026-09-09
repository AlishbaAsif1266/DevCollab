import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.log('====================================================');
    console.log(`DEV EMAIL (No SMTP credentials configured): ${options.email}`);
    console.log(`Acceptance Link: ${options.acceptUrl}`);
    console.log('====================================================');
    return true;
  }

  // Create robust Gmail / SMTP Transporter (Port 587 with STARTTLS for maximum Windows compatibility)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS / STARTTLS
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const message = {
    from: `"${process.env.FROM_NAME || 'DevCollab Workspace'}" <${user}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`[SUCCESS] Email sent to ${options.email} - ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[SMTP ERROR] Could not send email via Gmail: ${error.message}`);
    // Log dev link as fallback so invitation creation never crashes with 500
    console.log(`[FALLBACK LINK] Acceptance Link: ${options.acceptUrl}`);
    return false;
  }
};

export default sendEmail;
