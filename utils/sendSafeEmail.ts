import { sendEmail } from "@/lib/mailer";

type EmailPayload = Parameters<typeof sendEmail>[0];

export async function sendSafeEmail(payload: EmailPayload, label?: string) {
  try {
    await sendEmail(payload);
  } catch (err) {
    console.error(`Email failed${label ? ` [${label}]` : ""}:`, err);
  }
}
