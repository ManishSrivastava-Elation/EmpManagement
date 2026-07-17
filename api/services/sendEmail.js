import { emailTransporter } from "../config/emailConfig.js";

export const sendEmail = async (to, subject, html) => {
  try {
    await emailTransporter.sendMail({
      from: `"Company Support" <${process.env.EMAIL_USER}>`, 
      to,
      subject,
      html,
    });

    console.log("Email sent");
  } catch (error) {
    console.log("Email Error:", error);
    throw error;
  }
};

