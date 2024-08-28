import { Resend } from "resend";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function sendEmailVerification(email: string, token: string) {
  try {
    await resend.emails.send({
      from: "Sender <no-reply@sender.com>",
      to: email,
      subject: "Verify your email",
      html: `
        <h1>Verify your email</h1>
        <p>Please verify your email by <a href="${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}">clicking here</a>.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: "Something went wrong",
    };
  }
}
