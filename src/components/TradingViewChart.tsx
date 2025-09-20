import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { historicalDataService } from '@/services/historicalDataService';
import { ColorType, createChart, HistogramData, HistogramSeries, IChartApi, LineData, LineSeries } from 'lightweight-charts';
import { BarChart3, Loader2, RefreshCw, TrendingDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TradingViewChartProps {
  symbol: string;
  name: string;
  height?: number;
  showVolume?: boolean;
  timeframe?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
}

const TradingViewChart = ({ 
  symbol, 
  name, 
  height = 400, 
  showVolume = true,
  timeframe = '1M'
}: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<any>(null);
  const rsiSeriesRef = useRef<any>(null);
  const macdSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState(timeframe);
  const [showIndicators, setShowIndicators] = useState({
    rsi: false,
    macd: false,
    volume: showVolume
  });

  // Timeframe options
  const timeframes = [
    { label: '1D', value: '1D' as const },
    { label: '1W', value: '1W' as const },
    { label: '1M', value: '1M' as const },
    { label: '3M', value: '3M' as const },
    { label: '6M', value: '6M' as const },
    { label: '1Y', value: '1Y' as const },
  ];

  // Technical indicator calculations
  const calculateRSI = (prices: number[], period: number = 14): number[] => {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    return rsi;
  };

  const calculateMACD = (prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) => {
    const emaFast = calculateEMA(prices, fastPeriod);
    const emaSlow = calculateEMA(prices, slowPeriod);
    
    const macdLine = emaFast.map((fast, i) => fast - emaSlow[i]);
    const signalLine = calculateEMA(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

    return { macdLine, signalLine, histogram };
  };

  const calculateEMA = (prices: number[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    ema[0] = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    
    return ema;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Add a small delay to ensure the container is fully rendered
    const timer = setTimeout(() => {
      if (!chartContainerRef.current) return;

      try {
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#FFFFFF',
          },
          grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
          },
          crosshair: {
            mode: 1,
            vertLine: {
              color: '#FFFFFF',
              labelBackgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            horzLine: {
              color: '#FFFFFF',
              labelBackgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
          rightPriceScale: {
            borderColor: '#FFFFFF',
            textColor: '#FFFFFF',
          },
          timeScale: {
            borderColor: '#FFFFFF',
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time) => {
              const date = new Date(time);
              return date.toLocaleString();
            },
          },
          width: chartContainerRef.current.clientWidth,
          height: height,
        });

        // Verify chart was created successfully
        if (!chart) {
          throw new Error('Failed to create chart');
        }

        // Create line series using the correct API for version 5.x
        const lineSeries = chart.addSeries(LineSeries, {
          color: 'hsl(var(--primary))',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        });

        // Create RSI series (will be added to a separate pane)
        const rsiSeries = chart.addSeries(LineSeries, {
          color: '#FFFFFF',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });

        // Create MACD series
        const macdSeries = chart.addSeries(LineSeries, {
          color: '#FFFFFF',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });

        // Create volume series
        const volumeSeries = chart.addSeries(HistogramSeries, {
          color: 'rgba(255, 255, 255, 0.5)',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
        });

        // Verify series were created successfully
        if (!lineSeries || !rsiSeries || !macdSeries || !volumeSeries) {
          throw new Error('Failed to create chart series');
        }

        chartRef.current = chart;
        lineSeriesRef.current = lineSeries;
        rsiSeriesRef.current = rsiSeries;
        macdSeriesRef.current = macdSeries;
        volumeSeriesRef.current = volumeSeries;

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
            lineSeriesRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing chart:', error);
        setError('Failed to initialize chart');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        lineSeriesRef.current = null;
      }
    };
  }, [height]);

  // Load chart data
  useEffect(() => {
    const loadChartData = async () => {
      if (!lineSeriesRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const chartData = await historicalDataService.getHistoricalData(symbol, currentTimeframe);
        
        if (chartData.length === 0) {
          setError('No data available for this symbol');
          return;
        }

        // Convert candlestick data to line data
        const lineData: LineData[] = chartData.map((d, i) => ({
          time: d.time,
          value: d.close,
          color: d.close > (chartData[i - 1]?.close ?? d.close) ? '#00FF00' : '#FF0000',
        }));

        // Update line series
        lineSeriesRef.current.setData(lineData);

        // Calculate and add technical indicators
        const prices = chartData.map(d => d.close);
        
        // RSI
        if (showIndicators.rsi && rsiSeriesRef.current) {
          const rsiValues = calculateRSI(prices);
          const rsiData: LineData[] = chartData.slice(14).map((item, index) => ({
            time: item.time,
            value: rsiValues[index] || 50,
          }));
          rsiSeriesRef.current.setData(rsiData);
        }

        // MACD
        if (showIndicators.macd && macdSeriesRef.current) {
          const { macdLine } = calculateMACD(prices);
          const macdData: LineData[] = chartData.slice(25).map((item, index) => ({
            time: item.time,
            value: macdLine[index] || 0,
          }));
          macdSeriesRef.current.setData(macdData);
        }

        // Volume
        if (showIndicators.volume && volumeSeriesRef.current) {
          const volumeData: HistogramData[] = chartData.map((item, index) => ({
            time: item.time,
            value: (item as any).volume || 0,
            color: item.close >= (chartData[index - 1]?.close || item.close) 
              ? 'hsl(var(--bullish))' 
              : 'hsl(var(--bearish))',
          }));
          volumeSeriesRef.current.setData(volumeData);
        }

        // Fit content
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }

      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [symbol, currentTimeframe, showIndicators]);

  const handleTimeframeChange = (newTimeframe: typeof currentTimeframe) => {
    setCurrentTimeframe(newTimeframe);
  };

  const toggleIndicator = (indicator: keyof typeof showIndicators) => {
    setShowIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  const handleRefresh = () => {
    if (lineSeriesRef.current) {
      const loadData = async () => {
        setLoading(true);
        try {
          const chartData = await historicalDataService.getHistoricalData(symbol, currentTimeframe);
          
          const lineData: LineData[] = chartData.map(d => ({
            time: d.time,
            value: d.close,
          }));
          
          lineSeriesRef.current?.setData(lineData);
          chartRef.current?.timeScale().fitContent();
        } catch (err) {
          console.error('Error refreshing chart:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>{name} ({symbol})</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button
                variant={showIndicators.rsi ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('rsi')}
                className="h-8 text-xs"
              >
                RSI
              </Button>
              <Button
                variant={showIndicators.macd ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('macd')}
                className="h-8 text-xs"
              >
                MACD
              </Button>
              <Button
                variant={showIndicators.volume ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator('volume')}
                className="h-8 text-xs"
              >
                Volume
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="h-8"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex space-x-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  variant={currentTimeframe === tf.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeframeChange(tf.value)}
                  className="h-8 px-2 text-xs"
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-64 text-destructive">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">{error}</p>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading chart data...</p>
                </div>
              </div>
            )}
            
            <div 
              ref={chartContainerRef} 
              className="w-full"
              style={{ height: `${height}px` }}
            />
            
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-primary rounded-sm"></div>
                  <span>Price</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {currentTimeframe}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  TradingView Charts
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingViewChart;