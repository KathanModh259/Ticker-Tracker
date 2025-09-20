import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NotificationPermission, notificationService } from "@/services/notificationService";
import { AlertCircle, Bell, BellOff, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const NotificationSettings = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: false
  });
  const [settings, setSettings] = useState({
    priceAlerts: true,
    marketNews: true,
    portfolioUpdates: true,
    soundEnabled: true,
    desktopNotifications: true
  });

  useEffect(() => {
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setPermission(notificationService.getPermissionStatus());
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify({
      ...settings,
      [key]: value
    }));

    toast.success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
  };

  const testNotification = () => {
    if (!permission.granted) {
      toast.error('Please enable notifications first');
      return;
    }

    notificationService.showNotification('Test Notification', {
      body: 'This is a test notification from TickerTracker',
      icon: '/favicon.ico'
    });
  };

  const getPermissionIcon = () => {
    if (permission.granted) return <CheckCircle className="h-4 w-4 text-bullish" />;
    if (permission.denied) return <XCircle className="h-4 w-4 text-bearish" />;
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getPermissionText = () => {
    if (permission.granted) return 'Enabled';
    if (permission.denied) return 'Blocked';
    return 'Not Requested';
  };

  const getPermissionBadgeVariant = () => {
    if (permission.granted) return 'default';
    if (permission.denied) return 'destructive';
    return 'secondary';
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary" />
          <span>Notification Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-3">
              {getPermissionIcon()}
              <div>
                <div className="font-medium">Browser Notifications</div>
                <div className="text-sm text-muted-foreground">
                  {permission.granted 
                    ? 'Notifications are enabled and working'
                    : permission.denied
                    ? 'Notifications are blocked by browser'
                    : 'Click to enable notifications'
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getPermissionBadgeVariant()}>
                {getPermissionText()}
              </Badge>
              {!permission.granted && !permission.denied && (
                <Button size="sm" onClick={handleRequestPermission}>
                  Enable
                </Button>
              )}
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium">Notification Types</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="price-alerts">Price Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Get notified when prices hit your targets
                </div>
              </div>
              <Switch
                id="price-alerts"
                checked={settings.priceAlerts}
                onCheckedChange={(checked) => handleSettingChange('priceAlerts', checked)}
                disabled={!permission.granted}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="market-news">Market News</Label>
                <div className="text-sm text-muted-foreground">
                  Receive important market updates
                </div>
              </div>
              <Switch
                id="market-news"
                checked={settings.marketNews}
                onCheckedChange={(checked) => handleSettingChange('marketNews', checked)}
                disabled={!permission.granted}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="portfolio-updates">Portfolio Updates</Label>
                <div className="text-sm text-muted-foreground">
                  Get updates on your portfolio performance
                </div>
              </div>
              <Switch
                id="portfolio-updates"
                checked={settings.portfolioUpdates}
                onCheckedChange={(checked) => handleSettingChange('portfolioUpdates', checked)}
                disabled={!permission.granted}
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Additional Settings</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sound-enabled">Sound Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Play sound with notifications
                </div>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Show notifications even when app is not focused
                </div>
              </div>
              <Switch
                id="desktop-notifications"
                checked={settings.desktopNotifications}
                onCheckedChange={(checked) => handleSettingChange('desktopNotifications', checked)}
                disabled={!permission.granted}
              />
            </div>
          </div>

          {/* Test Notification */}
          <div className="pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Test Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Send a test notification to verify settings
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={testNotification}
                disabled={!permission.granted}
              >
                <Bell className="h-4 w-4 mr-2" />
                Test
              </Button>
            </div>
          </div>

          {/* Browser Support Warning */}
          {!notificationService.isSupported() && (
            <div className="p-4 bg-bearish/10 border border-bearish/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <BellOff className="h-4 w-4 text-bearish" />
                <div className="text-sm text-bearish">
                  Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Safari.
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
