// backend/mail/templates.js
// HTML email templates for alerts

/**
 * Generate HTML template for price alert emails
 */
function getPriceAlertTemplate({ symbol, price, targetPrice, direction, changePercent, prevClose }) {
  const isAbove = direction === 'above';
  const arrow = isAbove ? '↗' : '↘';
  const color = isAbove ? '#22c55e' : '#ef4444';
  
  // Calculate circuit breakers (typical stock market circuit breakers are at 7%, 13%, and 20%)
  const prevClosePrice = prevClose || price; // fallback to current price if no prev close
  const upperCircuit = prevClosePrice * 1.20; // 20% upper limit
  const lowerCircuit = prevClosePrice * 0.80; // 20% lower limit
  
  // Calculate how close we are to circuit breakers
  const upperDistance = ((upperCircuit - price) / price * 100).toFixed(2);
  const lowerDistance = ((price - lowerCircuit) / price * 100).toFixed(2);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { 
            background: linear-gradient(135deg, #1e293b, #334155);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .price { font-size: 32px; font-weight: bold; color: ${color}; text-align: center; }
          .change { font-size: 18px; color: ${color}; text-align: center; margin-bottom: 20px; }
          .details { 
            background: white;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .circuit-breaker {
            margin-top: 20px;
            padding: 15px;
            background: #f1f5f9;
            border-radius: 6px;
          }
          .circuit-limit {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 4px solid;
          }
          .upper-circuit { border-left-color: #22c55e; }
          .lower-circuit { border-left-color: #ef4444; }
          .footer { 
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          .alert-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            background: ${color};
            color: white;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0;text-align:center;">${symbol} Alert</h2>
            <p style="text-align:center;margin:5px 0;">
              <span class="alert-badge">
                Price ${isAbove ? 'Above' : 'Below'} Target
              </span>
            </p>
          </div>
          
          <div class="details">
            <div class="price">
              $${price.toFixed(2)} ${arrow}
            </div>
            <div class="change">
              ${Math.abs(changePercent).toFixed(2)}% ${isAbove ? 'increase' : 'decrease'}
            </div>
            
            <div style="text-align:center;margin:20px 0;">
              <strong>Target Price:</strong> $${targetPrice.toFixed(2)}
            </div>

            <div class="circuit-breaker">
              <h3 style="margin:0 0 15px;color:#475569;">Circuit Breaker Status</h3>
              
              <div class="circuit-limit upper-circuit">
                <span>Upper Circuit</span>
                <strong>$${upperCircuit.toFixed(2)} (${upperDistance}% away)</strong>
              </div>
              
              <div class="circuit-limit lower-circuit">
                <span>Lower Circuit</span>
                <strong>$${lowerCircuit.toFixed(2)} (${lowerDistance}% away)</strong>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This alert was sent by TickerTracker. You can manage your alerts in the app.</p>
            <p>© ${new Date().getFullYear()} TickerTracker. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate text-only version of the price alert
 */
function getPriceAlertText({ symbol, price, targetPrice, direction, changePercent, prevClose }) {
  const isAbove = direction === 'above';
  const arrow = isAbove ? '↗' : '↘';
  
  // Calculate circuit breakers
  const prevClosePrice = prevClose || price;
  const upperCircuit = prevClosePrice * 1.20;
  const lowerCircuit = prevClosePrice * 0.80;
  const upperDistance = ((upperCircuit - price) / price * 100).toFixed(2);
  const lowerDistance = ((price - lowerCircuit) / price * 100).toFixed(2);
  
  return `
PRICE ALERT: ${symbol}

Alert Type: Price ${isAbove ? 'Above' : 'Below'} Target

Current Price: $${price.toFixed(2)} ${arrow}
Change: ${Math.abs(changePercent).toFixed(2)}% ${isAbove ? 'increase' : 'decrease'}
Target Price: $${targetPrice.toFixed(2)}

CIRCUIT BREAKER STATUS
---------------------
Upper Circuit: $${upperCircuit.toFixed(2)} (${upperDistance}% away)
Lower Circuit: $${lowerCircuit.toFixed(2)} (${lowerDistance}% away)

This alert was sent by TickerTracker. You can manage your alerts in the app.
  `.trim();
}

export {
  getPriceAlertTemplate,
  getPriceAlertText
};