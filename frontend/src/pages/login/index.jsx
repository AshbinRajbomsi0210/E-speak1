import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import LoginForm from './components/Loginform';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
// import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = React.useState('user');
  // const { authenticated } = useAuth();
  const from = location.state?.from;
                                      
  // useEffect(() => {
  //   if (authenticated) {
  //     navigate(from || '/profile');
  //   }
  // }, [authenticated, navigate, from]);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <Link to="/home" className="inline-flex items-center space-x-3 mb-12">
            <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-lg">
              <Icon name="MessageSquare" size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">E-speak</h1>
              <p className="text-sm text-white/90">Empowering Communities</p>
            </div>
          </Link>
          
          <div className="space-y-6 max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              {selectedRole === 'admin' 
                ? 'System Administration Portal'
                : selectedRole === 'authority'
                  ? 'Authority Management Portal'
                  : 'Welcome Back to Your Community'}
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              {selectedRole === 'admin'
                ? 'Access the administrative dashboard to manage users, oversee issues, and configure system settings.'
                : selectedRole === 'authority'
                  ? 'Sign in to manage and resolve civic issues assigned to your jurisdiction.'
                  : 'Sign in to report issues, engage with your community, and create meaningful change in your neighborhood.'}
            </p>
            
            <div className="space-y-4 pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="MapPin" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Report Local Issues</h3>
                  <p className="text-sm text-white/80">Make your voice heard on community concerns</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="Users" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Connect & Collaborate</h3>
                  <p className="text-sm text-white/80">Join discussions and support initiatives</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="TrendingUp" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-sm text-white/80">See real-time updates on issue resolution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Back to Home Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/home')}
          className="absolute top-6 left-6"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="ml-2">Back to Home</span>
        </Button>

        <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
          {/* Mobile Logo */}
          <Link to="/home" className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
              <Icon name="MessageSquare" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">E-speak</h1>
            </div>
          </Link>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              {selectedRole === 'admin' ? 'Admin Sign In' 
                : selectedRole === 'authority' ? 'Authority Sign In' 
                : 'Sign In'}
            </h2>
            <p className="text-text-secondary">
              {selectedRole === 'admin' 
                ? 'Enter your admin credentials to access the dashboard'
                : selectedRole === 'authority'
                  ? 'Enter your official authority credentials'
                  : 'Enter your credentials to access your account'}
            </p>
            {from && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary">
                  <Icon name="Lock" size={16} className="inline mr-1" />
                  Please sign in to report issues
                </p>
              </div>
            )}
          </div>

          {/* Login Form */}
          <LoginForm forcedRole={searchParams.get('role')} redirectTo={from} onRoleChange={setSelectedRole} />

          {/* Sign Up Link - Only for regular users */}
          {selectedRole === 'user' && (
            <div className="text-center pt-6 border-t border-border">
              <p className="text-sm text-text-secondary mb-3">
                Don't have an account?
              </p>
              <Link 
                to="/register"
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium civic-transition"
              >
                <Icon name="UserPlus" size={18} />
                <span>Create Account</span>
              </Link>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 pt-6 text-xs text-text-secondary">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Verified</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
