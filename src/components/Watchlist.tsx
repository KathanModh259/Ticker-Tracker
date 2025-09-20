import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Plus, X, TrendingUp } from "lucide-react";
import { useTickerStore } from "@/stores/useTickerStore";
import TradingCard from "./TradingCard";

const Watchlist = () => {
  const { getWatchlistTickers, removeFromWatchlist } = useTickerStore();
  const watchlistItems = getWatchlistTickers();

  const handleRemove = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    removeFromWatchlist(symbol);
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-primary" />
            <span>My Watchlist</span>
            <span className="text-sm text-muted-foreground">({watchlistItems.length})</span>
          </div>
          <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary/10">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {watchlistItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No tickers in watchlist</p>
            <p className="text-sm">Search for stocks, ETFs, or crypto to add them here</p>
          </div>
        ) : (
          watchlistItems.map((item) => (
            <div key={item.symbol} className="relative group">
              <div className="scale-95 hover:scale-100 transition-transform">
                <TradingCard 
                  symbol={item.symbol}
                  name={item.name}
                  price={item.price}
                  change={item.change}
                  changePercent={item.changePercent}
                  isPositive={item.isPositive}
                />
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={(e) => handleRemove(e, item.symbol)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 bg-destructive/80 hover:bg-destructive text-white z-10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default Watchlist;