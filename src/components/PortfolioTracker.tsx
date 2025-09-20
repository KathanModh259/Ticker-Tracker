import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTickerStore } from "@/stores/useTickerStore";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface PortfolioItem {
  id: string;
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

const PortfolioTracker = () => {
  const { tickers } = useTickerStore();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    symbol: '',
    shares: 0,
    avgPrice: 0
  });

  const addToPortfolio = () => {
    const ticker = tickers.find(t => t.symbol === newItem.symbol);
    if (!ticker) return;

    const currentPrice = parseFloat(ticker.price.replace(/[$,]/g, ''));
    const totalValue = newItem.shares * currentPrice;
    const totalCost = newItem.shares * newItem.avgPrice;
    const gainLoss = totalValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;

    const portfolioItem: PortfolioItem = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: newItem.symbol,
      shares: newItem.shares,
      avgPrice: newItem.avgPrice,
      currentPrice,
      totalValue,
      gainLoss,
      gainLossPercent
    };

    setPortfolio(prev => [...prev, portfolioItem]);
    setNewItem({ symbol: '', shares: 0, avgPrice: 0 });
    setIsAddDialogOpen(false);
  };

  const removeFromPortfolio = (id: string) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
  };

  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const totalGainLoss = portfolio.reduce((sum, item) => sum + item.gainLoss, 0);
  const totalGainLossPercent = totalPortfolioValue > 0 ? (totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100 : 0;

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Portfolio Tracker</span>
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Position</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., AAPL"
                    value={newItem.symbol}
                    onChange={(e) => setNewItem(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div>
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    placeholder="Number of shares"
                    value={newItem.shares}
                    onChange={(e) => setNewItem(prev => ({ ...prev, shares: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="avgPrice">Average Price</Label>
                  <Input
                    id="avgPrice"
                    type="number"
                    placeholder="Average purchase price"
                    value={newItem.avgPrice}
                    onChange={(e) => setNewItem(prev => ({ ...prev, avgPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <Button onClick={addToPortfolio} className="w-full">
                  Add to Portfolio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No positions in your portfolio</p>
            <p className="text-sm">Add your first position to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total P&L</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Total Return</div>
              </div>
            </div>

            {/* Portfolio Items */}
            <div className="space-y-2">
              {portfolio.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.shares} shares @ ${item.avgPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">${item.totalValue.toLocaleString()}</div>
                      <div className={`text-sm ${item.gainLoss >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                        {item.gainLoss >= 0 ? '+' : ''}${item.gainLoss.toFixed(2)} ({item.gainLossPercent >= 0 ? '+' : ''}{item.gainLossPercent.toFixed(2)}%)
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromPortfolio(item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioTracker;
