import AlertModal from "@/components/AlertModal";
import Header from "@/components/Header";
import TradingViewChart from "@/components/TradingViewChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTickerStore } from "@/stores/useTickerStore";
import { ArrowLeft, Bell, Star, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TickerDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { tickers, addToWatchlist, removeFromWatchlist, isInWatchlist, getTickerAlerts } = useTickerStore();
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  const ticker = tickers.find(t => t.symbol === symbol);
  const inWatchlist = ticker ? isInWatchlist(ticker.symbol) : false;
  const alerts = ticker ? getTickerAlerts(ticker.symbol) : [];
  
  useEffect(() => {
    if (!ticker) {
      navigate('/dashboard');
    }
  }, [ticker, navigate]);
  
  if (!ticker) {
    return null;
  }

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(ticker.symbol);
    } else {
      addToWatchlist(ticker.symbol);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticker Header */}
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold">{ticker.symbol}</h1>
                        <Badge variant="outline" className="text-xs">
                          {ticker.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ticker.exchange}
                        </Badge>
                      </div>
                      <p className="text-lg text-muted-foreground">{ticker.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleWatchlistToggle}
                      className={inWatchlist ? "border-primary/50 bg-primary/10" : ""}
                    >
                      <Star className={`h-4 w-4 mr-2 ${inWatchlist ? 'text-primary fill-primary' : ''}`} />
                      {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </Button>
                    
                    <Button onClick={() => setShowAlertModal(true)} className="bg-gradient-primary">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Alert
                    </Button>
                  </div>
                </div>

                {/* Price Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-3xl font-bold">{ticker.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Change</p>
                    <p className={`text-lg font-semibold ${ticker.isPositive ? 'text-bullish' : 'text-bearish'}`}>
                      {ticker.change} ({ticker.changePercent})
                    </p>
                  </div>
                  {ticker.marketCap && (
                    <div>
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="text-lg font-semibold">{ticker.marketCap}</p>
                    </div>
                  )}
                  {ticker.volume && (
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="text-lg font-semibold">{ticker.volume}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* TradingView Chart */}
            <TradingViewChart 
              symbol={ticker.symbol}
              name={ticker.name}
              height={500}
              showVolume={true}
              timeframe="1M"
            />

            {/* Financial Metrics */}
            {ticker.type === 'stock' && (
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Financial Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {ticker.pe && (
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">P/E Ratio</p>
                        <p className="text-2xl font-bold">{ticker.pe}</p>
                      </div>
                    )}
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">52W High</p>
                      <p className="text-2xl font-bold text-bullish">${(parseFloat(ticker.price.replace(/[$,]/g, '')) * 1.25).toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">52W Low</p>
                      <p className="text-2xl font-bold text-bearish">${(parseFloat(ticker.price.replace(/[$,]/g, '')) * 0.75).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Active Alerts</span>
                  <span className="text-sm text-muted-foreground">({alerts.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>No active alerts</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowAlertModal(true)}
                      className="mt-3 border-primary/50"
                    >
                      Create Alert
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="p-3 bg-muted/20 rounded-lg border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {alert.direction === 'above' ? 
                              <TrendingUp className="h-4 w-4 text-bullish" /> : 
                              <TrendingDown className="h-4 w-4 text-bearish" />
                            }
                            <span className="font-medium">${alert.targetPrice.toFixed(2)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {alert.direction}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {alert.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">{ticker.type.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Exchange</span>
                  <span className="font-medium">{ticker.exchange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Watchlist</span>
                  <span className={inWatchlist ? "text-bullish" : "text-muted-foreground"}>
                    {inWatchlist ? "Yes" : "No"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AlertModal 
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        ticker={ticker ? { symbol: ticker.symbol, name: ticker.name, price: ticker.price } : null}
      />
    </div>
  );
};

export default TickerDetail;