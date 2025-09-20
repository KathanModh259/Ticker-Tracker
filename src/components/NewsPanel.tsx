import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialDataService, NewsItem } from "@/services/financialDataService";
import { Clock, ExternalLink, Loader2, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";

const NewsPanel = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const news = await financialDataService.getNews();
        setNewsItems(news);
      } catch (error) {
        console.error('Error loading news:', error);
        // Fallback to mock data
        setNewsItems([
          {
            id: "1",
            title: "Fed Signals Potential Rate Cut in December Meeting",
            summary: "Federal Reserve officials hint at possible interest rate reduction in upcoming meeting.",
            url: "#",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            source: "Reuters",
            sentiment: "positive"
          },
          {
            id: "2", 
            title: "Tech Stocks Rally Amid AI Investment Surge",
            summary: "Technology companies see significant gains as AI investments continue to grow.",
            url: "#",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            source: "Bloomberg",
            sentiment: "positive"
          },
          {
            id: "3",
            title: "Oil Prices Drop on Supply Concerns",
            summary: "Crude oil prices fall due to increased supply and demand worries.",
            url: "#",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            source: "CNBC",
            sentiment: "negative"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const publishedAt = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <span>Market News</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          newsItems.map((news) => {
            const timeAgo = getTimeAgo(news.publishedAt);
            return (
              <div key={news.id} className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                  </h4>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{news.source}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      news.sentiment === 'positive' 
                        ? 'border-bullish/50 text-bullish' 
                        : news.sentiment === 'negative'
                        ? 'border-bearish/50 text-bearish'
                        : 'border-muted-foreground/50 text-muted-foreground'
                    }`}
                  >
                    {news.sentiment === 'positive' ? 'Bullish' : news.sentiment === 'negative' ? 'Bearish' : 'Neutral'}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default NewsPanel;