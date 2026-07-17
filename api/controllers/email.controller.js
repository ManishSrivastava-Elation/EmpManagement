import { sendEmail } from "../services/sendEmail.js";

export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    await sendEmail(
      email,
      "Account Verification",
      `
      <h2>Verify Account</h2>
      <p>Your OTP is:</p>
      <h1>123456</h1>
      `
    );

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};