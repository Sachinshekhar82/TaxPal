const nodemailer = require('nodemailer');

/**
 * Helper to get active transporter or simulate sending
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
  }
  return null;
};

/**
 * Send Email via Resend API (HTTP REST)
 */
const sendViaResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
  const fromEmail = 'onboarding@resend.dev';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html
    })
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error('❌ [Resend API Error Response]:', JSON.stringify(responseData));
    throw new Error(`Resend API Error [${response.status}]: ${JSON.stringify(responseData)}`);
  }

  console.log('✅ [Resend Email Sent Successfully]:', JSON.stringify(responseData));
  return responseData;
};

/**
 * Core send email dispatcher
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const fromEmail = process.env.EMAIL_FROM || 'TaxPal <notifications@taxpal.com>';
  const resendApiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;

  // 1. Try Resend if configured
  if (resendApiKey) {
    try {
      console.log(`📧 [EmailService] Sending email to ${to} via Resend API...`);
      return await sendViaResend({ to, subject, html });
    } catch (err) {
      console.error(`❌ [EmailService] Resend API failed:`, err.message);
      // Fall through to SMTP or simulation
    }
  }

  // 2. Try SMTP if configured
  const transporter = getTransporter();
  if (transporter) {
    try {
      console.log(`📧 [EmailService] Sending email to ${to} via SMTP (${process.env.SMTP_HOST})...`);
      return await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text,
        html
      });
    } catch (err) {
      console.error(`❌ [EmailService] SMTP Transport failed:`, err.message);
      // Fall through to simulation
    }
  }

  // 3. Fallback / Dev Mode Simulation
  console.log(`\n=================== 📨 [TAX PAL EMAIL SIMULATOR] ===================`);
  console.log(`To: ${to}`);
  console.log(`From: ${fromEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`--------------------------------------------------------------------`);
  console.log(text || 'HTML Content Generated');
  console.log(`====================================================================\n`);
  return { simulated: true, success: true };
};

/**
 * 1. Send Tax Payment Reminder Email
 */
exports.sendTaxReminderEmail = async ({ toEmail, userName, quarter, estimatedTax, dueDate, daysRemaining, currencySymbol = '₹' }) => {
  if (!toEmail) {
    throw new Error('No recipient email provided for tax reminder email');
  }

  const name = userName || 'User';
  const taxType = `${quarter || 'Quarterly'} Estimated Tax`;
  const formattedAmount = `${currencySymbol}${Number(estimatedTax || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = 'TaxPal – Upcoming Tax Payment Reminder';

  const textContent = `
TaxPal – Upcoming Tax Payment Reminder

Hi ${name},

This is a reminder about your upcoming tax payment.

Tax Type: ${taxType}
Amount Due: ${formattedAmount}
Due Date: ${formattedDueDate}
Days Remaining: ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}

Please complete your tax payment before the due date.

You can open TaxPal to view your complete tax summary and payment details.

Regards,
TaxPal Personal Finance & Tax Estimator
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 6px solid #4f46e5; }
    .header { font-size: 24px; font-weight: 700; color: #4f46e5; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .greeting { font-size: 16px; margin-bottom: 16px; font-weight: 600; color: #0f172a; }
    .body-text { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .value { font-weight: 700; color: #0f172a; }
    .value.highlight { color: #4f46e5; font-size: 16px; }
    .badge-days { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ✨ TaxPal
    </div>
    <div class="greeting">Hi ${name},</div>
    <div class="body-text">
      This is an automated reminder about your upcoming estimated tax payment deadline.
    </div>

    <div class="details-box">
      <div class="detail-row">
        <span class="label">Tax Type:</span>
        <span class="value">${taxType}</span>
      </div>
      <div class="detail-row">
        <span class="label">Amount Due:</span>
        <span class="value highlight">${formattedAmount}</span>
      </div>
      <div class="detail-row">
        <span class="label">Due Date:</span>
        <span class="value">${formattedDueDate}</span>
      </div>
      <div class="detail-row">
        <span class="label">Days Remaining:</span>
        <span class="value"><span class="badge-days">${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}</span></span>
      </div>
    </div>

    <div class="body-text">
      Please log in to TaxPal to complete your tax payment before the due date.
    </div>

    <div class="footer">
      Regards,<br>
      <strong>TaxPal</strong> – Personal Finance & Tax Estimator
    </div>
  </div>
</body>
</html>
  `.trim();

  return await sendEmail({ to: toEmail, subject, text: textContent, html: htmlContent });
};

/**
 * 2. Send Tax Payment Confirmation Email
 */
exports.sendTaxPaymentConfirmationEmail = async ({ toEmail, userName, quarter, estimatedTax, paymentDate, currencySymbol = '₹' }) => {
  if (!toEmail) {
    throw new Error('No recipient email provided for tax payment confirmation email');
  }

  const name = userName || 'User';
  const taxType = `${quarter || 'Quarterly'} Estimated Tax`;
  const formattedAmount = `${currencySymbol}${Number(estimatedTax || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedPaymentDate = new Date(paymentDate || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = 'TaxPal – Tax Payment Completed';

  const textContent = `
TaxPal – Tax Payment Completed Successfully

Hi ${name},

Your tax payment has been successfully marked as completed in TaxPal.

Tax Type: ${taxType}
Amount: ${formattedAmount}
Payment Date: ${formattedPaymentDate}
Status: Completed

Your TaxPal Tax Calendar has been updated successfully.

Thank you for using TaxPal.

Regards,
TaxPal Personal Finance & Tax Estimator
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 6px solid #10b981; }
    .header { font-size: 24px; font-weight: 700; color: #10b981; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .greeting { font-size: 16px; margin-bottom: 16px; font-weight: 600; color: #0f172a; }
    .body-text { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    .details-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #a7f3d0; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #166534; font-weight: 500; }
    .value { font-weight: 700; color: #065f46; }
    .value.highlight { color: #059669; font-size: 16px; }
    .badge-completed { background: #10b981; color: #ffffff; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ✓ TaxPal Payment Confirmation
    </div>
    <div class="greeting">Hi ${name},</div>
    <div class="body-text">
      Your tax payment has been successfully marked as completed in TaxPal.
    </div>

    <div class="details-box">
      <div class="detail-row">
        <span class="label">Tax Type:</span>
        <span class="value">${taxType}</span>
      </div>
      <div class="detail-row">
        <span class="label">Amount Paid:</span>
        <span class="value highlight">${formattedAmount}</span>
      </div>
      <div class="detail-row">
        <span class="label">Payment Date:</span>
        <span class="value">${formattedPaymentDate}</span>
      </div>
      <div class="detail-row">
        <span class="label">Status:</span>
        <span class="value"><span class="badge-completed">Completed</span></span>
      </div>
    </div>

    <div class="body-text">
      Your TaxPal Tax Calendar and financial reports have been updated. Thank you for keeping your tax payments organized!
    </div>

    <div class="footer">
      Regards,<br>
      <strong>TaxPal</strong> – Personal Finance & Tax Estimator
    </div>
  </div>
</body>
</html>
  `.trim();

  return await sendEmail({ to: toEmail, subject, text: textContent, html: htmlContent });
};
