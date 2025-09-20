import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { Calendar, Edit, Mail, Phone, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const UserProfile = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    firstName: '',
    lastName: '',
    bio: ''
  });

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile({
        email: profileData.email,
        phone: profileData.phone
      });

      if (result.success) {
        toast.success("Profile updated successfully");
        setIsEditDialogOpen(false);
      } else {
        toast.error("Failed to update profile", { description: result.error });
      }
    } catch (error) {
      toast.error("An error occurred while updating profile");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Profile</span>
          </CardTitle>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Phone number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Tell us about yourself"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
                <Button onClick={handleSaveProfile} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Profile Avatar */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {profileData.firstName && profileData.lastName 
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : user?.email?.split('@')[0] || 'User'
                }
              </h3>
              <p className="text-sm text-muted-foreground">TickerTracker User</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
            </div>

            {user?.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground">{user.phone}</div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Member Since</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(user?.created_at || '')}
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Status</span>
              <Badge variant="outline" className="border-bullish/50 text-bullish">
                Active
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="pt-4 border-t border-border/30">
            <h4 className="text-sm font-medium mb-3">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-lg font-bold">0</div>
                <div className="text-xs text-muted-foreground">Watchlist Items</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-lg font-bold">0</div>
                <div className="text-xs text-muted-foreground">Active Alerts</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
