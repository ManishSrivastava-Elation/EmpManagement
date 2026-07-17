/**
 * Generates a branded HTML email template for OTP delivery
 * @param {string} otp - The 6-digit OTP code
 * @param {number} expiryMinutes - Minutes until OTP expires
 * @param {string} entityName - Name of the company/employee for personalisation
 */
export const otpEmailTemplate = (otp, expiryMinutes = 10, entityName = "") => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your OTP Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#374151;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                EMP Management
              </h1>
              <p style="margin:6px 0 0;color:#374151;font-size:13px;">
                Secure Verification System
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;color:#374151;font-size:15px;">
                Hello${entityName ? ` <strong>${entityName}</strong>` : ""},
              </p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                Use the OTP below to complete your verification. This code is valid for
                <strong>${expiryMinutes} minutes</strong> only.
              </p>

              <!-- OTP Box -->
              <div style="background:#f0f4ff;border:2px dashed #1a73e8;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 6px;color:#6b7280;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
                  Your One-Time Password
                </p>
                <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#1a73e8;font-family:'Courier New',monospace;">
                  ${otp}
                </span>
              </div>

              <!-- Expiry -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;color:#92400e;font-size:13px;">
                      ⏰ This OTP expires in <strong>${expiryMinutes} minutes</strong>.
                      Do not share it with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;color:#991b1b;font-size:13px;">
                      🔒 <strong>Security Notice:</strong> We will never ask for your OTP via phone or email.
                      If you did not request this, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} EMP Management. All rights reserved.
              </p>
              <p style="margin:4px 0 0;color:#9ca3af;font-size:11px;">
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
