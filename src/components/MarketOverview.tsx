import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { financialDataService, MarketData } from "@/services/financialDataService";
import { useTickerStore } from "@/stores/useTickerStore";
import { Activity, ChevronDown, ChevronRight, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MarketOverview = () => {
  const [indices, setIndices] = useState<MarketData[]>([]);
  const [sectors, setSectors] = useState<{ name: string; change: number; changePercent: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [sectorLoading, setSectorLoading] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  
  const { 
    selectedSector, 
    setSelectedSector, 
    getSectorTickers, 
    loadSectorTickers,
    getAvailableSectors,
    setSelectedTicker
  } = useTickerStore();

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoading(true);
        const data = await financialDataService.getMarketOverview();
        setIndices(data.indices);
        setSectors(data.sectors);
      } catch (error) {
        console.error('Error loading market overview:', error);
        // Fallback to mock data
        setIndices([
          { symbol: "^GSPC", name: "S&P 500", price: 4156.83, change: 24.32, changePercent: 0.59, volume: 0, open: 4132.51, previousClose: 4132.51, timestamp: new Date().toISOString() },
          { symbol: "^IXIC", name: "NASDAQ", price: 12764.73, change: -45.67, changePercent: -0.36, volume: 0, open: 12810.40, previousClose: 12810.40, timestamp: new Date().toISOString() },
          { symbol: "^DJI", name: "DOW JONES", price: 33127.28, change: 127.89, changePercent: 0.39, volume: 0, open: 32999.39, previousClose: 32999.39, timestamp: new Date().toISOString() },
          { symbol: "^NSEI", name: "NIFTY 50", price: 19443.50, change: 89.25, changePercent: 0.46, volume: 0, open: 19354.25, previousClose: 19354.25, timestamp: new Date().toISOString() }
        ]);
        setSectors([
          { name: "Technology", change: 1.2, changePercent: 0.8 },
          { name: "Healthcare", change: 0.8, changePercent: 0.6 },
          { name: "Financials", change: -0.3, changePercent: -0.2 },
          { name: "Energy", change: 2.1, changePercent: 1.5 },
          { name: "Consumer Discretionary", change: 0.5, changePercent: 0.3 },
          { name: "Consumer Staples", change: -0.1, changePercent: -0.1 },
          { name: "Cryptocurrency", change: 3.2, changePercent: 2.1 },
          { name: "ETF", change: 0.6, changePercent: 0.4 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
  }, []);

  const handleSectorClick = (sectorName: string) => {
    setSelectedSector(sectorName);
  };

  const handleTickerClick = (ticker: any) => {
    setSelectedTicker(ticker);
    navigate(`/ticker/${ticker.symbol}`);
  };

  const handleSectorExpand = async (sectorName: string) => {
    const isExpanded = expandedSectors.has(sectorName);
    
    if (isExpanded) {
      // Collapse sector
      setExpandedSectors(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectorName);
        return newSet;
      });
    } else {
      // Expand sector and load tickers
      setExpandedSectors(prev => new Set(prev).add(sectorName));
      
      // Check if we already have tickers for this sector
      const existingTickers = getSectorTickers(sectorName);
      if (existingTickers.length === 0) {
        setSectorLoading(prev => new Set(prev).add(sectorName));
        await loadSectorTickers(sectorName);
        setSectorLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(sectorName);
          return newSet;
        });
      }
    }
  };

  const clearSectorFilter = () => {
    setSelectedSector(null);
  };

  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Market Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {indices.map((index) => (
                <div key={index.symbol} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{index.name}</span>
                    {index.change >= 0 ? 
                      <TrendingUp className="h-4 w-4 text-bullish" /> : 
                      <TrendingDown className="h-4 w-4 text-bearish" />
                    }
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold">{index.price.toLocaleString()}</div>
                    <div className={`text-sm ${index.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                      {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector Performance */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sector Performance</CardTitle>
            {selectedSector && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSectorFilter}
                className="text-xs"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sectors.map((sector) => {
              const isExpanded = expandedSectors.has(sector.name);
              const isSelected = selectedSector === sector.name;
              const isLoading = sectorLoading.has(sector.name);
              const sectorTickers = getSectorTickers(sector.name);

              return (
                <div key={sector.name} className="border border-border/30 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                      <Collapsible 
                        open={isExpanded} 
                        onOpenChange={() => handleSectorExpand(sector.name)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                      
                      <Button
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleSectorClick(sector.name)}
                        className="text-left justify-start"
                      >
                        <span className="font-medium">{sector.name}</span>
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={`border-border/50 ${
                          sector.change >= 0 ? 'hover:border-bullish/50' : 'hover:border-bearish/50'
                        }`}
                      >
                        <span className={sector.change >= 0 ? 'text-bullish' : 'text-bearish'}>
                          {sector.change >= 0 ? '+' : ''}{sector.changePercent.toFixed(1)}%
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <Collapsible open={isExpanded}>
                    <CollapsibleContent>
                      <div className="px-3 pb-3">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Loading {sector.name} tickers...</span>
                          </div>
                        ) : sectorTickers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sectorTickers.slice(0, 6).map((ticker) => (
                              <div 
                                key={ticker.symbol} 
                                className="p-2 rounded bg-muted/20 border border-border/20 hover:bg-muted/40 hover:border-primary/50 cursor-pointer transition-all duration-200 group"
                                onClick={() => handleTickerClick(ticker)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-sm group-hover:text-primary transition-colors">{ticker.symbol}</div>
                                    <div className="text-xs text-muted-foreground truncate">{ticker.name}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium">{ticker.price}</div>
                                    <div className={`text-xs ${ticker.isPositive ? 'text-bullish' : 'text-bearish'}`}>
                                      {ticker.changePercent}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {sectorTickers.length > 6 && (
                              <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                                +{sectorTickers.length - 6} more tickers
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No tickers available for {sector.name}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverview;