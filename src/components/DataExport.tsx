import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTickerStore } from "@/stores/useTickerStore";
import { BarChart3, Download, FileText, Table } from "lucide-react";
import { toast } from "sonner";

const DataExport = () => {
  const { tickers, watchlist, alerts } = useTickerStore();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${data.length} records to ${filename}`);
  };

  const exportToJSON = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${data.length} records to ${filename}`);
  };

  const exportTickers = () => {
    const tickerData = tickers.map(ticker => ({
      symbol: ticker.symbol,
      name: ticker.name,
      price: ticker.price,
      change: ticker.change,
      changePercent: ticker.changePercent,
      exchange: ticker.exchange,
      type: ticker.type,
      sector: ticker.sector || 'N/A',
      marketCap: ticker.marketCap || 'N/A',
      volume: ticker.volume || 'N/A',
      pe: ticker.pe || 'N/A',
      lastUpdated: ticker.lastUpdated || 'N/A'
    }));
    
    exportToCSV(tickerData, `tickers_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportWatchlist = () => {
    const watchlistData = watchlist.map(symbol => {
      const ticker = tickers.find(t => t.symbol === symbol);
      return {
        symbol,
        name: ticker?.name || 'N/A',
        price: ticker?.price || 'N/A',
        change: ticker?.change || 'N/A',
        changePercent: ticker?.changePercent || 'N/A',
        sector: ticker?.sector || 'N/A',
        addedDate: new Date().toISOString().split('T')[0]
      };
    });
    
    exportToCSV(watchlistData, `watchlist_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportAlerts = () => {
    const alertData = alerts.map(alert => ({
      symbol: alert.symbol,
      targetPrice: alert.targetPrice,
      currentPrice: alert.currentPrice,
      direction: alert.direction,
      isActive: alert.isActive,
      createdAt: alert.createdAt.toISOString().split('T')[0]
    }));
    
    exportToCSV(alertData, `alerts_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportAllData = () => {
    const allData = {
      exportDate: new Date().toISOString(),
      tickers: tickers.map(ticker => ({
        symbol: ticker.symbol,
        name: ticker.name,
        price: ticker.price,
        change: ticker.change,
        changePercent: ticker.changePercent,
        exchange: ticker.exchange,
        type: ticker.type,
        sector: ticker.sector || 'N/A',
        marketCap: ticker.marketCap || 'N/A',
        volume: ticker.volume || 'N/A',
        pe: ticker.pe || 'N/A',
        lastUpdated: ticker.lastUpdated || 'N/A'
      })),
      watchlist: watchlist.map(symbol => {
        const ticker = tickers.find(t => t.symbol === symbol);
        return {
          symbol,
          name: ticker?.name || 'N/A',
          price: ticker?.price || 'N/A',
          change: ticker?.change || 'N/A',
          changePercent: ticker?.changePercent || 'N/A',
          sector: ticker?.sector || 'N/A'
        };
      }),
      alerts: alerts.map(alert => ({
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        currentPrice: alert.currentPrice,
        direction: alert.direction,
        isActive: alert.isActive,
        createdAt: alert.createdAt.toISOString()
      }))
    };
    
    exportToJSON([allData], `tickertracker_data_${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5 text-primary" />
          <span>Data Export</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your data in various formats for analysis or backup purposes.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Table className="h-4 w-4 mr-2" />
                  Export Tickers ({tickers.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportTickers}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Watchlist ({watchlist.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportWatchlist}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Alerts ({alerts.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportAlerts}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="default" 
              className="w-full"
              onClick={exportAllData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Data (JSON)
            </Button>
          </div>

          <div className="pt-4 border-t border-border/30">
            <h4 className="text-sm font-medium mb-2">Export Summary</h4>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="text-center p-2 bg-muted/20 rounded">
                <div className="font-medium">{tickers.length}</div>
                <div>Tickers</div>
              </div>
              <div className="text-center p-2 bg-muted/20 rounded">
                <div className="font-medium">{watchlist.length}</div>
                <div>Watchlist</div>
              </div>
              <div className="text-center p-2 bg-muted/20 rounded">
                <div className="font-medium">{alerts.length}</div>
                <div>Alerts</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExport;
