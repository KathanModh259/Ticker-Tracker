import AdvancedFilters from "@/components/AdvancedFilters";
import Header from "@/components/Header";
import MarketOverview from "@/components/MarketOverview";
import NewsPanel from "@/components/NewsPanel";
import PortfolioTracker from "@/components/PortfolioTracker";
import { RealTimeTest } from "@/components/RealTimeTest";
import TradingCard from "@/components/TradingCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Watchlist from "@/components/Watchlist";
import { useTickerStore } from "@/stores/useTickerStore";
import { checkEnvVars, testApiKeys } from "@/utils/apiTest";
import { Activity, BarChart3, DollarSign, Loader2, RefreshCw, TestTube, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { 
    tickers, 
    loading, 
    loadPopularTickers, 
    refreshAllTickers, 
    lastUpdate,
    selectedSector,
    filteredTickers,
    setSelectedSector,
    selectedMarket,
    getMarketTickers
  } = useTickerStore();
  
  const [testingApis, setTestingApis] = useState(false);

  // Load popular tickers on component mount
  useEffect(() => {
    loadPopularTickers();
  }, [loadPopularTickers]);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllTickers();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshAllTickers]);
  
  // Filter for top movers (highest absolute percentage change)
  const displayTickers = selectedSector ? filteredTickers() : getMarketTickers();
  const topMovers = [...displayTickers]
    .sort((a, b) => {
      const aPercent = Math.abs(parseFloat(a.changePercent.replace('%', '')));
      const bPercent = Math.abs(parseFloat(b.changePercent.replace('%', '')));
      return bPercent - aPercent;
    })
    .slice(0, 6);

  // Debug logging
  console.log('📊 Dashboard state:', {
    tickersCount: tickers.length,
    displayTickersCount: displayTickers.length,
    topMoversCount: topMovers.length,
    loading,
    selectedSector
  });

  const marketStats = [
    { label: "Total Market Cap", value: "$45.2T", change: "+1.2%", icon: DollarSign, positive: true },
    { label: "Volume (24h)", value: "$892B", change: "+5.7%", icon: BarChart3, positive: true },
    { label: "Active Traders", value: "2.4M", change: "+12.3%", icon: Activity, positive: true },
  ];

  const handleRefresh = () => {
    refreshAllTickers();
  };

  const handleTestApis = async () => {
    setTestingApis(true);
    console.log('🧪 Starting API Test...');
    
    // Check environment variables first
    checkEnvVars();
    
    // Test APIs
    const success = await testApiKeys();
    
    if (success) {
      console.log('🎉 API test completed successfully!');
    } else {
      console.log('⚠️ API test completed with issues. Check console for details.');
    }
    
    setTestingApis(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side (70%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketStats.map((stat) => (
                <Card key={stat.label} className="bg-gradient-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className={`text-sm ${stat.positive ? 'text-bullish' : 'text-bearish'}`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.positive ? 'bg-bullish/20' : 'bg-bearish/20'}`}>
                        <stat.icon className={`h-6 w-6 ${stat.positive ? 'text-bullish' : 'text-bearish'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Market Overview */}
            <MarketOverview />
            <RealTimeTest />

                {/* Top Movers */}
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span>
                        {selectedSector ? `${selectedSector} Top Movers` : 'Top Movers'}
                      </span>
                      {lastUpdate && (
                        <span className="text-xs text-muted-foreground">
                          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <AdvancedFilters />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestApis}
                        disabled={testingApis}
                        className="h-8 text-xs"
                      >
                        {testingApis ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <TestTube className="h-3 w-3 mr-1" />
                        )}
                        Test APIs
                      </Button>
                      {selectedSector && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSector(null)}
                          className="h-8 text-xs"
                        >
                          Show All
                        </Button>
                      )}
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
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="border-bullish/50 text-bullish">Gainers</Badge>
                        <Badge variant="outline" className="border-bearish/50 text-bearish">Losers</Badge>
                      </div>
                    </div>
                  </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading market data...</span>
                  </div>
                ) : topMovers.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tickers available</h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedSector 
                        ? `No tickers found for ${selectedSector} sector.` 
                        : 'Unable to load market data. Please check your API keys or try again later.'
                      }
                    </p>
                    <Button onClick={handleRefresh} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {topMovers.map((ticker) => (
                      <TradingCard 
                        key={ticker.symbol} 
                        symbol={ticker.symbol}
                        name={ticker.name}
                        price={ticker.price}
                        change={ticker.change}
                        changePercent={ticker.changePercent}
                        isPositive={ticker.isPositive}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side (30%) */}
          <div className="lg:col-span-1 space-y-6">
            <PortfolioTracker />
            <Watchlist />
            <NewsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;