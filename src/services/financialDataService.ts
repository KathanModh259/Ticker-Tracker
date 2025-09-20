// Financial Data Service for real-time market data
import { Ticker } from '@/stores/useTickerStore';
import { cache } from '@/lib/cache';

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  high52w?: number;
  low52w?: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

class FinancialDataService {
  private alphaVantageKey: string;
  private finnhubKey: string;
  private polygonKey: string;
  private newsApiKey: string;
  private fmpKey: string;
  private updateInterval: number;

  constructor() {
    this.alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';
    this.finnhubKey = import.meta.env.VITE_FINNHUB_API_KEY || '';
    this.polygonKey = import.meta.env.VITE_POLYGON_API_KEY || '';
    this.newsApiKey = import.meta.env.VITE_NEWS_API_KEY || '';
    this.fmpKey = import.meta.env.VITE_FINANCIAL_MODELING_PREP_API_KEY || '';
    this.updateInterval = parseInt(import.meta.env.VITE_REAL_TIME_UPDATE_INTERVAL || '5000');
  }

  private readonly CACHE_TTL = 30000; // 30 seconds cache for quote data
  private pendingRequests: Map<string, Promise<MarketData | null>> = new Map();

  // Get real-time quote data with caching and request deduplication
  async getQuote(symbol: string): Promise<MarketData | null> {
    try {
      // Check cache first
      const cachedData = cache.get<MarketData>(symbol);
      if (cachedData) return cachedData;

      // Check if there's already a pending request for this symbol
      const pendingRequest = this.pendingRequests.get(symbol);
      if (pendingRequest) return pendingRequest;

      // Create new request and store it
      const request = this.fetchQuote(symbol);
      this.pendingRequests.set(symbol, request);

      try {
        const data = await request;
        if (data) cache.set(symbol, data, this.CACHE_TTL);
        return data;
      } finally {
        this.pendingRequests.delete(symbol);
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  // Batch quote fetching
  async getBatchQuotes(symbols: string[]): Promise<Map<string, MarketData>> {
    const results = new Map<string, MarketData>();
    const symbolsToFetch = new Set<string>();

    // Check cache first
    for (const symbol of symbols) {
      const cachedData = cache.get<MarketData>(symbol);
      if (cachedData) {
        results.set(symbol, cachedData);
      } else {
        symbolsToFetch.add(symbol);
      }
    }

    if (symbolsToFetch.size > 0) {
      try {
        // Use Finnhub's batch quote endpoint (up to 25 symbols per request)
        const symbolBatches = Array.from(symbolsToFetch).reduce((acc, symbol, i) => {
          const batchIndex = Math.floor(i / 25);
          if (!acc[batchIndex]) acc[batchIndex] = [];
          acc[batchIndex].push(symbol);
          return acc;
        }, [] as string[][]);

        await Promise.all(symbolBatches.map(async (batch) => {
          const symbols = batch.join(',');
          const url = `https://finnhub.io/api/v1/quote?symbols=${symbols}&token=${this.finnhubKey}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Finnhub API error');
          
          const data = await response.json();
          batch.forEach((symbol, index) => {
            const quote = this.transformFinnhubQuote(symbol, data[index]);
            if (quote) {
              results.set(symbol, quote);
              cache.set(symbol, quote, this.CACHE_TTL);
            }
          });
        }));
      } catch (error) {
        console.error('Error in batch quote fetching:', error);
        // Fall back to individual fetches for failed symbols
        await Promise.all(
          Array.from(symbolsToFetch)
            .filter(symbol => !results.has(symbol))
            .map(async symbol => {
              const quote = await this.fetchQuote(symbol);
              if (quote) results.set(symbol, quote);
            })
        );
      }
    }

    return results;
  }

  // Internal method to fetch individual quote data
  private transformFinnhubQuote(symbol: string, quote: any): MarketData | null {
    if (!quote || !quote.c) return null;
    
    return {
      symbol,
      name: symbol, // Finnhub doesn't provide company name in quote
      price: quote.c,
      change: quote.d || 0,
      changePercent: quote.dp || 0,
      volume: quote.v || 0,
      open: quote.o || 0,
      previousClose: quote.pc || 0,
      high52w: quote.h || undefined,
      low52w: quote.l || undefined,
      timestamp: new Date().toISOString()
    };
  }

  private async fetchQuote(symbol: string): Promise<MarketData | null> {
    try {
      // Try Finnhub first (most reliable for basic quote data)
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Finnhub API error');
      
      const quoteData = await response.json();
      return this.transformFinnhubQuote(symbol, quoteData);
      const data = await this.tryMultipleApis(symbol);
      return data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  // Get multiple quotes at once
  async getQuotes(symbols: string[]): Promise<MarketData[]> {
    try {
      console.log('📊 Fetching quotes for symbols:', symbols.slice(0, 10), '...');
      const promises = symbols.map(symbol => this.getQuote(symbol));
      const results = await Promise.allSettled(promises);
      
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<MarketData> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      console.log('✅ Successfully fetched quotes:', successfulResults.length, 'out of', symbols.length);
      return successfulResults;
    } catch (error) {
      console.error('❌ Error fetching multiple quotes:', error);
      return [];
    }
  }

  // Get market overview data
  async getMarketOverview(): Promise<{
    indices: MarketData[];
    sectors: { name: string; change: number; changePercent: number }[];
  }> {
    try {
      const indices = await this.getQuotes(['^GSPC', '^IXIC', '^DJI', '^NSEI']);
      
      // Mock sector data for now - in production, this would come from an API
      const sectors = [
        { name: 'Technology', change: 1.2, changePercent: 0.8 },
        { name: 'Healthcare', change: 0.8, changePercent: 0.6 },
        { name: 'Financials', change: -0.3, changePercent: -0.2 },
        { name: 'Energy', change: 2.1, changePercent: 1.5 },
        { name: 'Consumer Discretionary', change: 0.5, changePercent: 0.3 },
        { name: 'Consumer Staples', change: -0.1, changePercent: -0.1 },
        { name: 'Cryptocurrency', change: 3.2, changePercent: 2.1 },
        { name: 'ETF', change: 0.6, changePercent: 0.4 },
      ];

      return { indices, sectors };
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return { indices: [], sectors: [] };
    }
  }

  // Get tickers for a specific sector
  async getSectorTickers(sector: string): Promise<MarketData[]> {
    try {
      // Map sectors to their representative tickers
      const sectorTickerMap: { [key: string]: string[] } = {
        'Technology': ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'ORCL', 'CRM', 'ADBE'],
        'Healthcare': ['JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR'],
        'Financials': ['JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'AXP'],
        'Energy': ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'PXD', 'KMI', 'WMB'],
        'Consumer Discretionary': ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'TJX'],
        'Consumer Staples': ['PG', 'KO', 'PEP', 'WMT', 'COST', 'CL', 'KMB', 'GIS'],
        'Cryptocurrency': ['BTC-USD', 'ETH-USD', 'ADA-USD', 'SOL-USD', 'DOT-USD', 'MATIC-USD'],
        'ETF': ['SPY', 'QQQ', 'IWM', 'VTI', 'VEA', 'VWO', 'AGG', 'TLT'],
      };

      const symbols = sectorTickerMap[sector] || [];
      if (symbols.length === 0) {
        return [];
      }

      return await this.getQuotes(symbols);
    } catch (error) {
      console.error(`Error fetching ${sector} tickers:`, error);
      return [];
    }
  }

  // Get financial news
  async getNews(symbol?: string, limit: number = 10): Promise<NewsItem[]> {
    try {
      if (!this.newsApiKey) {
        return this.getMockNews();
      }

      const url = symbol 
        ? `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${this.newsApiKey}&pageSize=${limit}&sortBy=publishedAt`
        : `https://newsapi.org/v2/top-headlines?category=business&apiKey=${this.newsApiKey}&pageSize=${limit}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'ok') {
        return data.articles.map((article: any) => ({
          id: article.url,
          title: article.title,
          summary: article.description || '',
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
          sentiment: this.analyzeSentiment(article.title + ' ' + article.description)
        }));
      }

      return this.getMockNews();
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.getMockNews();
    }
  }

  // Get popular tickers
  async getPopularTickers(): Promise<string[]> {
    try {
      console.log('🔍 Getting popular tickers...');
      console.log('🔑 FMP Key available:', !!this.fmpKey);
      
      // Try to get real data from APIs first
      if (this.fmpKey) {
        try {
          console.log('📡 Fetching from FMP API...');
          const response = await fetch(
            `https://financialmodelingprep.com/api/v3/stock/gainers?apikey=${this.fmpKey}`
          );
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            const gainers = data.slice(0, 10).map((item: any) => item.symbol);
            console.log('📈 Gainers from FMP:', gainers);
            
            const losersResponse = await fetch(
              `https://financialmodelingprep.com/api/v3/stock/losers?apikey=${this.fmpKey}`
            );
            const losersData = await losersResponse.json();
            const losers = Array.isArray(losersData) ? losersData.slice(0, 5).map((item: any) => item.symbol) : [];
            console.log('📉 Losers from FMP:', losers);
            
            const result = [...gainers, ...losers, 'SPY', 'QQQ', 'IWM', 'VTI', 'ARKK', 'BTC-USD', 'ETH-USD'];
            console.log('✅ FMP result:', result);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ Failed to fetch popular tickers from FMP:', error);
        }
      }

      // Fallback to comprehensive list
      const fallbackList = [
        // Major US Stocks
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
        'CRM', 'ADBE', 'ORCL', 'CSCO', 'IBM', 'JPM', 'BAC', 'WFC', 'GS', 'MS',
        'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'LLY', 'PEP',
        'KO', 'PG', 'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'TJX', 'TGT',
        'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'PXD', 'KMI', 'WMB', 'MPC', 'VLO',
        
        // ETFs
        'SPY', 'QQQ', 'IWM', 'VTI', 'VEA', 'VWO', 'AGG', 'TLT', 'ARKK', 'ARKQ',
        'ARKW', 'ARKG', 'ARKF', 'ARKX', 'GLD', 'SLV', 'USO', 'UNG', 'TAN', 'ICLN',
        
        // Crypto
        'BTC-USD', 'ETH-USD', 'ADA-USD', 'SOL-USD', 'DOT-USD', 'MATIC-USD', 'AVAX-USD', 'LINK-USD',
        
        // Indices
        '^GSPC', '^IXIC', '^DJI', '^VIX', '^TNX', '^FVX', '^TYX'
      ];
      
      console.log('📋 Using fallback list:', fallbackList.length, 'symbols');
      return fallbackList;
    } catch (error) {
      console.error('❌ Error getting popular tickers:', error);
      return [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
        'BTC-USD', 'ETH-USD', 'SPY', 'QQQ', 'IWM', 'VTI', 'ARKK'
      ];
    }
  }

  // Search for tickers
  async searchTickers(query: string): Promise<Ticker[]> {
    try {
      if (!query.trim()) return [];

      // Try Financial Modeling Prep API first
      if (this.fmpKey) {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${this.fmpKey}`
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          return data.map((item: any) => ({
            symbol: item.symbol,
            name: item.name,
            price: `$${item.price?.toFixed(2) || '0.00'}`,
            change: item.changes?.toFixed(2) || '0.00',
            changePercent: `${item.changesPercentage?.toFixed(2) || '0.00'}%`,
            isPositive: (item.changes || 0) >= 0,
            exchange: item.exchange || 'Unknown',
            type: this.getTickerType(item.symbol),
            marketCap: item.marketCap ? this.formatMarketCap(item.marketCap) : undefined,
            volume: item.volume ? this.formatVolume(item.volume) : undefined,
            pe: item.pe ? item.pe.toFixed(2) : undefined
          }));
        }
      }

      // Fallback to mock data
      return this.getMockSearchResults(query);
    } catch (error) {
      console.error('Error searching tickers:', error);
      return this.getMockSearchResults(query);
    }
  }

  // Private helper methods
  private async tryMultipleApis(symbol: string): Promise<MarketData | null> {
    console.log(`🔍 Trying APIs for ${symbol}...`);
    
    // Try Financial Modeling Prep first
    if (this.fmpKey) {
      try {
        console.log(`📡 Trying FMP for ${symbol}...`);
        const data = await this.fetchFromFMP(symbol);
        if (data) {
          console.log(`✅ FMP success for ${symbol}`);
          return data;
        }
      } catch (error) {
        console.warn(`⚠️ FMP API failed for ${symbol}:`, error);
      }
    }

    // Try Yahoo Finance (free alternative)
    try {
      console.log(`📡 Trying Yahoo Finance for ${symbol}...`);
      const data = await this.fetchFromYahooFinance(symbol);
      if (data) {
        console.log(`✅ Yahoo Finance success for ${symbol}`);
        return data;
      }
    } catch (error) {
      console.warn(`⚠️ Yahoo Finance API failed for ${symbol}:`, error);
    }

    // Try Alpha Vantage
    if (this.alphaVantageKey) {
      try {
        console.log(`📡 Trying Alpha Vantage for ${symbol}...`);
        const data = await this.fetchFromAlphaVantage(symbol);
        if (data) {
          console.log(`✅ Alpha Vantage success for ${symbol}`);
          return data;
        }
      } catch (error) {
        console.warn(`⚠️ Alpha Vantage API failed for ${symbol}:`, error);
      }
    }

    // Try Finnhub
    if (this.finnhubKey) {
      try {
        console.log(`📡 Trying Finnhub for ${symbol}...`);
        const data = await this.fetchFromFinnhub(symbol);
        if (data) {
          console.log(`✅ Finnhub success for ${symbol}`);
          return data;
        }
      } catch (error) {
        console.warn(`⚠️ Finnhub API failed for ${symbol}:`, error);
      }
    }

    // Fallback to mock data
    console.log(`📋 Using mock data for ${symbol}`);
    return this.getMockMarketData(symbol);
  }

  private async fetchFromFMP(symbol: string): Promise<MarketData | null> {
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${this.fmpKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return {
          symbol: item.symbol,
          name: item.name,
          price: item.price,
          change: item.changes,
          changePercent: item.changesPercentage,
          volume: item.volume,
          marketCap: item.marketCap,
          pe: item.pe,
          high52w: item.yearHigh,
          low52w: item.yearLow,
          open: item.open,
          previousClose: item.previousClose,
          timestamp: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.warn(`FMP API error for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchFromYahooFinance(symbol: string): Promise<MarketData | null> {
    try {
      // Use a CORS proxy for Yahoo Finance
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(yahooUrl));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.chart && data.chart.result && data.chart.result.length > 0) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators?.quote?.[0];
        
        if (meta && quote) {
          const currentPrice = meta.regularMarketPrice || meta.previousClose;
          const previousClose = meta.previousClose;
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;
          
          return {
            symbol: meta.symbol,
            name: meta.longName || meta.shortName || meta.symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            volume: meta.regularMarketVolume || 0,
            marketCap: meta.marketCap,
            pe: meta.trailingPE,
            high52w: meta.fiftyTwoWeekHigh,
            low52w: meta.fiftyTwoWeekLow,
            open: meta.regularMarketOpen || previousClose,
            previousClose: previousClose,
            timestamp: new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.warn(`Yahoo Finance API error for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchFromAlphaVantage(symbol: string): Promise<MarketData | null> {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`
    );
    const data = await response.json();

    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        name: quote['01. symbol'], // Alpha Vantage doesn't provide company name in this endpoint
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  private async fetchFromFinnhub(symbol: string): Promise<MarketData | null> {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubKey}`
    );
    const data = await response.json();

    if (data.c && data.d !== undefined) {
      return {
        symbol: symbol,
        name: symbol, // Finnhub doesn't provide company name in this endpoint
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        volume: data.v || 0,
        open: data.o,
        previousClose: data.pc,
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  private getMockMarketData(symbol: string): MarketData {
    const basePrice = 100 + Math.random() * 200;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      name: this.getCompanyName(symbol),
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      pe: 10 + Math.random() * 30,
      high52w: basePrice * 1.3,
      low52w: basePrice * 0.7,
      open: basePrice - change * 0.5,
      previousClose: basePrice - change,
      timestamp: new Date().toISOString()
    };
  }

  private getMockNews(): NewsItem[] {
    return [
      {
        id: '1',
        title: 'Market Shows Strong Performance in Tech Sector',
        summary: 'Technology stocks continue to lead market gains with strong earnings reports.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Financial News',
        sentiment: 'positive'
      },
      {
        id: '2',
        title: 'Federal Reserve Maintains Interest Rates',
        summary: 'The Fed keeps rates steady amid economic uncertainty.',
        url: '#',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: 'Market Watch',
        sentiment: 'neutral'
      }
    ];
  }

  private getMockSearchResults(query: string): Ticker[] {
    const mockTickers = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'META', name: 'Meta Platforms Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'BTC-USD', name: 'Bitcoin' },
      { symbol: 'ETH-USD', name: 'Ethereum' },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF' }
    ];

    return mockTickers
      .filter(ticker => 
        ticker.symbol.toLowerCase().includes(query.toLowerCase()) ||
        ticker.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(ticker => ({
        ...ticker,
        price: `$${(100 + Math.random() * 200).toFixed(2)}`,
        change: `${(Math.random() - 0.5) * 10 > 0 ? '+' : ''}${((Math.random() - 0.5) * 10).toFixed(2)}`,
        changePercent: `${((Math.random() - 0.5) * 5).toFixed(2)}%`,
        isPositive: Math.random() > 0.5,
        exchange: this.getExchange(ticker.symbol),
        type: this.getTickerType(ticker.symbol),
        marketCap: this.formatMarketCap(Math.random() * 1000000000000),
        volume: this.formatVolume(Math.random() * 10000000),
        pe: (10 + Math.random() * 30).toFixed(2)
      }));
  }

  private getCompanyName(symbol: string): string {
    const names: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'TSLA': 'Tesla Inc.',
      'AMZN': 'Amazon.com Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'BTC-USD': 'Bitcoin',
      'ETH-USD': 'Ethereum',
      'SPY': 'SPDR S&P 500 ETF',
      'QQQ': 'Invesco QQQ Trust',
      'IWM': 'iShares Russell 2000 ETF',
      'VTI': 'Vanguard Total Stock Market ETF'
    };
    return names[symbol] || symbol;
  }

  private getExchange(symbol: string): string {
    if (symbol.includes('BTC') || symbol.includes('ETH')) return 'CRYPTO';
    if (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('IWM') || symbol.includes('VTI')) return 'NYSE';
    return 'NASDAQ';
  }

  private getTickerType(symbol: string): 'stock' | 'etf' | 'crypto' | 'index' {
    if (symbol.includes('BTC') || symbol.includes('ETH')) return 'crypto';
    if (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('IWM') || symbol.includes('VTI')) return 'etf';
    if (symbol.startsWith('^')) return 'index';
    return 'stock';
  }

  private formatMarketCap(value: number): string {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(0)}`;
  }

  private formatVolume(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(0);
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['up', 'gain', 'rise', 'bullish', 'positive', 'strong', 'growth'];
    const negativeWords = ['down', 'loss', 'fall', 'bearish', 'negative', 'weak', 'decline'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

export const financialDataService = new FinancialDataService();
