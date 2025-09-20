import { useState } from "react";
import { sendAlertMail } from "@/lib/mailSender";
import { useTickerStore } from "@/stores/useTickerStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: {
    symbol: string;
    name: string;
    price: string;
  } | null;
}

const AlertModal = ({ isOpen, onClose, ticker }: AlertModalProps) => {
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const { addAlert } = useTickerStore();
  const { toast } = useToast();
  
  if (!ticker) return null;
  
  const currentPrice = parseFloat(ticker.price.replace(/[$,]/g, ''));
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetPrice);
    if (isNaN(target) || target <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid target price.",
        variant: "destructive"
      });
      return;
    }
    addAlert(ticker.symbol, target, direction);
    // Send alert email (replace with real user email in production)
    await sendAlertMail({
      to: "user@example.com", // TODO: Replace with actual user email
      subject: `Price Alert for ${ticker.symbol}`,
      text: `An alert was set for ${ticker.symbol} to notify when price goes ${direction} $${target.toFixed(2)}.`,
      html: `<p>An alert was set for <b>${ticker.symbol}</b> to notify when price goes <b>${direction}</b> <b>$${target.toFixed(2)}</b>.</p>`
    });
    toast({
      title: "Alert Created",
      description: `You'll be notified when ${ticker.symbol} goes ${direction} $${target.toFixed(2)}`,
    });
    setTargetPrice("");
    setDirection("above");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>Set Price Alert</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <div className="font-semibold">{ticker.symbol}</div>
                <div className="text-sm text-muted-foreground">{ticker.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{ticker.price}</div>
                <Badge variant="outline" className="text-xs">Current Price</Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="targetPrice">Target Price</Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              placeholder="Enter target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="bg-muted/50"
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label>Alert Condition</Label>
            <RadioGroup value={direction} onValueChange={(value: "above" | "below") => setDirection(value)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:bg-muted/20">
                <RadioGroupItem value="above" id="above" />
                <Label htmlFor="above" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <TrendingUp className="h-4 w-4 text-bullish" />
                  <span>Alert when price goes above target</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:bg-muted/20">
                <RadioGroupItem value="below" id="below" />
                <Label htmlFor="below" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <TrendingDown className="h-4 w-4 text-bearish" />
                  <span>Alert when price goes below target</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {targetPrice && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-sm">
                <strong>Alert Preview:</strong> You'll be notified when {ticker.symbol} 
                {direction === "above" ? " rises above" : " falls below"} ${parseFloat(targetPrice).toFixed(2)}
                {targetPrice && (
                  <span className={`ml-2 ${
                    direction === "above" 
                      ? parseFloat(targetPrice) > currentPrice ? "text-bullish" : "text-muted-foreground"
                      : parseFloat(targetPrice) < currentPrice ? "text-bearish" : "text-muted-foreground"
                  }`}>
                    ({direction === "above" && parseFloat(targetPrice) > currentPrice ? "↗" : 
                      direction === "below" && parseFloat(targetPrice) < currentPrice ? "↘" : "—"} 
                    {Math.abs(((parseFloat(targetPrice) - currentPrice) / currentPrice) * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Create Alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AlertModal;