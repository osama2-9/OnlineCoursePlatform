import { transporter } from "./nodemailer.js";

const sendResetPasswordEmail = async (email, resetUrl) => {
  try {
    const sendEmail = await transporter.sendMail({
      from: "UpLearn <noreply@uplearn.com>",
      to: email,
      subject: "Reset Password Request",
      html: `
        <section style="max-width: 640px; margin: auto; padding: 24px; background-color: white; font-family: Arial, sans-serif;">
          <header>
            <h1 style="font-size: 24px; font-weight: 600; color: black;">UpLearn</h1>
          </header>
          
          <main style="margin-top: 32px;">
            <h2 style="color: black; font-size: 24px; font-weight: 600;">Hello,</h2>

            <p style="margin-top: 16px; color: black; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. If you did not make this request, please ignore this email.
            </p>

            <p style="margin-top: 16px; color: black; font-size: 16px; line-height: 1.6;">
              To reset your password, please click the button below:
            </p>

            <a href="${resetUrl}" 
               style="display: inline-block; padding: 14px 32px; margin-top: 24px; font-size: 16px; font-weight: 600; text-align: center; text-decoration: none; background-color: #F57C00; color: white; border-radius: 8px; transition: background-color 0.3s ease;">
               Reset Password
            </a>


          <footer style="margin-top: 32px; text-align: center; color: gray; font-size: 12px;">
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} UpLearn.</p>
          </footer>
        </section>
      `,
    });

    console.log(sendEmail.response);
  } catch (error) {
    console.log(error);
  }
};

export { sendResetPasswordEmail };
