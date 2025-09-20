# TickerTracker - Real-Time Financial Market Tracker

A comprehensive, real-time financial market tracking application built with React, TypeScript, and Supabase. Track stocks, ETFs, cryptocurrencies, and market indices with live data, smart alerts, and advanced analytics.

## 🚀 Features

### Authentication & User Management
- **Secure Authentication**: Email/password signup and login with Supabase Auth
- **Optional Phone Numbers**: Add phone numbers during signup for enhanced security
- **Password Validation**: Strong password requirements with real-time validation
- **Session Management**: Persistent login sessions with automatic token refresh

### Real-Time Market Data
- **Live Price Updates**: Real-time stock, ETF, crypto, and index prices
- **Multiple API Support**: Integration with Alpha Vantage, Finnhub, Polygon, and Financial Modeling Prep
- **Auto-Refresh**: Automatic data updates every 30 seconds
- **Market Overview**: Live market indices and sector performance
- **Comprehensive Search**: Search across all available tickers with real-time results

### Advanced Analytics
- **Interactive Charts**: 30-day price charts with trend analysis
- **Financial Metrics**: P/E ratios, market cap, volume, and 52-week highs/lows
- **Top Movers**: Real-time identification of biggest gainers and losers
- **Sector Analysis**: Live sector performance tracking

### Smart Features
- **Personal Watchlists**: Add/remove tickers from your personal watchlist
- **Price Alerts**: Set custom price alerts for any ticker
- **News Integration**: Real-time financial news with sentiment analysis
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Hook Form** with Zod validation
- **Zustand** for state management
- **React Query** for data fetching and caching

### Backend & Services
- **Supabase** for authentication and database
- **Multiple Financial APIs**:
  - Alpha Vantage
  - Finnhub
  - Polygon
  - Financial Modeling Prep
  - News API

### Development Tools
- **ESLint** for code linting
- **TypeScript** for type safety
- **PostCSS** for CSS processing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fin-vue-nexus
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   # Financial Data APIs
   VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   VITE_YAHOO_FINANCE_API_KEY=your_yahoo_finance_api_key_here
   VITE_FINNHUB_API_KEY=your_finnhub_api_key_here
   VITE_POLYGON_API_KEY=your_polygon_api_key_here

   # News APIs
   VITE_NEWS_API_KEY=your_news_api_key_here
   VITE_FINANCIAL_MODELING_PREP_API_KEY=your_fmp_api_key_here

   # Supabase Configuration
   VITE_SUPABASE_URL=https://ggkppcgntudijqioavht.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # App Configuration
   VITE_APP_NAME=TickerTracker
   VITE_APP_VERSION=1.0.0
   VITE_REAL_TIME_UPDATE_INTERVAL=5000
   VITE_MAX_WATCHLIST_ITEMS=50
   VITE_MAX_ALERTS_PER_USER=20
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 API Keys Setup

### Required APIs for Full Functionality

1. **Alpha Vantage** (Free tier available)
   - Sign up at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Get your free API key
   - Add to `VITE_ALPHA_VANTAGE_API_KEY`

2. **Finnhub** (Free tier available)
   - Sign up at [Finnhub](https://finnhub.io/register)
   - Get your free API key
   - Add to `VITE_FINNHUB_API_KEY`

3. **Financial Modeling Prep** (Free tier available)
   - Sign up at [Financial Modeling Prep](https://financialmodelingprep.com/developer/docs)
   - Get your free API key
   - Add to `VITE_FINANCIAL_MODELING_PREP_API_KEY`

4. **News API** (Free tier available)
   - Sign up at [News API](https://newsapi.org/register)
   - Get your free API key
   - Add to `VITE_NEWS_API_KEY`

### Optional APIs for Enhanced Features

- **Polygon.io** - For more comprehensive market data
- **Yahoo Finance API** - Alternative data source

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── ui/              # Base UI components (Radix UI)
│   ├── Header.tsx       # Main navigation header
│   ├── MarketOverview.tsx
│   ├── NewsPanel.tsx
│   ├── SearchResults.tsx
│   ├── TradingCard.tsx
│   └── Watchlist.tsx
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase configuration
├── lib/                 # Utility functions
├── pages/               # Page components
│   ├── Auth.tsx         # Authentication page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Index.tsx        # Landing page
│   ├── TickerDetail.tsx # Individual ticker page
│   └── NotFound.tsx
├── services/            # API services
│   └── financialDataService.ts
├── stores/              # State management
│   ├── useAuthStore.ts  # Authentication state
│   └── useTickerStore.ts # Market data state
└── App.tsx              # Main app component
```

## 🎯 Key Features Explained

### Real-Time Data Updates
The application automatically refreshes market data every 30 seconds using multiple API sources for reliability. If one API fails, it falls back to others.

### Smart Search
The search functionality queries multiple APIs and provides real-time results as you type, with loading states and error handling.

### Authentication Flow
- New users can sign up with email and password
- Optional phone number for enhanced security
- Strong password validation with real-time feedback
- Automatic session management with Supabase

### Responsive Design
The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

### Other Platforms
The app can be deployed to any platform that supports static React applications.

## 🔧 Customization

### Adding New APIs
1. Add API key to `.env` file
2. Update `financialDataService.ts` with new API integration
3. Add fallback logic for reliability

### Styling
The app uses Tailwind CSS with custom CSS variables. Modify `src/index.css` for global styles and component-specific styles in individual files.

### Features
- Add new ticker types in `useTickerStore.ts`
- Extend authentication in `useAuthStore.ts`
- Add new chart types in `TickerDetail.tsx`

## 📱 Mobile App
This is a web application that works great on mobile browsers. For a native mobile app, consider:
- React Native
- Capacitor
- PWA (Progressive Web App) features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your API keys are correct
3. Ensure all dependencies are installed
4. Check the network tab for API call failures

## 🔮 Future Enhancements

- [ ] Real-time WebSocket connections
- [ ] Advanced charting with TradingView
- [ ] Portfolio tracking
- [ ] Social features and sharing
- [ ] Mobile app
- [ ] Dark/light theme toggle
- [ ] More advanced analytics
- [ ] AI-powered insights
- [ ] Push notifications for alerts
- [ ] Export data functionality

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for authentication and backend services
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Lucide React](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- All the financial data API providers

---

**Happy Trading! 📈**