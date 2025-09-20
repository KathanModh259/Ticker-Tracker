import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuthStore } from '@/stores/useAuthStore';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="text-center lg:text-left space-y-6">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <TrendingUp className="h-12 w-12 text-primary" />
              <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TickerTracker
              </span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Track Every{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Market Move
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Real-time financial data, smart alerts, and comprehensive market analysis 
                for stocks, ETFs, indices, and cryptocurrencies.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Real-time Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Smart Alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Global Markets</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Advanced Analytics</span>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="flex justify-center">
            {isLogin ? (
              <LoginForm 
                onSuccess={handleAuthSuccess}
                onSwitchToSignup={() => setIsLogin(false)}
              />
            ) : (
              <SignupForm 
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setIsLogin(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
