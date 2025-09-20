import heroImage from "@/assets/hero-financial.jpg";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { ArrowRight, BarChart3, Bell, Globe, Star, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    // Only redirect if we're not loading and user exists
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Track Every{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Market Move
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Comprehensive financial analysis platform for stocks, ETFs, indices, and cryptocurrencies. 
                  Get real-time data, set alerts, and make informed decisions.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow transition-all"
                  onClick={handleGetStarted}
                >
                  Start Tracking
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-border/50 hover:border-primary/50"
                  onClick={handleGetStarted}
                >
                  View Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Global Markets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span>Smart Alerts</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-intense">
                <img 
                  src={heroImage} 
                  alt="Financial dashboard showing stock charts and market data"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-3xl transform scale-105"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Track Markets</h2>
            <p className="text-lg text-muted-foreground">Powerful tools for serious traders and investors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all group">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/30 transition-colors">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">Real-Time Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor stocks, ETFs, indices, and crypto with live price updates and interactive charts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all group">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/30 transition-colors">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Watchlists</h3>
                <p className="text-muted-foreground">
                  Create personalized watchlists and get instant alerts when your targets hit key levels.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all group">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/30 transition-colors">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Deep financial analysis with PE ratios, market cap, ROE, and comprehensive market insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Track Like a Pro?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of traders making smarter decisions with TICKERTRAKER
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-intense transition-all"
            onClick={handleGetStarted}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
