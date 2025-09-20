// src/components/RealTimeTest.tsx
import { useEffect, useState } from 'react';
import { realTimeDataService } from '@/services/realTimeDataService';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function RealTimeTest() {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{ symbol: string; price: number } | null>(null);

  useEffect(() => {
    // Listen for connection status
    const handleOpen = () => setConnected(true);
    const handleClose = () => setConnected(false);
    
    // Subscribe to price updates for test symbol
    const handleUpdate = (data: { symbol: string; price: number }) => {
      setLastUpdate(data);
    };

    realTimeDataService.onConnectionChange(handleOpen, handleClose);
    realTimeDataService.onPriceUpdate(handleUpdate);

    // Cleanup listeners
    return () => {
      realTimeDataService.offConnectionChange(handleOpen, handleClose);
      realTimeDataService.offPriceUpdate(handleUpdate);
    };
  }, []);

  const handleSubscribe = () => {
    realTimeDataService.subscribe('AAPL');  // Subscribe to Apple stock
  };

  const handleTestAlert = () => {
    // Create a test alert slightly above or below current price
    if (lastUpdate) {
      const targetPrice = lastUpdate.price + 0.10;  // 10 cents above current price
      realTimeDataService.addAlert(lastUpdate.symbol, targetPrice, 'above');
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {lastUpdate && (
          <div>
            <p>Last Update:</p>
            <p className="font-mono">
              {lastUpdate.symbol}: ${lastUpdate.price.toFixed(2)}
            </p>
          </div>
        )}

        <div className="space-x-2">
          <Button onClick={handleSubscribe}>
            Subscribe to AAPL
          </Button>
          <Button onClick={handleTestAlert} disabled={!lastUpdate}>
            Test Alert (+$0.10)
          </Button>
        </div>
      </div>
    </Card>
  );
}