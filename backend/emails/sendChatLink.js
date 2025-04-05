import { transporter } from "./nodemailer.js";

export const sendChatLink = async (userEmail, chatLink) => {
  try {
    const mailOptions = {
      from: '"Uplearn" <support@uplearn.com>',
      to: userEmail,
      subject: 'Access Your Chat',
      html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="bg-orange-500 py-5 text-center">
          <h1 class="text-white text-2xl font-bold m-0">Chat Access</h1>
        </div>
        
        <div class="max-w-2xl mx-auto my-5 px-5">
          <h2 class="text-orange-500 text-xl font-semibold mt-0">Hello!</h2>
          
          <p class="text-gray-700 leading-relaxed mb-6">
            You can now access your chat by clicking the button below:
          </p>
          
          <div class="text-center my-8">
            <a 
              href="${chatLink}" 
              class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg inline-block no-underline transition-colors"
            >
              Open Chat
            </a>
          </div>
          
          
          <p class="text-gray-600 text-sm leading-relaxed">
            Or copy and paste this link into your browser: 
            <span class="text-orange-500 break-all">${chatLink}</span>
          </p>
          
          <div class="border-t border-gray-200 mt-8 pt-5 text-gray-500 text-sm">
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p class="mt-2">© ${new Date().getFullYear()} Uplearn. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Chat link email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending chat link email:', error);
    throw error;
  }
};