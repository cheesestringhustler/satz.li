import { config } from "../config/index.ts";

interface EmailParams {
    to: string;
    subject: string;
    htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: EmailParams) {
    const url = "https://api.brevo.com/v3/smtp/email";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": config.brevo.apiKey,
        },
        body: JSON.stringify({
            sender: {
                name: "satz.li",
                email: config.brevo.fromEmail,
            },
            to: [{ email: to }],
            subject,
            htmlContent,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${error.message}`);
    }

    return response.json();
}

export function generateMagicLinkEmail(_email: string, magicLink: string) {
    const token = magicLink.split("token=")[1];

    return {
        subject: "Your Magic Link for satz.li",
        htmlContent: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #09090B;">
        <h1 style="color: #09090B; font-size: 24px; font-weight: 600; margin-bottom: 16px;">Welcome to <span style="color: #2563eb;">satz.li</span></h1>
        
        <p style="color: #71717A; margin-bottom: 24px;">Click the button below to sign in to your account:</p>
        
        <a href="${magicLink}" style="display: inline-block; background-color: #09090B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-bottom: 16px; font-weight: 500;">
          Sign in to satz.li
        </a>

        <div style="border: 1px solid #E4E4E7; border-radius: 6px; padding: 16px; margin: 24px 0;">
          <p style="color: #71717A; margin-bottom: 12px;">Or copy this token and paste it into the form:</p>
          <code style="display: block; background-color: #F4F4F5; padding: 12px; border-radius: 4px; font-family: monospace; color: #18181B; word-break: break-all;">${token}</code>
        </div>

        <p style="color: #A1A1AA; font-size: 14px;">This link will expire in 15 minutes.</p>
        <p style="color: #A1A1AA; font-size: 14px;">If you didn't request this link, you can safely ignore this email.</p>
        <p style="color: #A1A1AA; font-size: 14px;">This is an automated email, please don't reply to this email.</p>
      </div>
    `,
    };
}
