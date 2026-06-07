import "server-only";

import nodemailer from "nodemailer";

export class ContactMailConfigurationError extends Error {
  constructor(message = "Contact mail is not configured.") {
    super(message);
    this.name = "ContactMailConfigurationError";
  }
}

export async function sendContactMail(input: {
  email?: string;
  message: string;
  submittedAt: Date;
}) {
  const config = getContactMailConfig();
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  });

  await transporter.sendMail({
    from: `null-noise <${config.fromEmail}>`,
    to: config.toEmail,
    replyTo: input.email,
    subject: "Neue Nachricht über null-noise",
    text: buildContactMailText(input),
  });
}

function getContactMailConfig() {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPortRaw = process.env.SMTP_PORT?.trim();
  const smtpSecureRaw = process.env.SMTP_SECURE?.trim() ?? "false";
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD;
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!smtpHost || !smtpPortRaw || !smtpUser || !smtpPassword || !toEmail || !fromEmail) {
    throw new ContactMailConfigurationError();
  }

  const smtpPort = Number.parseInt(smtpPortRaw, 10);

  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new ContactMailConfigurationError();
  }

  return {
    smtpHost,
    smtpPort,
    smtpSecure: smtpSecureRaw === "true",
    smtpUser,
    smtpPassword,
    toEmail,
    fromEmail,
  };
}

function buildContactMailText(input: { email?: string; message: string; submittedAt: Date }) {
  const lines = [
    "Neue Nachricht über null-noise",
    "",
    `Zeitpunkt: ${input.submittedAt.toISOString()}`,
    `Antwortadresse: ${input.email ?? "nicht angegeben"}`,
    "",
    "Nachricht:",
    input.message,
  ];

  return lines.join("\n");
}
