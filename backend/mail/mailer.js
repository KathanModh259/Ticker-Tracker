// backend/mail/mailer.js
// NodeMailer setup for sending alert emails

import nodemailer from 'nodemailer';

// Configure the transporter with Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'tickertrackermsbc@gmail.com',
    pass: process.env.TICKERTRACKER_GMAIL_PASS
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

// Verify the transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('Mailer verification error:', error);
  } else {
    console.log('Mail server is ready to send messages');
  }
});

/**
 * Send an alert email
 * @param {Object} mailOptions
 * @param {string} mailOptions.to - Recipient email
 * @param {string} mailOptions.subject - Email subject
 * @param {string} mailOptions.text - Plain text body
 * @param {string} [mailOptions.html] - HTML body
 * @returns {Promise}
 */
async function sendAlertMail({ to, subject, text, html }) {
  console.log('Attempting to send email with config:', {
    from: 'tickertrackermsbc@gmail.com',
    to,
    subject
  });
  
  try {
    const info = await transporter.sendMail({
      from: 'tickertrackermsbc@gmail.com',
      to,
      subject,
      text,
      html
    });
    console.log('Email sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Detailed email error:', error);
    throw error;
  }
}

export { sendAlertMail };
