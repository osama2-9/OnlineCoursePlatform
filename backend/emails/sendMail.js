import { transporter } from './nodemailer.js';

const sendMail = async (userEmail, subject, text) => {
    try {
        const mailOptions = {
            from: '"Uplearn" <elearnoffical@gmail.com>',
            to: userEmail,
            subject: subject,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body {
                        font-family: 'Inter', Arial, sans-serif;
                        background-color: #f7fafc; /* Light gray background */
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff; /* White content background */
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #1a202c; /* Darker background for the header */
                        color: #ffffff;
                        padding: 20px;
                        border-radius: 8px 8px 0 0;
                    }
                    .header h1 {
                        font-size: 24px;
                        margin: 0;
                    }
                    .header p {
                        font-size: 12px;
                        color: #e2e8f0; /* Light gray text for header */
                    }
                    .content {
                        padding: 20px;
                    }
                    .content h2 {
                        font-size: 20px;
                        color: #2d3748; /* Dark gray for content title */
                    }
                    .content p {
                        font-size: 14px;
                        line-height: 1.6;
                        color: #4a5568; /* Medium gray for content text */
                    }
                    .cta-button {
                        display: inline-block;
                        background-color: #4a5568; /* Dark gray button */
                        color: #ffffff;
                        padding: 12px 25px;
                        border-radius: 4px;
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: 600;
                        transition: background-color 0.2s;
                    }
                    .cta-button:hover {
                        background-color: #2d3748; /* Darker shade on hover */
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        font-size: 12px;
                        color: #a0aec0; /* Light gray for footer text */
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Uplearn</h1>
                        <p>Official Communication</p>
                    </div>
                    <div class="content">
                        <h2>${subject}</h2>
                        <p>${text}</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="https://uplearn-website.vercel.app" class="cta-button">Visit Uplearn</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Uplearn, Inc. All rights reserved.</p>
                        <p>Gaza . Al-Remal<br>Palestine</p>
                    </div>
                </div>
            </body>
            </html>
            `,
        };

        const isSend = await transporter.sendMail(mailOptions);
        if (isSend) {
            console.log('Email sent successfully');
        } else {
            console.log('Failed to send email');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export default sendMail;
