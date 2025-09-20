import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterOptions, useTickerStore } from "@/stores/useTickerStore";
import { Filter, RotateCcw, X } from "lucide-react";
import { useState } from "react";

const AdvancedFilters = () => {
  const { filters, setFilters, resetFilters, tickers } = useTickerStore();
  const [isOpen, setIsOpen] = useState(false);

  // Get unique values for dropdowns
  const exchanges = [...new Set(tickers.map(t => t.exchange))].sort();
  const sectors = [...new Set(tickers.map(t => t.sector).filter(Boolean))].sort();
  const countries = [...new Set(tickers.map(t => t.country).filter(Boolean))].sort();
  const types = ['stock', 'etf', 'crypto', 'index'] as const;

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters({ [key]: value });
  };

  const handleArrayFilterChange = (key: 'types' | 'exchanges' | 'sectors' | 'countries', value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    if (checked) {
      handleFilterChange(key, [...currentArray, value]);
    } else {
      handleFilterChange(key, currentArray.filter(item => item !== value));
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.minPrice !== null || filters.maxPrice !== null) count++;
    if (filters.minMarketCap !== null || filters.maxMarketCap !== null || filters.marketCapRange !== 'all') count++;
    if (filters.minVolume !== null || filters.maxVolume !== null) count++;
    if (filters.minChangePercent !== null || filters.maxChangePercent !== null || filters.changeDirection !== 'all') count++;
    if (filters.types.length < 4) count++;
    if (filters.exchanges.length > 0) count++;
    if (filters.sectors.length > 0) count++;
    if (filters.countries.length > 0) count++;
    if (filters.minPE !== null || filters.maxPE !== null) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-12 left-0 z-50 w-96 max-h-96 overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 px-2"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Filter Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Filters</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    changeDirection: 'gainers',
                    types: ['stock'],
                    marketCapRange: 'large'
                  })}
                  className="h-8 text-xs"
                >
                  Top Gainers
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    changeDirection: 'losers',
                    types: ['stock'],
                    marketCapRange: 'large'
                  })}
                  className="h-8 text-xs"
                >
                  Top Losers
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    types: ['crypto'],
                    changeDirection: 'all'
                  })}
                  className="h-8 text-xs"
                >
                  Crypto Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    types: ['etf'],
                    changeDirection: 'all'
                  })}
                  className="h-8 text-xs"
                >
                  ETFs Only
                </Button>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Price Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min Price</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Price</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Market Cap Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Market Cap Range</Label>
              <Select
                value={filters.marketCapRange}
                onValueChange={(value: any) => handleFilterChange('marketCapRange', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="micro">Micro ($0 - $300M)</SelectItem>
                  <SelectItem value="small">Small ($300M - $2B)</SelectItem>
                  <SelectItem value="mid">Mid ($2B - $10B)</SelectItem>
                  <SelectItem value="large">Large ($10B - $200B)</SelectItem>
                  <SelectItem value="mega">Mega ($200B+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Change Direction */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Change Direction</Label>
              <Select
                value={filters.changeDirection}
                onValueChange={(value: any) => handleFilterChange('changeDirection', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="gainers">Gainers Only</SelectItem>
                  <SelectItem value="losers">Losers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Change Percentage Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Change Percentage Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min Change %</Label>
                  <Input
                    type="number"
                    placeholder="-50"
                    value={filters.minChangePercent || ''}
                    onChange={(e) => handleFilterChange('minChangePercent', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Change %</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={filters.maxChangePercent || ''}
                    onChange={(e) => handleFilterChange('maxChangePercent', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Volume Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Volume Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min Volume</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minVolume || ''}
                    onChange={(e) => handleFilterChange('minVolume', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Volume</Label>
                  <Input
                    type="number"
                    placeholder="1000000000"
                    value={filters.maxVolume || ''}
                    onChange={(e) => handleFilterChange('maxVolume', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* PE Ratio Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">PE Ratio Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min PE</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minPE || ''}
                    onChange={(e) => handleFilterChange('minPE', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max PE</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={filters.maxPE || ''}
                    onChange={(e) => handleFilterChange('maxPE', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Types */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Asset Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {types.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={filters.types.includes(type)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('types', type, checked as boolean)
                      }
                    />
                    <Label htmlFor={type} className="text-xs capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchanges */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Exchanges</Label>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {exchanges.map((exchange) => (
                  <div key={exchange} className="flex items-center space-x-2">
                    <Checkbox
                      id={exchange}
                      checked={filters.exchanges.includes(exchange)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('exchanges', exchange, checked as boolean)
                      }
                    />
                    <Label htmlFor={exchange} className="text-xs">
                      {exchange}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sectors */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sectors</Label>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {sectors.map((sector) => (
                  <div key={sector} className="flex items-center space-x-2">
                    <Checkbox
                      id={sector}
                      checked={filters.sectors.includes(sector)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('sectors', sector, checked as boolean)
                      }
                    />
                    <Label htmlFor={sector} className="text-xs">
                      {sector}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Countries</Label>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {countries.map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={country}
                      checked={filters.countries.includes(country)}
                      onCheckedChange={(checked) => 
                        handleArrayFilterChange('countries', country, checked as boolean)
                      }
                    />
                    <Label htmlFor={country} className="text-xs">
                      {country}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sort By</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="change">Change</SelectItem>
                    <SelectItem value="changePercent">Change %</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="marketCap">Market Cap</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="symbol">Symbol</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: any) => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedFilters;
