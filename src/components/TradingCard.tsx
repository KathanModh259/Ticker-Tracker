import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTickerStore } from "@/stores/useTickerStore";
import { ColorType, createChart, IChartApi, ISeriesApi, LineData, LineSeries, Time } from 'lightweight-charts';
import { Bell, Star, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import AlertModal from "./AlertModal";

interface TradingCardProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

const TradingCard = ({ symbol, name, price, change, changePercent, isPositive }: TradingCardProps) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, setSelectedTicker, tickers } = useTickerStore();
  const [showAlertModal, setShowAlertModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const navigate = useNavigate();
  
  const ticker = tickers.find(t => t.symbol === symbol);
  const inWatchlist = isInWatchlist(symbol);

  // Initialize mini chart
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
      width: chartRef.current.clientWidth,
      height: 60,
    });

    const series = chart.addSeries(LineSeries, {
      color: isPositive ? 'hsl(var(--bullish))' : 'hsl(var(--bearish))',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartInstanceRef.current = chart;
    seriesRef.current = series;

    // Generate mini chart data
    const generateMiniChartData = (): LineData[] => {
      const data: LineData[] = [];
      const basePrice = parseFloat(price.replace(/[$,]/g, ''));
      let currentPrice = basePrice;

      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - (19 - i) * 5); // 5-minute intervals
        
        const variation = (Math.random() - 0.5) * basePrice * 0.01; // 1% variation
        currentPrice = currentPrice + variation;

        data.push({
          time: Math.floor(date.getTime() / 1000) as Time,
          value: Number(currentPrice.toFixed(2)),
        });
      }

      return data;
    };

    const chartData = generateMiniChartData();
    series.setData(chartData);

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [price, isPositive]);

  const handleCardClick = () => {
    if (ticker) {
      setSelectedTicker(ticker);
      navigate(`/ticker/${symbol}`);
    }
  };

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  const handleAlertClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAlertModal(true);
  };

  return (
    <>
      <Card className="bg-gradient-card hover:shadow-glow transition-all duration-300 cursor-pointer group border-border/50 relative">
        <CardContent className="p-4" onClick={handleCardClick}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg">{symbol}</h3>
              <p className="text-sm text-muted-foreground truncate">{name}</p>
            </div>
            <div className={`p-2 rounded-full ${isPositive ? 'bg-bullish/20' : 'bg-bearish/20'}`}>
              {isPositive ? 
                <TrendingUp className="h-4 w-4 text-bullish" /> : 
                <TrendingDown className="h-4 w-4 text-bearish" />
              }
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold">{price}</div>
            <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
              <span>{change}</span>
              <span>({changePercent})</span>
            </div>
          </div>

          {/* Mini TradingView Chart */}
          <div className="mt-4 h-12 w-full">
            <div 
              ref={chartRef} 
              className="w-full h-full"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleWatchlistToggle}
              className="h-8 w-8 bg-card/80 backdrop-blur hover:bg-primary/20"
            >
              <Star className={`h-4 w-4 ${inWatchlist ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleAlertClick}
              className="h-8 w-8 bg-card/80 backdrop-blur hover:bg-primary/20"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <AlertModal 
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        ticker={ticker ? { symbol: ticker.symbol, name: ticker.name, price: ticker.price } : null}
      />
    </>
  );
};

export default TradingCard;