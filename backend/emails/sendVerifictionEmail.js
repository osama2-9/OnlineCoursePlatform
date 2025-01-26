import { transporter } from "./nodemailer.js";

export const sendVerificationEmail = async (email, verificationUrl) => {
  try {
    const mail = await transporter.sendMail({
      from: "UpLearn <noreply@uplearn.com>",
      to: email,
      subject: "Email Verification",
      html: `
        <section style="max-width: 640px; margin: auto; padding: 24px; background-color: white; font-family: Arial, sans-serif;">
          <header>
           
          </header>
          
          <main style="margin-top: 32px;">
            <h2 style="color: black; font-size: 24px; font-weight: 600;">Hi there,</h2>

            <p style="margin-top: 16px; color: black; font-size: 16px; line-height: 1.6;">
              Welcome to UpLearn! Please click the button below to verify your email address and activate your account.
            </p>

            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 14px 32px; margin-top: 24px; font-size: 16px; font-weight: 600; text-align: center; text-decoration: none; background-color: #F57C00; color: white; border-radius: 8px; transition: background-color 0.3s ease;">
               Verify Email
            </a>

            <p style="margin-top: 32px; color: black; font-size: 16px;">
              Thanks, <br>
              UpLearn Team
            </p>
          </main>

            <p style="margin-top: 8px;">© ${new Date().getFullYear()} UpLearn. </p>
          </footer>
        </section>
      `,
    });
    console.log(mail.response);
  } catch (error) {
    console.log(error);
  }
};
