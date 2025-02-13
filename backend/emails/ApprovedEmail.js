import { transporter } from "./nodemailer.js";
const sendApprovmentMail = async (email) => {
  try {
    const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Application Approved</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-100">
                <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
                    <h1 class="text-2xl font-bold text-green-600 mb-4">Application Approved!</h1>
                    <p class="text-gray-700 mb-4">
                        Dear User,
                    </p>
                    <p class="text-gray-700 mb-4">
                        We are pleased to inform you that your application has been approved by the instructor. Your content has been reviewed and meets our standards.
                    </p>
                    <p class="text-gray-700 mb-4">
                        We will be arranging a meeting with you soon to discuss the next steps. The details of the meeting will be sent to this email address.
                    </p>
                    <p class="text-gray-700 mb-4">
                        Thank you for choosing Uplearn. We look forward to working with you!
                    </p>
                    <p class="text-gray-700 mb-4">
                        Best regards,<br>
                        The Uplearn Team
                    </p>
                    <div class="text-center mt-6">
                        <a href="https://uplearn.com" class="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Visit Uplearn</a>
                    </div>
                </div>
            </body>
            </html>
        `;

    const send = await transporter.sendMail({
      from: "Uplearn",
      to: email,
      subject: "Updates On Application Status",
      html: htmlContent,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log(error);
    throw new Error("Internal server error");
  }
};

export { sendApprovmentMail };
