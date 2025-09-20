// src/services/realTimeDataService.ts
import { notificationService } from './notificationService';
import { sendAlertMail } from '@/lib/mailSender';

interface StockData {
  symbol: string;
  price: number;
  timestamp: number;
}

type PriceUpdateListener = (data: { symbol: string; price: number }) => void;
type ConnectionListener = () => void;

class RealTimeDataService {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private alerts: Map<string, Array<{ price: number; direction: 'above' | 'below' }>> = new Map();
  private priceUpdateListeners: Set<PriceUpdateListener> = new Set();
  private connectionOpenListeners: Set<ConnectionListener> = new Set();
  private connectionCloseListeners: Set<ConnectionListener> = new Set();
  
  constructor() {
    this.connect();
  }

  onPriceUpdate(listener: PriceUpdateListener) {
    this.priceUpdateListeners.add(listener);
  }

  offPriceUpdate(listener: PriceUpdateListener) {
    this.priceUpdateListeners.delete(listener);
  }

  onConnectionChange(openListener: ConnectionListener, closeListener: ConnectionListener) {
    this.connectionOpenListeners.add(openListener);
    this.connectionCloseListeners.add(closeListener);
  }

  offConnectionChange(openListener: ConnectionListener, closeListener: ConnectionListener) {
    this.connectionOpenListeners.delete(openListener);
    this.connectionCloseListeners.delete(closeListener);
  }

  private connect() {
    this.socket = new WebSocket('ws://localhost:8000/ws/ticker');

    this.socket.addEventListener('open', () => {
      console.log('WebSocket Connected');
      // Send all subscribed symbols at once
      if (this.subscriptions.size > 0) {
        this.socket?.send(JSON.stringify(Array.from(this.subscriptions)));
      }
      this.connectionOpenListeners.forEach(listener => listener());
      this.subscriptions.forEach(symbol => this.subscribe(symbol));
      // Notify listeners
      this.connectionOpenListeners.forEach(listener => listener());
    });

    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.handlePriceUpdate({
        symbol: data.symbol,
        price: data.price,
        timestamp: new Date(data.timestamp).getTime()
      });
      // Notify price update listeners
      this.priceUpdateListeners.forEach(listener => 
        listener({ symbol: data.symbol, price: data.price })
      );
    });

    this.socket.addEventListener('close', () => {
      console.log('WebSocket Disconnected');
      // Notify listeners
      this.connectionCloseListeners.forEach(listener => listener());
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    });

    this.socket.addEventListener('error', (error) => {
      console.error('WebSocket Error:', error);
    });
  }

  private handlePriceUpdate(data: StockData) {
    // Check alerts for this symbol
    const symbolAlerts = this.alerts.get(data.symbol);
    if (symbolAlerts) {
      symbolAlerts.forEach(alert => {
        const { price: targetPrice, direction } = alert;
        const triggered = direction === 'above' 
          ? data.price >= targetPrice 
          : data.price <= targetPrice;

        if (triggered) {
          // Send notification
          notificationService.showPriceAlert(
            data.symbol,
            data.price,
            targetPrice,
            direction
          );

          // Send email alert
          const changePercent = ((data.price - targetPrice) / targetPrice) * 100;
          sendAlertMail({
            to: "user@example.com", // TODO: Replace with user's email
            subject: `Price Alert: ${data.symbol}`,
            text: `Price ${direction === 'above' ? 'rose above' : 'fell below'} $${targetPrice}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2d3748;">Price Alert: ${data.symbol}</h2>
                <div style="background-color: ${direction === 'above' ? '#f0fff4' : '#fff5f5'}; border: 1px solid ${direction === 'above' ? '#9ae6b4' : '#feb2b2'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="font-size: 18px; margin: 0;">
                    Current Price: <strong style="color: ${direction === 'above' ? '#38a169' : '#e53e3e'}">$${data.price.toFixed(2)}</strong>
                    <span style="color: ${direction === 'above' ? '#38a169' : '#e53e3e'}">
                      ${direction === 'above' ? '↗' : '↘'}
                    </span>
                  </p>
                  <p style="font-size: 14px; color: #718096; margin: 10px 0;">
                    Target Price: $${targetPrice.toFixed(2)}
                  </p>
                  <p style="font-size: 14px; color: #718096; margin: 10px 0;">
                    Upper Circuit: $${(data.price * 1.20).toFixed(2)} (+20%)
                  </p>
                  <p style="font-size: 14px; color: #718096; margin: 10px 0;">
                    Lower Circuit: $${(data.price * 0.80).toFixed(2)} (-20%)
                  </p>
                </div>
              </div>
            `
          });

          // Remove triggered alert
          this.removeAlert(data.symbol, targetPrice, direction);
        }
      });
    }
  }

  subscribe(symbol: string) {
    this.subscriptions.add(symbol);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(Array.from(this.subscriptions)));
    }
  }

  unsubscribe(symbol: string) {
    this.subscriptions.delete(symbol);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(Array.from(this.subscriptions)));
      this.subscriptions.delete(symbol);
    }
  }

  addAlert(symbol: string, price: number, direction: 'above' | 'below') {
    if (!this.alerts.has(symbol)) {
      this.alerts.set(symbol, []);
      // Subscribe to real-time updates if not already subscribed
      this.subscribe(symbol);
    }
    
    this.alerts.get(symbol)?.push({ price, direction });
  }

  removeAlert(symbol: string, price: number, direction: 'above' | 'below') {
    const symbolAlerts = this.alerts.get(symbol);
    if (symbolAlerts) {
      const index = symbolAlerts.findIndex(
        alert => alert.price === price && alert.direction === direction
      );
      if (index !== -1) {
        symbolAlerts.splice(index, 1);
      }
      
      // If no more alerts for this symbol, unsubscribe
      if (symbolAlerts.length === 0) {
        this.alerts.delete(symbol);
        this.unsubscribe(symbol);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const realTimeDataService = new RealTimeDataService();