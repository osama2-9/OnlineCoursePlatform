import { transporter } from "./nodemailer.js";

const sendNewAccountEmail = async (email, loginUrl ,passwordTosend) => {
  try {
    const sendEmail = await transporter.sendMail({
      from: "UpLearn <noreply@uplearn.com>",
      to: email,
      subject: "Welcome to Your UpLearn Account",
      html: `
        <section style="max-width: 640px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: Arial, sans-serif; border-radius: 8px;">
          <header style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 700; color: #F57C00; margin: 0;">UpLearn</h1>
            <p style="font-size: 16px; color: #333; margin-top: 8px;">Welcome to UpLearn! We're excited to have you on board.</p>
          </header>
          
          <main style="margin-bottom: 32px; text-align: center;">
            <h2 style="color: #333; font-size: 24px; font-weight: 600;">Welcome to UpLearn</h2>

            <p style="margin-top: 16px; color: #555; font-size: 16px; line-height: 1.6;">
              you have been added to UpLearn by admin
            </p>

            <p style="margin-top: 16px; color: #555; font-size: 16px; line-height: 1.6;">
              your login credentials are:
            </p>
            <p style="margin-top: 16px; color: #555; font-size: 16px; line-height: 1.6;">
              Email: ${email}
            </p>
            <p style="margin-top: 16px; color: #555; font-size: 16px; line-height: 1.6;">
              Password: ${passwordTosend}
            </p>
           

            <p style="margin-top: 16px; color: #555; font-size: 16px; line-height: 1.6;">
              you can login using this credentials and please <span style="font-weight: 600;">update your password</span>
            </p>
            <a href="${loginUrl}" 
               style="display: inline-block; padding: 14px 32px; margin-top: 24px; font-size: 16px; font-weight: 600; text-align: center; text-decoration: none; background-color: #F57C00; color: white; border-radius: 8px; transition: background-color 0.3s ease; text-transform: uppercase;">
               login
            </a>
           
          </main>

          <footer style="text-align: center; color: gray; font-size: 12px;">
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} UpLearn. All rights reserved.</p>
            <p style="margin-top: 4px;">If you're having trouble, contact us at support@uplearn.com</p>
          </footer>
        </section>
      `,
    });

    console.log(sendEmail.response);
  } catch (error) {
    console.log(error);
  }
};



export { sendNewAccountEmail };
