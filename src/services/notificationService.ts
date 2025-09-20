import { toast } from "sonner";
import { sendAlertMail } from "@/lib/mailSender";

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class NotificationService {
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: false
  };

  constructor() {
    this.checkPermission();
  }

  private checkPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    switch (Notification.permission) {
      case 'granted':
        this.permission = { granted: true, denied: false, default: false };
        break;
      case 'denied':
        this.permission = { granted: false, denied: true, default: false };
        break;
      default:
        this.permission = { granted: false, denied: false, default: true };
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    if (this.permission.granted) {
      return true;
    }

    if (this.permission.denied) {
      toast.error('Notifications are blocked. Please enable them in your browser settings.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.checkPermission();
      
      if (permission === 'granted') {
        toast.success('Notifications enabled successfully!');
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }

  showNotification(title: string, options: NotificationOptions = {}) {
    if (!this.permission.granted) {
      // Fallback to toast notification
      toast.info(title, {
        description: options.body,
        duration: 5000,
      });
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'tickertracker-alert',
        requireInteraction: true,
        ...options
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback to toast
      toast.info(title, {
        description: options.body,
        duration: 5000,
      });
    }
  }

  async showPriceAlert(symbol: string, currentPrice: number, targetPrice: number, direction: 'above' | 'below') {
    const title = `Price Alert: ${symbol}`;
    const body = `Price ${direction === 'above' ? 'rose above' : 'fell below'} $${targetPrice.toFixed(2)}. Current: $${currentPrice.toFixed(2)}`;
    this.showNotification(title, {
      body,
      icon: direction === 'above' ? '/icons/bullish.svg' : '/icons/bearish.svg',
      tag: `alert-${symbol}-${targetPrice}`,
    });
    
    // Send alert email with template
    await sendAlertMail({
      to: "user@example.com",
      subject: title,
      text: body,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2d3748;">${title}</h2>
          <div style="background-color: ${direction === 'above' ? '#f0fff4' : '#fff5f5'}; border: 1px solid ${direction === 'above' ? '#9ae6b4' : '#feb2b2'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; margin: 0;">
              Current Price: <strong style="color: ${direction === 'above' ? '#38a169' : '#e53e3e'}">$${currentPrice.toFixed(2)}</strong>
              <span style="color: ${direction === 'above' ? '#38a169' : '#e53e3e'}">
                ${direction === 'above' ? '↗' : '↘'}
              </span>
            </p>
            <p style="font-size: 14px; color: #718096; margin: 10px 0;">
              Target Price: $${targetPrice.toFixed(2)}
            </p>
            <p style="font-size: 14px; color: #718096; margin: 10px 0;">
              Upper Circuit: $${(currentPrice * 1.20).toFixed(2)} (+20%)
            </p>
            <p style="font-size: 14px; color: #718096; margin: 10px 0;">
              Lower Circuit: $${(currentPrice * 0.80).toFixed(2)} (-20%)
            </p>
          </div>
          <p style="font-size: 12px; color: #a0aec0;">
            This alert was sent by TickerTracker. You can manage your alerts in the app.
          </p>
        </div>
      `
    });
  }

  showMarketNews(title: string, summary: string) {
    this.showNotification('Market News', {
      body: title,
      icon: '/icons/news.svg',
      tag: 'market-news',
    });
  }

  showPortfolioAlert(symbol: string, change: number, changePercent: number) {
    const isPositive = change >= 0;
    const title = `Portfolio Update: ${symbol}`;
    const body = `${isPositive ? 'Gained' : 'Lost'} ${Math.abs(changePercent).toFixed(2)}% ($${Math.abs(change).toFixed(2)})`;
    
    this.showNotification(title, {
      body,
      icon: isPositive ? '/icons/bullish.svg' : '/icons/bearish.svg',
      tag: `portfolio-${symbol}`,
    });
  }

  getPermissionStatus(): NotificationPermission {
    return { ...this.permission };
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
