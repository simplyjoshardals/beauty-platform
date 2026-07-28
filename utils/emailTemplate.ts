// Table-based layout with inline styles throughout — standard practice
// for HTML email, since most email clients (Outlook especially) ignore
// or badly support external/embedded CSS and modern layout (flex/grid).
// Kept deliberately monochrome (black/white) rather than inventing an
// accent color — that matches the app itself, which has no brand color
// defined anywhere in its actual CSS either.
function emailShell(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vanity</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 420px; background-color:#ffffff; border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="padding: 32px 32px 8px 32px; text-align: center;">
                <span style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: #000000;">Vanity</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 32px 32px 32px;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 420px;">
            <tr>
              <td style="padding: 20px 32px; text-align: center;">
                <span style="font-size: 12px; color: #9a9a9a;">
                  If you didn't request this, you can safely ignore this email.
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}

function button(label: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto 0 auto;">
  <tr>
    <td style="border-radius: 8px; background-color: #000000;">
      <a
        href="${url}"
        target="_blank"
        style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;"
      >
        ${label}
      </a>
    </td>
  </tr>
</table>
`.trim();
}

export const emailTemplates = {
  // Covers both "new here" and "welcome back" — magic links unify login
  // and signup, so the email itself makes no assumption about which one
  // this is. No name/username is used in the greeting: at request time a
  // brand-new account has no username yet (that's chosen during
  // onboarding, after this link is clicked), so personalizing here isn't
  // possible for every recipient.
  magicLink(verifyUrl: string): string {
    return emailShell(`
      <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #000000; text-align: center;">
        Sign in to Vanity
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #555555; text-align: center;">
        Tap the button below to sign in. No password needed.
      </p>
      ${button("Sign in", verifyUrl)}
      <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.6; color: #9a9a9a; text-align: center;">
        This link expires in 15 minutes and can only be used once.
      </p>
      <p style="margin: 16px 0 0 0; font-size: 11px; line-height: 1.6; color: #b5b5b5; text-align: center; word-break: break-all;">
        Or paste this into your browser:<br />${verifyUrl}
      </p>
    `);
  },
};
