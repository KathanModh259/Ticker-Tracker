import DataExport from "@/components/DataExport";
import Header from "@/components/Header";
import NotificationSettings from "@/components/NotificationSettings";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UserProfile from "@/components/UserProfile";
import { Palette, Shield } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="container py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <UserProfile />
              <NotificationSettings />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <span>Appearance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Theme</div>
                        <div className="text-sm text-muted-foreground">Choose your preferred theme</div>
                      </div>
                      <ThemeToggle />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Auto-refresh Interval</div>
                        <div className="text-sm text-muted-foreground">How often to update market data</div>
                      </div>
                      <Button variant="outline" size="sm">30s</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Default Chart Period</div>
                        <div className="text-sm text-muted-foreground">Default time range for charts</div>
                      </div>
                      <Button variant="outline" size="sm">1D</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <DataExport />

              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Privacy & Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Change Password</div>
                        <div className="text-sm text-muted-foreground">Update your account password</div>
                      </div>
                      <Button variant="outline" size="sm">Change</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Data Privacy</div>
                        <div className="text-sm text-muted-foreground">Manage your data preferences</div>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
