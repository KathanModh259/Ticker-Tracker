import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/useAuthStore";
import { MarketType, useTickerStore } from "@/stores/useTickerStore";
import { Globe, LogOut, Search, Settings, TrendingUp, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import SearchResults from "./SearchResults";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const { searchQuery, setSearchQuery, selectedMarket, setSelectedMarket } = useTickerStore();
  const { user, signOut } = useAuthStore();
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const marketOptions: { value: MarketType; label: string; flag: string }[] = [
    { value: 'us', label: 'US Stock Market', flag: '🇺🇸' },
    { value: 'indian', label: 'Indian Stock Market', flag: '🇮🇳' },
    { value: 'crypto', label: 'Crypto Market', flag: '₿' },
    { value: 'european', label: 'European Market', flag: '🇪🇺' },
    { value: 'asian', label: 'Asian Market', flag: '🌏' },
    { value: 'all', label: 'All Markets', flag: '🌍' }
  ];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(value.trim().length > 0);
  };
  
  const handleLogoClick = () => {
    navigate('/');
  };
  
  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={handleLogoClick}
          >
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TICKERTRAKER
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search stocks, ETFs, crypto..." 
              className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery.trim().length > 0 && setShowResults(true)}
            />
            {showResults && <SearchResults />}
          </div>
        </div>

            {/* Market Selection */}
            <div className="flex items-center space-x-2">
              <Select value={selectedMarket} onValueChange={(value: MarketType) => setSelectedMarket(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Market" />
                </SelectTrigger>
                <SelectContent>
                  {marketOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center space-x-2">
                        <span>{option.flag}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDashboardClick}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                <Globe className="h-4 w-4 mr-2" />
                Dashboard
              </Button>

              <NotificationPanel />

              <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                  {user.phone && (
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleAuthClick}>
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;