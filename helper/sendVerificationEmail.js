import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = (email, token) => {
  const verificationLink = `https://tailbuddy-server.vercel.app/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: `
      <html>
        <body>s
          <h2>Welcome! Please verify your email address</h2>
          <p>Thank you for registering. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <!-- Logo Image -->
          <div style="text-align: center;">
            <img src="https://github.com/shopify-bliss/Image/blob/main/shopify.png?raw=true" alt="Logo" style="max-width: 150px;">
          </div>
          
          <!-- Button for Verification -->
          <div style="text-align: center; margin-top: 20px;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; font-size: 16px; border-radius: 5px;">Verify Your Email</a>
          </div>
          
          <p>If you did not register, please ignore this email.</p>
        </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
