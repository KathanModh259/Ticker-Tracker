# API Setup Guide for TickerTracker

This guide will help you set up real financial data APIs to replace the mock data with live market information.

## 🔑 Required API Keys

### 1. Financial Modeling Prep (Recommended - Primary)
- **Website**: https://financialmodelingprep.com/
- **Free Tier**: 250 requests/day
- **Sign up**: Create account and get API key
- **Environment Variable**: `VITE_FINANCIAL_MODELING_PREP_API_KEY`

### 2. Alpha Vantage (Backup)
- **Website**: https://www.alphavantage.co/
- **Free Tier**: 25 requests/day
- **Sign up**: Create account and get API key
- **Environment Variable**: `VITE_ALPHA_VANTAGE_API_KEY`

### 3. Finnhub (Backup)
- **Website**: https://finnhub.io/
- **Free Tier**: 60 requests/minute
- **Sign up**: Create account and get API key
- **Environment Variable**: `VITE_FINNHUB_API_KEY`

### 4. News API (Optional)
- **Website**: https://newsapi.org/
- **Free Tier**: 1000 requests/month
- **Sign up**: Create account and get API key
- **Environment Variable**: `VITE_NEWS_API_KEY`

## 🚀 Quick Setup

1. **Get your API keys** from the services above
2. **Update your `.env` file** in the project root:

```env
# Primary API (Financial Modeling Prep)
VITE_FINANCIAL_MODELING_PREP_API_KEY=your_fmp_api_key_here

# Backup APIs
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here

# Optional APIs
VITE_NEWS_API_KEY=your_news_api_key_here
VITE_POLYGON_API_KEY=your_polygon_api_key_here

# Supabase (Already configured)
VITE_SUPABASE_URL=https://ggkppcgntudijqioavht.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdna3BwY2dudHVkaWpxaW9hdmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDA5NjQsImV4cCI6MjA3Mzg3Njk2NH0.MBOmz6n-pwHDphIG2BDKt1JcYgCABINv2lxD8DveFyY

# App Configuration
VITE_APP_NAME=TickerTracker
VITE_APP_VERSION=1.0.0
VITE_REAL_TIME_UPDATE_INTERVAL=5000
VITE_MAX_WATCHLIST_ITEMS=50
VITE_MAX_ALERTS_PER_USER=20
```

3. **Restart your development server**:
```bash
npm run dev
```

## 📊 Data Sources

The application uses multiple APIs with fallback mechanisms:

1. **Financial Modeling Prep** (Primary)
   - Real-time quotes
   - Market data
   - Company profiles
   - Gainers/Losers lists

2. **Yahoo Finance** (Free Alternative)
   - Real-time quotes via CORS proxy
   - No API key required
   - Comprehensive market data

3. **Alpha Vantage** (Backup)
   - Global quotes
   - Technical indicators

4. **Finnhub** (Backup)
   - Real-time quotes
   - Company profiles

## 🎯 Features Enabled with Real APIs

### With API Keys:
- ✅ **Real-time stock prices**
- ✅ **Live market data**
- ✅ **Actual company information**
- ✅ **Real gainers/losers**
- ✅ **Live news feeds**
- ✅ **Accurate market caps and P/E ratios**

### Without API Keys (Current):
- ✅ **Mock data with realistic values**
- ✅ **All filtering and sorting features**
- ✅ **Chart functionality**
- ✅ **Watchlist and alerts**
- ✅ **User authentication**

## 🔧 Troubleshooting

### Common Issues:

1. **"401 Unauthorized" errors**
   - Check your API keys are correct
   - Verify you haven't exceeded rate limits
   - Ensure the API key is properly set in `.env`

2. **CORS errors with Yahoo Finance**
   - The app uses a CORS proxy (allorigins.win)
   - This is normal and expected

3. **Rate limit exceeded**
   - Wait for the limit to reset
   - Consider upgrading to a paid plan
   - The app will fall back to other APIs or mock data

### Testing Your Setup:

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Look for API success messages
4. Check for any error messages

## 💡 Pro Tips

1. **Start with Financial Modeling Prep** - It has the best free tier
2. **Add Alpha Vantage as backup** - Provides redundancy
3. **Monitor your usage** - Free tiers have limits
4. **Consider paid plans** for production use

## 📈 Data Coverage

The app supports:
- **US Stocks**: NYSE, NASDAQ
- **ETFs**: SPY, QQQ, IWM, VTI, ARKK, etc.
- **Cryptocurrencies**: BTC, ETH, ADA, SOL, etc.
- **Indices**: S&P 500, NASDAQ, Dow Jones
- **International**: Limited support via APIs

## 🚀 Next Steps

1. Set up at least one API key
2. Test the application
3. Monitor data quality
4. Consider upgrading to paid plans for production
5. Add more data sources as needed

---

**Note**: The application will work perfectly with mock data if you prefer not to set up APIs immediately. All features are fully functional with realistic simulated data.
