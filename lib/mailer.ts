import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Was "OrbitWealth <noreply@getorbitwealth.com>" — leftover from a
// different app's boilerplate. This needs to be YOUR actual
// Resend-verified sending domain, not this placeholder — Resend won't
// let you send from a domain you haven't verified. If you haven't set
// one up yet, "onboarding@resend.dev" works for testing only.
const DEFAULT_FROM = "Vanity <noreply@onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  from = DEFAULT_FROM,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  from?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text: text || "",
      html,
      replyTo,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent via Resend:", data?.id);
    return data;
  } catch (err: any) {
    console.error("Resend failed:", err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
}
