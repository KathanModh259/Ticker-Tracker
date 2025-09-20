import { financialDataService, MarketData } from '@/services/financialDataService';
import { notificationService } from '@/services/notificationService';
import { realTimeDataService } from '@/services/realTimeDataService';
import { create } from 'zustand';

export interface Ticker {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  exchange: string;
  type: 'stock' | 'etf' | 'crypto' | 'index';
  sector?: string;
  industry?: string;
  marketCap?: string;
  volume?: string;
  pe?: string;
  lastUpdated?: string;
  // Additional fields for filtering
  priceValue?: number;
  changeValue?: number;
  changePercentValue?: number;
  volumeValue?: number;
  marketCapValue?: number;
  country?: string;
  currency?: string;
}

export interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number;
  direction: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
}

export type MarketType = 'us' | 'indian' | 'crypto' | 'european' | 'asian' | 'mcx' | 'all';

export type ExchangeType = 
  | 'NYSE' | 'NASDAQ'  // US
  | 'BSE' | 'NSE'     // Indian
  | 'MCX'            // Commodities
  | 'BINANCE' | 'COINBASE'  // Crypto
  | 'LSE' | 'FWB'    // European
  | 'TSE' | 'SSE';   // Asian

export interface FilterOptions {
  // Price filters
  minPrice: number | null;
  maxPrice: number | null;
  
  // Market cap filters
  minMarketCap: number | null;
  maxMarketCap: number | null;
  marketCapRange: 'micro' | 'small' | 'mid' | 'large' | 'mega' | 'all';
  
  // Volume filters
  minVolume: number | null;
  maxVolume: number | null;
  
  // Change filters
  minChangePercent: number | null;
  maxChangePercent: number | null;
  changeDirection: 'gainers' | 'losers' | 'all';
  
  // Type filters
  types: ('stock' | 'etf' | 'crypto' | 'index')[];
  
  // Exchange filters
  exchanges: string[];
  
  // Sector filters
  sectors: string[];
  
  // Country filters
  countries: string[];
  
  // PE ratio filters
  minPE: number | null;
  maxPE: number | null;
  
  // Sort options
  sortBy: 'price' | 'change' | 'changePercent' | 'volume' | 'marketCap' | 'name' | 'symbol';
  sortOrder: 'asc' | 'desc';
}

interface TickerStore {
  // Data
  tickers: Ticker[];
  watchlist: string[];
  alerts: Alert[];
  searchQuery: string;
  selectedTicker: Ticker | null;
  loading: boolean;
  lastUpdate: string | null;
  
  // Market selection
  selectedMarket: MarketType;
  
  // Filtering
  filters: FilterOptions;
  selectedSector: string | null;
  sectors: { name: string; change: number; changePercent: number }[];
  sectorTickers: { [sector: string]: Ticker[] };
  
  // Search and filters
  setSearchQuery: (query: string) => void;
  filteredTickers: () => Ticker[];
  searchTickers: (query: string) => Promise<Ticker[]>;
  
  // Market actions
  setSelectedMarket: (market: MarketType) => void;
  getMarketTickers: () => Ticker[];
  loadMarketTickers: (market: MarketType) => Promise<void>;
  
  // Filter actions
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  applyFilters: (tickers: Ticker[]) => Ticker[];
  
  // Sector actions
  setSelectedSector: (sector: string | null) => void;
  getSectorTickers: (sector: string) => Ticker[];
  loadSectorTickers: (sector: string) => Promise<void>;
  getAvailableSectors: () => string[];
  
  // Watchlist actions
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  getWatchlistTickers: () => Ticker[];
  loadUserWatchlist: (userId: string) => Promise<void>;
  saveUserWatchlist: (userId: string) => Promise<void>;
  
  // Alert actions
  addAlert: (symbol: string, targetPrice: number, direction: 'above' | 'below') => void;
  removeAlert: (alertId: string) => void;
  getTickerAlerts: (symbol: string) => Alert[];
  checkAlerts: () => void;
  
  // Ticker actions
  setSelectedTicker: (ticker: Ticker | null) => void;
  updateTickerPrice: (symbol: string, price: string, change: string, changePercent: string) => void;
  loadPopularTickers: () => Promise<void>;
  refreshTickerData: (symbol: string) => Promise<void>;
  refreshAllTickers: () => Promise<void>;
}

// Mock data
const mockTickers: Ticker[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: "$173.50", change: "+2.34", changePercent: "1.37%", isPositive: true, exchange: "NASDAQ", type: "stock", marketCap: "$2.8T", volume: "45.2M", pe: "28.4" },
  { symbol: "TSLA", name: "Tesla Inc.", price: "$248.42", change: "-5.67", changePercent: "-2.23%", isPositive: false, exchange: "NASDAQ", type: "stock", marketCap: "$785B", volume: "89.3M", pe: "65.2" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: "$378.85", change: "+4.12", changePercent: "1.10%", isPositive: true, exchange: "NASDAQ", type: "stock", marketCap: "$2.9T", volume: "32.1M", pe: "32.1" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: "$138.91", change: "+2.15", changePercent: "1.57%", isPositive: true, exchange: "NASDAQ", type: "stock", marketCap: "$1.7T", volume: "28.5M", pe: "25.8" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: "$143.09", change: "-4.23", changePercent: "-2.87%", isPositive: false, exchange: "NASDAQ", type: "stock", marketCap: "$1.5T", volume: "41.2M", pe: "45.3" },
  { symbol: "META", name: "Meta Platforms", price: "$325.67", change: "-7.82", changePercent: "-2.34%", isPositive: false, exchange: "NASDAQ", type: "stock", marketCap: "$820B", volume: "18.7M", pe: "22.9" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: "$478.32", change: "+23.45", changePercent: "5.15%", isPositive: true, exchange: "NASDAQ", type: "stock", marketCap: "$1.2T", volume: "67.8M", pe: "71.5" },
  { symbol: "BTC-USD", name: "Bitcoin", price: "$43,250", change: "+892.45", changePercent: "2.11%", isPositive: true, exchange: "CRYPTO", type: "crypto", marketCap: "$845B", volume: "$28.9B" },
  { symbol: "ETH-USD", name: "Ethereum", price: "$2,245.67", change: "+45.23", changePercent: "2.06%", isPositive: true, exchange: "CRYPTO", type: "crypto", marketCap: "$270B", volume: "$12.4B" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", price: "$415.83", change: "+2.41", changePercent: "0.58%", isPositive: true, exchange: "NYSE", type: "etf", volume: "78.5M" },
];

const defaultFilters: FilterOptions = {
  minPrice: null,
  maxPrice: null,
  minMarketCap: null,
  maxMarketCap: null,
  marketCapRange: 'all',
  minVolume: null,
  maxVolume: null,
  minChangePercent: null,
  maxChangePercent: null,
  changeDirection: 'all',
  types: ['stock', 'etf', 'crypto', 'index'],
  exchanges: [],
  sectors: [],
  countries: [],
  minPE: null,
  maxPE: null,
  sortBy: 'changePercent',
  sortOrder: 'desc'
};

export const useTickerStore = create<TickerStore>((set, get) => ({
  // Initial state
  tickers: [],
  watchlist: [],
  alerts: [],
  searchQuery: "",
  selectedTicker: null,
  loading: false,
  lastUpdate: null,
  
  // Market selection
  selectedMarket: 'us',
  
  // Filtering state
  filters: defaultFilters,
  selectedSector: null,
  sectors: [],
  sectorTickers: {},
  
  // Search and filters
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  filteredTickers: () => {
    const { tickers, searchQuery, selectedSector, selectedMarket, filters } = get();
    let filtered = [...tickers];
    
    // Filter by market first
    filtered = getMarketTickersByType(filtered, selectedMarket);
    
    // Filter by sector if selected
    if (selectedSector) {
      filtered = filtered.filter(ticker => ticker.sector === selectedSector);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticker => 
        ticker.symbol.toLowerCase().includes(query) || 
        ticker.name.toLowerCase().includes(query)
      );
    }
    
    // Apply advanced filters
    filtered = get().applyFilters(filtered);
    
    return filtered;
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  applyFilters: (tickers) => {
    const { filters } = get();
    let filtered = [...tickers];

    // Price filters
    if (filters.minPrice !== null) {
      filtered = filtered.filter(ticker => (ticker.priceValue || 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter(ticker => (ticker.priceValue || 0) <= filters.maxPrice!);
    }

    // Market cap filters
    if (filters.minMarketCap !== null) {
      filtered = filtered.filter(ticker => (ticker.marketCapValue || 0) >= filters.minMarketCap!);
    }
    if (filters.maxMarketCap !== null) {
      filtered = filtered.filter(ticker => (ticker.marketCapValue || 0) <= filters.maxMarketCap!);
    }

    // Market cap range filter
    if (filters.marketCapRange !== 'all') {
      const ranges = {
        micro: [0, 300e6],
        small: [300e6, 2e9],
        mid: [2e9, 10e9],
        large: [10e9, 200e9],
        mega: [200e9, Infinity]
      };
      const [min, max] = ranges[filters.marketCapRange];
      filtered = filtered.filter(ticker => {
        const marketCap = ticker.marketCapValue || 0;
        return marketCap >= min && marketCap < max;
      });
    }

    // Volume filters
    if (filters.minVolume !== null) {
      filtered = filtered.filter(ticker => (ticker.volumeValue || 0) >= filters.minVolume!);
    }
    if (filters.maxVolume !== null) {
      filtered = filtered.filter(ticker => (ticker.volumeValue || 0) <= filters.maxVolume!);
    }

    // Change percent filters
    if (filters.minChangePercent !== null) {
      filtered = filtered.filter(ticker => (ticker.changePercentValue || 0) >= filters.minChangePercent!);
    }
    if (filters.maxChangePercent !== null) {
      filtered = filtered.filter(ticker => (ticker.changePercentValue || 0) <= filters.maxChangePercent!);
    }

    // Change direction filter
    if (filters.changeDirection === 'gainers') {
      filtered = filtered.filter(ticker => ticker.isPositive);
    } else if (filters.changeDirection === 'losers') {
      filtered = filtered.filter(ticker => !ticker.isPositive);
    }

    // Type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(ticker => filters.types.includes(ticker.type));
    }

    // Exchange filters
    if (filters.exchanges.length > 0) {
      filtered = filtered.filter(ticker => filters.exchanges.includes(ticker.exchange));
    }

    // Sector filters
    if (filters.sectors.length > 0) {
      filtered = filtered.filter(ticker => ticker.sector && filters.sectors.includes(ticker.sector));
    }

    // Country filters
    if (filters.countries.length > 0) {
      filtered = filtered.filter(ticker => ticker.country && filters.countries.includes(ticker.country));
    }

    // PE ratio filters
    if (filters.minPE !== null) {
      filtered = filtered.filter(ticker => {
        const pe = ticker.pe ? parseFloat(ticker.pe) : null;
        return pe !== null && pe >= filters.minPE!;
      });
    }
    if (filters.maxPE !== null) {
      filtered = filtered.filter(ticker => {
        const pe = ticker.pe ? parseFloat(ticker.pe) : null;
        return pe !== null && pe <= filters.maxPE!;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'price':
          aValue = a.priceValue || 0;
          bValue = b.priceValue || 0;
          break;
        case 'change':
          aValue = a.changeValue || 0;
          bValue = b.changeValue || 0;
          break;
        case 'changePercent':
          aValue = a.changePercentValue || 0;
          bValue = b.changePercentValue || 0;
          break;
        case 'volume':
          aValue = a.volumeValue || 0;
          bValue = b.volumeValue || 0;
          break;
        case 'marketCap':
          aValue = a.marketCapValue || 0;
          bValue = b.marketCapValue || 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'symbol':
          aValue = a.symbol.toLowerCase();
          bValue = b.symbol.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  },

  searchTickers: async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      set({ loading: true });
      const results = await financialDataService.searchTickers(query);
      set({ loading: false });
      return results;
    } catch (error) {
      console.error('Error searching tickers:', error);
      set({ loading: false });
      return [];
    }
  },
  
  // Market actions
  setSelectedMarket: (market) => {
    set({ selectedMarket: market });
    get().loadMarketTickers(market);
  },
  
  getMarketTickers: () => {
    const { tickers, selectedMarket } = get();
    return getMarketTickersByType(tickers, selectedMarket);
  },
  
  loadMarketTickers: async (market) => {
    try {
      set({ loading: true });
      const marketSymbols = getMarketSymbols(market);
      const tickerData = await financialDataService.getQuotes(marketSymbols);
      
      const tickers: Ticker[] = tickerData.map((data: MarketData) => ({
        symbol: data.symbol,
        name: data.name,
        price: `$${data.price.toFixed(2)}`,
        change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}`,
        changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
        isPositive: data.change >= 0,
        exchange: getExchange(data.symbol),
        type: getTickerType(data.symbol),
        sector: getSectorForSymbol(data.symbol),
        marketCap: data.marketCap ? formatMarketCap(data.marketCap) : undefined,
        volume: formatVolume(data.volume),
        pe: data.pe ? data.pe.toFixed(2) : undefined,
        lastUpdated: data.timestamp,
        // Additional fields for filtering
        priceValue: data.price,
        changeValue: data.change,
        changePercentValue: data.changePercent,
        volumeValue: data.volume,
        marketCapValue: data.marketCap,
        country: getCountryForSymbol(data.symbol),
        currency: getCurrencyForSymbol(data.symbol)
      }));

      set({ 
        tickers, 
        loading: false, 
        lastUpdate: new Date().toISOString() 
      });
    } catch (error) {
      console.error(`Error loading ${market} market tickers:`, error);
      set({ loading: false });
    }
  },
  
  // Sector actions
  setSelectedSector: (sector) => set({ selectedSector: sector }),
  
  getSectorTickers: (sector) => {
    const { sectorTickers } = get();
    return sectorTickers[sector] || [];
  },
  
  loadSectorTickers: async (sector) => {
    try {
      set({ loading: true });
      const sectorData = await financialDataService.getSectorTickers(sector);
      
      const tickers: Ticker[] = sectorData.map((data: MarketData) => ({
        symbol: data.symbol,
        name: data.name,
        price: `$${data.price.toFixed(2)}`,
        change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}`,
        changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
        isPositive: data.change >= 0,
        exchange: getExchange(data.symbol),
        type: getTickerType(data.symbol),
        sector: sector,
        marketCap: data.marketCap ? formatMarketCap(data.marketCap) : undefined,
        volume: formatVolume(data.volume),
        pe: data.pe ? data.pe.toFixed(2) : undefined,
        lastUpdated: data.timestamp
      }));

      set((state) => ({
        sectorTickers: {
          ...state.sectorTickers,
          [sector]: tickers
        },
        loading: false
      }));
    } catch (error) {
      console.error(`Error loading ${sector} tickers:`, error);
      set({ loading: false });
    }
  },
  
  getAvailableSectors: () => {
    const { sectors } = get();
    return sectors.map(s => s.name);
  },
  
  // Watchlist actions
  addToWatchlist: (symbol) => {
    set((state) => ({
      watchlist: state.watchlist.includes(symbol) 
        ? state.watchlist 
        : [...state.watchlist, symbol]
    }));
    
    // Save to localStorage immediately
    const { watchlist } = get();
    localStorage.setItem('ticker_watchlist', JSON.stringify(watchlist));
  },
  
  removeFromWatchlist: (symbol) => {
    set((state) => ({
      watchlist: state.watchlist.filter(s => s !== symbol)
    }));
    
    // Save to localStorage immediately
    const { watchlist } = get();
    localStorage.setItem('ticker_watchlist', JSON.stringify(watchlist));
  },
  
  isInWatchlist: (symbol) => {
    return get().watchlist.includes(symbol);
  },
  
  getWatchlistTickers: () => {
    const { tickers, watchlist } = get();
    return tickers.filter(ticker => watchlist.includes(ticker.symbol));
  },

  loadUserWatchlist: async (userId) => {
    try {
      // TODO: Add user_watchlists table to Supabase schema
      // For now, use localStorage with user-specific key
      const userWatchlistKey = `ticker_watchlist_${userId}`;
      const savedWatchlist = localStorage.getItem(userWatchlistKey);
      
      if (savedWatchlist) {
        const watchlist = JSON.parse(savedWatchlist);
        set({ watchlist });
      } else {
        // Fallback to general watchlist
        const generalWatchlist = localStorage.getItem('ticker_watchlist');
        if (generalWatchlist) {
          const watchlist = JSON.parse(generalWatchlist);
          set({ watchlist });
        }
      }
    } catch (error) {
      console.error('Error loading user watchlist:', error);
      // Fallback to localStorage
      const savedWatchlist = localStorage.getItem('ticker_watchlist');
      if (savedWatchlist) {
        const watchlist = JSON.parse(savedWatchlist);
        set({ watchlist });
      }
    }
  },

  saveUserWatchlist: async (userId) => {
    try {
      const { watchlist } = get();
      
      // TODO: Add user_watchlists table to Supabase schema
      // For now, save to localStorage with user-specific key
      const userWatchlistKey = `ticker_watchlist_${userId}`;
      localStorage.setItem(userWatchlistKey, JSON.stringify(watchlist));
      
      // Also save to general localStorage as backup
      localStorage.setItem('ticker_watchlist', JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error saving user watchlist:', error);
      // Fallback to localStorage
      const { watchlist } = get();
      localStorage.setItem('ticker_watchlist', JSON.stringify(watchlist));
    }
  },
  
  // Alert actions
  addAlert: (symbol, targetPrice, direction) => {
    // Subscribe to real-time updates for this symbol
    realTimeDataService.addAlert(symbol, targetPrice, direction);
    const ticker = get().tickers.find(t => t.symbol === symbol);
    if (!ticker) return;
    
    const alert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      symbol,
      targetPrice,
      currentPrice: parseFloat(ticker.price.replace(/[$,]/g, '')),
      direction,
      isActive: true,
      createdAt: new Date()
    };
    
    set((state) => ({
      alerts: [...state.alerts, alert]
    }));
  },
  
  removeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== alertId)
    }));
  },
  
  getTickerAlerts: (symbol) => {
    return get().alerts.filter(alert => alert.symbol === symbol && alert.isActive);
  },

  checkAlerts: () => {
    const { alerts, tickers } = get();
    
    alerts.forEach(alert => {
      if (!alert.isActive) return;
      
      const ticker = tickers.find(t => t.symbol === alert.symbol);
      if (!ticker) return;
      
      const currentPrice = parseFloat(ticker.price.replace(/[$,]/g, ''));
      const targetPrice = alert.targetPrice;
      
      let shouldTrigger = false;
      
      if (alert.direction === 'above' && currentPrice >= targetPrice) {
        shouldTrigger = true;
      } else if (alert.direction === 'below' && currentPrice <= targetPrice) {
        shouldTrigger = true;
      }
      
      if (shouldTrigger) {
        // Show notification
        notificationService.showPriceAlert(alert.symbol, currentPrice, targetPrice, alert.direction);
        
        // Deactivate alert
        set((state) => ({
          alerts: state.alerts.map(a => 
            a.id === alert.id ? { ...a, isActive: false } : a
          )
        }));
      }
    });
  },
  
  // Ticker actions
  setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
  
  updateTickerPrice: (symbol, price, change, changePercent) => {
    set((state) => ({
      tickers: state.tickers.map(ticker =>
        ticker.symbol === symbol
          ? { ...ticker, price, change, changePercent, isPositive: !change.startsWith('-'), lastUpdated: new Date().toISOString() }
          : ticker
      )
    }));
    
    // Check alerts after price update
    setTimeout(() => {
      get().checkAlerts();
    }, 100);
  },

  loadPopularTickers: async () => {
    try {
      set({ loading: true });
      console.log('🔄 Loading popular tickers...');
      
      const popularSymbols = await financialDataService.getPopularTickers();
      console.log('📊 Popular symbols:', popularSymbols);
      
      const tickerData = await financialDataService.getQuotes(popularSymbols);
      console.log('📈 Ticker data received:', tickerData.length, 'tickers');
      
      const marketOverview = await financialDataService.getMarketOverview();
      
      let tickers: Ticker[] = [];
      
      if (tickerData.length > 0) {
        // Use real data if available
        tickers = tickerData.map((data: MarketData) => ({
          symbol: data.symbol,
          name: data.name,
          price: `$${data.price.toFixed(2)}`,
          change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}`,
          changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
          isPositive: data.change >= 0,
          exchange: getExchange(data.symbol),
          type: getTickerType(data.symbol),
          sector: getSectorForSymbol(data.symbol),
          marketCap: data.marketCap ? formatMarketCap(data.marketCap) : undefined,
          volume: formatVolume(data.volume),
          pe: data.pe ? data.pe.toFixed(2) : undefined,
          lastUpdated: data.timestamp,
          // Additional fields for filtering
          priceValue: data.price,
          changeValue: data.change,
          changePercentValue: data.changePercent,
          volumeValue: data.volume,
          marketCapValue: data.marketCap,
          country: getCountryForSymbol(data.symbol),
          currency: getCurrencyForSymbol(data.symbol)
        }));
      } else {
        // Fallback to mock data if no real data is available
        console.log('📋 Using mock data as fallback');
        tickers = mockTickers.map(ticker => ({
          ...ticker,
          // Additional fields for filtering
          priceValue: parseFloat(ticker.price.replace(/[$,]/g, '')),
          changeValue: parseFloat(ticker.change.replace(/[+]/g, '')),
          changePercentValue: parseFloat(ticker.changePercent.replace(/[%]/g, '')),
          volumeValue: ticker.volume ? parseFloat(ticker.volume.replace(/[BMK]/g, '')) * (ticker.volume.includes('B') ? 1e9 : ticker.volume.includes('M') ? 1e6 : 1e3) : 0,
          marketCapValue: ticker.marketCap ? parseFloat(ticker.marketCap.replace(/[$,TBMK]/g, '')) * (ticker.marketCap.includes('T') ? 1e12 : ticker.marketCap.includes('B') ? 1e9 : ticker.marketCap.includes('M') ? 1e6 : 1e3) : 0,
          country: getCountryForSymbol(ticker.symbol),
          currency: getCurrencyForSymbol(ticker.symbol),
          sector: getSectorForSymbol(ticker.symbol)
        }));
      }

      console.log('✅ Processed tickers:', tickers.length);
      console.log('📊 Sample ticker:', tickers[0]);

      set({ 
        tickers, 
        sectors: marketOverview.sectors,
        loading: false, 
        lastUpdate: new Date().toISOString() 
      });
    } catch (error) {
      console.error('❌ Error loading popular tickers:', error);
      // Use mock data as fallback even on error
      console.log('📋 Using mock data as error fallback');
      const fallbackTickers = mockTickers.map(ticker => ({
        ...ticker,
        // Additional fields for filtering
        priceValue: parseFloat(ticker.price.replace(/[$,]/g, '')),
        changeValue: parseFloat(ticker.change.replace(/[+]/g, '')),
        changePercentValue: parseFloat(ticker.changePercent.replace(/[%]/g, '')),
        volumeValue: ticker.volume ? parseFloat(ticker.volume.replace(/[BMK]/g, '')) * (ticker.volume.includes('B') ? 1e9 : ticker.volume.includes('M') ? 1e6 : 1e3) : 0,
        marketCapValue: ticker.marketCap ? parseFloat(ticker.marketCap.replace(/[$,TBMK]/g, '')) * (ticker.marketCap.includes('T') ? 1e12 : ticker.marketCap.includes('B') ? 1e9 : ticker.marketCap.includes('M') ? 1e6 : 1e3) : 0,
        country: getCountryForSymbol(ticker.symbol),
        currency: getCurrencyForSymbol(ticker.symbol),
        sector: getSectorForSymbol(ticker.symbol)
      }));
      
      set({ 
        tickers: fallbackTickers,
        sectors: [
          { name: 'Technology', change: 1.2, changePercent: 0.8 },
          { name: 'Healthcare', change: 0.8, changePercent: 0.6 },
          { name: 'Financials', change: -0.3, changePercent: -0.2 },
          { name: 'Energy', change: 2.1, changePercent: 1.5 },
          { name: 'Consumer Discretionary', change: 0.5, changePercent: 0.3 },
          { name: 'Consumer Staples', change: -0.1, changePercent: -0.1 },
          { name: 'Cryptocurrency', change: 3.2, changePercent: 2.1 },
          { name: 'ETF', change: 0.6, changePercent: 0.4 },
        ],
        loading: false, 
        lastUpdate: new Date().toISOString() 
      });
    }
  },

  refreshTickerData: async (symbol: string) => {
    try {
      const data = await financialDataService.getQuote(symbol);
      if (data) {
        const ticker: Ticker = {
          symbol: data.symbol,
          name: data.name,
          price: `$${data.price.toFixed(2)}`,
          change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}`,
          changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
          isPositive: data.change >= 0,
          exchange: getExchange(data.symbol),
          type: getTickerType(data.symbol),
          marketCap: data.marketCap ? formatMarketCap(data.marketCap) : undefined,
          volume: formatVolume(data.volume),
          pe: data.pe ? data.pe.toFixed(2) : undefined,
          lastUpdated: data.timestamp
        };

        set((state) => ({
          tickers: state.tickers.map(t => t.symbol === symbol ? ticker : t)
        }));
      }
    } catch (error) {
      console.error(`Error refreshing ticker ${symbol}:`, error);
    }
  },

  refreshAllTickers: async () => {
    const tickerSymbols = new Set<string>();
    get().tickers.forEach(ticker => tickerSymbols.add(ticker.symbol));

    if (tickerSymbols.size === 0) return;

    set({ loading: true });
    try {
      const quotes = await financialDataService.getBatchQuotes(Array.from(tickerSymbols));
      
      set(state => ({
        tickers: state.tickers.map(ticker => {
          const quote = quotes.get(ticker.symbol);
          if (!quote) return ticker;

          return {
            ...ticker,
            price: quote.price.toFixed(2),
            change: quote.change.toFixed(2),
            changePercent: quote.changePercent.toFixed(2) + '%',
            isPositive: quote.change >= 0,
            volume: quote.volume?.toString() || ticker.volume,
            lastUpdated: new Date().toISOString()
          };
        }),
        loading: false,
        lastUpdate: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error refreshing tickers:', error);
      set({ loading: false });
    }
    const { tickers } = get();
    const symbols = tickers.map(t => t.symbol);
    
    try {
      set({ loading: true });
      const tickerData = await financialDataService.getQuotes(symbols);
      
      const updatedTickers: Ticker[] = tickerData.map((data: MarketData) => ({
        symbol: data.symbol,
        name: data.name,
        price: `$${data.price.toFixed(2)}`,
        change: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}`,
        changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
        isPositive: data.change >= 0,
        exchange: getExchange(data.symbol),
        type: getTickerType(data.symbol),
        marketCap: data.marketCap ? formatMarketCap(data.marketCap) : undefined,
        volume: formatVolume(data.volume),
        pe: data.pe ? data.pe.toFixed(2) : undefined,
        lastUpdated: data.timestamp
      }));

      set({ tickers: updatedTickers, loading: false, lastUpdate: new Date().toISOString() });
    } catch (error) {
      console.error('Error refreshing all tickers:', error);
      set({ loading: false });
    }
  }
}));

// Helper functions
const getExchange = (symbol: string): string => {
  if (symbol.includes('BTC') || symbol.includes('ETH')) return 'CRYPTO';
  if (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('IWM') || symbol.includes('VTI')) return 'NYSE';
  return 'NASDAQ';
};

const getTickerType = (symbol: string): 'stock' | 'etf' | 'crypto' | 'index' => {
  if (symbol.includes('BTC') || symbol.includes('ETH')) return 'crypto';
  if (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('IWM') || symbol.includes('VTI')) return 'etf';
  if (symbol.startsWith('^')) return 'index';
  return 'stock';
};

const getSectorForSymbol = (symbol: string): string => {
  // Map symbols to sectors based on common knowledge
  const sectorMap: { [key: string]: string } = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOGL': 'Technology',
    'AMZN': 'Consumer Discretionary',
    'TSLA': 'Consumer Discretionary',
    'NVDA': 'Technology',
    'META': 'Technology',
    'JPM': 'Financials',
    'V': 'Financials',
    'JNJ': 'Healthcare',
    'PG': 'Consumer Staples',
    'BTC-USD': 'Cryptocurrency',
    'ETH-USD': 'Cryptocurrency',
    'SPY': 'ETF',
    'QQQ': 'ETF',
  };
  
  return sectorMap[symbol] || 'Other';
};

const formatMarketCap = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
};

const formatVolume = (value: number): string => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(0);
};

const getCountryForSymbol = (symbol: string): string => {
  // Map symbols to countries based on exchange
  if (symbol.includes('BTC') || symbol.includes('ETH')) return 'Global';
  if (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('IWM')) return 'USA';
  if (symbol.startsWith('^')) return 'USA';
  return 'USA'; // Default for most symbols
};

const getCurrencyForSymbol = (symbol: string): string => {
  // Map symbols to currencies
  if (symbol.includes('BTC') || symbol.includes('ETH')) return 'USD';
  if (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('IWM')) return 'USD';
  if (symbol.startsWith('^')) return 'USD';
  return 'USD'; // Default for most symbols
};

// Market-specific symbol lists
const getMarketSymbols = (market: MarketType): string[] => {
  const marketSymbols: { [key in MarketType]: string[] } = {
    us: [
      // Major US Stocks
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
      'CRM', 'ADBE', 'ORCL', 'CSCO', 'IBM', 'JPM', 'BAC', 'WFC', 'GS', 'MS',
      'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'LLY', 'PEP',
      'KO', 'PG', 'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'TJX', 'TGT',
      'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'PXD', 'KMI', 'WMB', 'MPC', 'VLO',
      // US ETFs
      'SPY', 'QQQ', 'IWM', 'VTI', 'VEA', 'VWO', 'AGG', 'TLT', 'ARKK', 'ARKQ',
      'ARKW', 'ARKG', 'ARKF', 'ARKX', 'GLD', 'SLV', 'USO', 'UNG', 'TAN', 'ICLN',
      // US Indices
      '^GSPC', '^IXIC', '^DJI', '^VIX', '^TNX', '^FVX', '^TYX'
    ],
    indian: [
      // Major Indian Stocks (NSE symbols)
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
      'ITC.NS', 'KOTAKBANK.NS', 'BHARTIARTL.NS', 'LT.NS', 'ASIANPAINT.NS',
      'MARUTI.NS', 'AXISBANK.NS', 'SUNPHARMA.NS', 'NESTLEIND.NS', 'ULTRACEMCO.NS',
      'TITAN.NS', 'POWERGRID.NS', 'NTPC.NS', 'ONGC.NS', 'COALINDIA.NS',
      // Indian Indices
      '^NSEI', '^BSESN', '^CNXIT', '^CNX100'
    ],
    crypto: [
      'BTC-USD', 'ETH-USD', 'ADA-USD', 'SOL-USD', 'DOT-USD', 'MATIC-USD', 
      'AVAX-USD', 'LINK-USD', 'UNI-USD', 'LTC-USD', 'BCH-USD', 'XRP-USD',
      'DOGE-USD', 'SHIB-USD', 'ATOM-USD', 'ALGO-USD', 'VET-USD', 'ICP-USD'
    ],
    european: [
      // Major European Stocks
      'ASML.AS', 'SAP.DE', 'SHEL.L', 'ULVR.L', 'AZN.L', 'NOVN.SW', 'ROG.SW',
      'NESN.SW', 'SAP.DE', 'SIE.DE', 'ALV.DE', 'BAYN.DE', 'BMW.DE', 'VOW3.DE',
      // European Indices
      '^FCHI', '^GDAXI', '^FTSE', '^STOXX50E'
    ],
    asian: [
      // Major Asian Stocks
      'TSM', 'BABA', 'JD', 'PDD', 'NIO', 'XPEV', 'LI', 'BIDU', 'NTES', 'TME',
      'VIPS', 'YMM', 'TAL', 'EDU', 'COE', 'WB', 'SINA', 'SOHU', 'NTES',
      // Asian Indices
      '^HSI', '^N225', '^KS11', '^TWII', '^AXJO'
    ],
    mcx: [
      // MCX Commodities
      'GOLD.MCX', 'SILVER.MCX', 'CRUDEOIL.MCX', 'COPPER.MCX', 'NATURALGAS.MCX',
      'ZINC.MCX', 'NICKEL.MCX', 'COTTON.MCX', 'CPO.MCX', 'LEAD.MCX',
      // MCX Indices
      'MCXBULLDEX.MCX', 'MCXMETLDEX.MCX', 'MCXAGRIDEX.MCX', 'MCXENRGDEX.MCX'
    ],
    all: [
      // Combined list from all markets
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
      'BTC-USD', 'ETH-USD', 'SPY', 'QQQ', 'IWM', 'VTI', 'ARKK',
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS',
      'ASML.AS', 'SAP.DE', 'SHEL.L', 'ULVR.L',
      'TSM', 'BABA', 'JD', 'PDD', 'NIO',
      'GOLD.MCX', 'SILVER.MCX', 'CRUDEOIL.MCX', 'NATURALGAS.MCX'
    ]
  };
  
  return marketSymbols[market] || marketSymbols.us;
};

// Filter tickers by market type
const getMarketTickersByType = (tickers: Ticker[], market: MarketType): Ticker[] => {
  if (market === 'all') return tickers;
  
  const marketSymbols = getMarketSymbols(market);
  return tickers.filter(ticker => marketSymbols.includes(ticker.symbol));
};