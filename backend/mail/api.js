// backend/mail/api.js
// Express API endpoint to send alert emails using NodeMailer

import express from 'express';
import { sendAlertMail } from './mailer.js';
import { getPriceAlertTemplate, getPriceAlertText } from './templates.js';

const router = express.Router();

// GET /api/test-mail - Test endpoint for mail sending
router.get('/test-mail', async (req, res) => {
  try {
    const testData = {
      symbol: 'AAPL',
      price: 175.25,
      targetPrice: 170.00,
      direction: 'above',
      changePercent: 3.08
    };

    await sendAlertMail({
      to: 'dhairyakanabar7737@gmail.com', // Replace with your email for testing
      subject: `Price Alert: ${testData.symbol}`,
      text: getPriceAlertText(testData),
      html: getPriceAlertTemplate(testData)
    });

    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (err) {
    console.error('Test mail error:', err);
    res.status(500).json({ error: 'Failed to send test mail' });
  }
});

// POST /api/sendMail
router.post('/sendMail', async (req, res) => {
  const { to, type, data } = req.body;
  
  if (!to || !type || !data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let mailOptions;
    
    switch (type) {
      case 'PRICE_ALERT':
        mailOptions = {
          to,
          subject: `Price Alert: ${data.symbol}`,
          text: getPriceAlertText(data),
          html: getPriceAlertTemplate(data)
        };
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid alert type' });
    }
    
    await sendAlertMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Mail send error:', err);
    res.status(500).json({ error: 'Failed to send mail' });
  }
});

export const mailRouter = router;
