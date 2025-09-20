import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTickerStore } from "@/stores/useTickerStore";
import { Loader2, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchResults = () => {
  const { searchQuery, addToWatchlist, isInWatchlist, setSelectedTicker, searchTickers, loading } = useTickerStore();
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (searchQuery.trim()) {
      const performSearch = async () => {
        const searchResults = await searchTickers(searchQuery);
        setResults(searchResults);
      };
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, searchTickers]);
  
  if (!searchQuery.trim()) return null;
  
  const handleTickerClick = (ticker: any) => {
    setSelectedTicker(ticker);
    navigate(`/ticker/${ticker.symbol}`);
  };
  
  const handleAddToWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    addToWatchlist(symbol);
  };

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 bg-card border-border/50 shadow-card z-50 max-h-96 overflow-y-auto">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-3">
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            `${results.length} results for "${searchQuery}"`
          )}
        </div>
        
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Searching for tickers...</p>
            </div>
          ) : (
            results.slice(0, 10).map((ticker) => (
            <div 
              key={ticker.symbol}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => handleTickerClick(ticker)}
            >
              <div className="flex items-center space-x-3">
                <div>
                  <div className="font-semibold">{ticker.symbol}</div>
                  <div className="text-sm text-muted-foreground truncate">{ticker.name}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {ticker.type.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-semibold">{ticker.price}</div>
                  <div className={`text-sm ${ticker.isPositive ? 'text-bullish' : 'text-bearish'}`}>
                    {ticker.changePercent}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleAddToWatchlist(e, ticker.symbol)}
                  disabled={isInWatchlist(ticker.symbol)}
                  className="h-8 w-8 p-0"
                >
                  {isInWatchlist(ticker.symbol) ? (
                    <Star className="h-4 w-4 text-primary fill-primary" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResults;