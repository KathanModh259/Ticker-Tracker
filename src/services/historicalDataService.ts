// Historical Data Service for TradingView Charts
import { CandlestickData, Time } from 'lightweight-charts';

export interface HistoricalData {
  symbol: string;
  timeframe: string;
  data: CandlestickData[];
}

class HistoricalDataService {
  private alphaVantageKey: string;
  private finnhubKey: string;
  private polygonKey: string;
  private fmpKey: string;

  constructor() {
    this.alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';
    this.finnhubKey = import.meta.env.VITE_FINNHUB_API_KEY || '';
    this.polygonKey = import.meta.env.VITE_POLYGON_API_KEY || '';
    this.fmpKey = import.meta.env.VITE_FINANCIAL_MODELING_PREP_API_KEY || '';
  }

  // Get historical candlestick data
  async getHistoricalData(symbol: string, timeframe: string = '1M'): Promise<CandlestickData[]> {
    try {
      // Try multiple APIs for better reliability
      const data = await this.tryMultipleApis(symbol, timeframe);
      return data;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return this.generateMockData(symbol, timeframe);
    }
  }

  // Try multiple APIs for historical data
  private async tryMultipleApis(symbol: string, timeframe: string): Promise<CandlestickData[]> {
    // Try Financial Modeling Prep first
    if (this.fmpKey) {
      try {
        const data = await this.fetchFromFMP(symbol, timeframe);
        if (data && data.length > 0) return data;
      } catch (error) {
        console.warn('FMP API failed for historical data, trying next...');
      }
    }

    // Try Alpha Vantage
    if (this.alphaVantageKey) {
      try {
        const data = await this.fetchFromAlphaVantage(symbol, timeframe);
        if (data && data.length > 0) return data;
      } catch (error) {
        console.warn('Alpha Vantage API failed for historical data, trying next...');
      }
    }

    // Try Finnhub
    if (this.finnhubKey) {
      try {
        const data = await this.fetchFromFinnhub(symbol, timeframe);
        if (data && data.length > 0) return data;
      } catch (error) {
        console.warn('Finnhub API failed for historical data, using mock data...');
      }
    }

    // Fallback to mock data
    return this.generateMockData(symbol, timeframe);
  }

  // Fetch from Financial Modeling Prep
  private async fetchFromFMP(symbol: string, timeframe: string): Promise<CandlestickData[]> {
    const interval = this.getFMPInterval(timeframe);
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?timeseries=${this.getDaysCount(timeframe)}&apikey=${this.fmpKey}`
    );
    const data = await response.json();

    if (data.historical && Array.isArray(data.historical)) {
      return data.historical
        .reverse() // FMP returns newest first, we need oldest first
        .map((item: any) => ({
          time: Math.floor(new Date(item.date).getTime() / 1000) as Time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));
    }

    return [];
  }

  // Fetch from Alpha Vantage
  private async fetchFromAlphaVantage(symbol: string, timeframe: string): Promise<CandlestickData[]> {
    const functionName = this.getAlphaVantageFunction(timeframe);
    const response = await fetch(
      `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${this.alphaVantageKey}`
    );
    const data = await response.json();

    const timeSeriesKey = this.getAlphaVantageTimeSeriesKey(timeframe);
    if (data[timeSeriesKey]) {
      const timeSeries = data[timeSeriesKey];
      return Object.keys(timeSeries)
        .sort()
        .map(date => {
          const item = timeSeries[date];
          return {
            time: Math.floor(new Date(date).getTime() / 1000) as Time,
            open: parseFloat(item['1. open']),
            high: parseFloat(item['2. high']),
            low: parseFloat(item['3. low']),
            close: parseFloat(item['4. close']),
          };
        });
    }

    return [];
  }

  // Fetch from Finnhub
  private async fetchFromFinnhub(symbol: string, timeframe: string): Promise<CandlestickData[]> {
    const resolution = this.getFinnhubResolution(timeframe);
    const to = Math.floor(Date.now() / 1000);
    const from = to - (this.getDaysCount(timeframe) * 24 * 60 * 60);

    const response = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.finnhubKey}`
    );
    const data = await response.json();

    if (data.s && data.s === 'ok' && data.c && data.c.length > 0) {
      return data.c.map((close: number, index: number) => ({
        time: data.t[index] as Time,
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: close,
      }));
    }

    return [];
  }

  // Generate mock data for demonstration
  private generateMockData(symbol: string, timeframe: string): CandlestickData[] {
    const days = this.getDaysCount(timeframe);
    const data: CandlestickData[] = [];
    
    // Generate realistic price data
    const basePrice = 100 + Math.random() * 200;
    let currentPrice = basePrice;
    const volatility = 0.02; // 2% daily volatility

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic OHLC data
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;

      data.push({
        time: Math.floor(date.getTime() / 1000) as Time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });

      currentPrice = close;
    }

    return data;
  }

  // Helper methods for API parameters
  private getDaysCount(timeframe: string): number {
    switch (timeframe) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 30;
    }
  }

  private getFMPInterval(timeframe: string): string {
    switch (timeframe) {
      case '1D': return '1min';
      case '1W': return '5min';
      case '1M': return '1hour';
      case '3M': return '1hour';
      case '6M': return '1day';
      case '1Y': return '1day';
      default: return '1day';
    }
  }

  private getAlphaVantageFunction(timeframe: string): string {
    switch (timeframe) {
      case '1D': return 'TIME_SERIES_INTRADAY';
      case '1W': return 'TIME_SERIES_INTRADAY';
      case '1M': return 'TIME_SERIES_DAILY';
      case '3M': return 'TIME_SERIES_DAILY';
      case '6M': return 'TIME_SERIES_DAILY';
      case '1Y': return 'TIME_SERIES_DAILY';
      default: return 'TIME_SERIES_DAILY';
    }
  }

  private getAlphaVantageTimeSeriesKey(timeframe: string): string {
    switch (timeframe) {
      case '1D': return 'Time Series (1min)';
      case '1W': return 'Time Series (5min)';
      case '1M': return 'Time Series (Daily)';
      case '3M': return 'Time Series (Daily)';
      case '6M': return 'Time Series (Daily)';
      case '1Y': return 'Time Series (Daily)';
      default: return 'Time Series (Daily)';
    }
  }

  private getFinnhubResolution(timeframe: string): string {
    switch (timeframe) {
      case '1D': return '1';
      case '1W': return '5';
      case '1M': return '60';
      case '3M': return '60';
      case '6M': return 'D';
      case '1Y': return 'D';
      default: return 'D';
    }
  }
}

export const historicalDataService = new HistoricalDataService();
