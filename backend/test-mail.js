// backend/test-mail.js
import 'dotenv/config';
import { sendAlertMail } from './mail/mailer.js';
import { getPriceAlertTemplate, getPriceAlertText } from './mail/templates.js';

async function testMail() {
  console.log('Environment variables:', {
    password: process.env.TICKERTRACKER_GMAIL_PASS ? 'Set' : 'Not set'
  });
  try {
    const testData = {
      symbol: 'AAPL',
      price: 175.25,
      targetPrice: 170.00,
      direction: 'above',
      changePercent: 3.08,
      prevClose: 169.75  // Added previous closing price
    };

    console.log('Sending test email...');
    await sendAlertMail({
      to: 'dhairyakanabar7737@gmail.com',
      subject: `Price Alert: ${testData.symbol}`,
      text: getPriceAlertText(testData),
      html: getPriceAlertTemplate(testData)
    });
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

testMail();