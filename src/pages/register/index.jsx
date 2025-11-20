import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { authenticated } = useAuth();

  useEffect(() => {
    if (authenticated) {
      navigate('/profile');
    }
  }, [authenticated, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent via-accent/90 to-primary relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <Link to="/home" className="inline-flex items-center space-x-3 mb-12">
            <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-lg">
              <Icon name="MessageSquare" size={32} className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">E-speak</h1>
              <p className="text-sm text-white/90">Empowering Communities</p>
            </div>
          </Link>
          
          <div className="space-y-6 max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Join Your Community Today
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Create an account to start reporting issues, engaging with neighbors, and making a real difference in your community.
            </p>
            
            <div className="space-y-4 pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="Zap" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quick & Easy Setup</h3>
                  <p className="text-sm text-white/80">Get started in less than 2 minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="Shield" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Safe & Secure</h3>
                  <p className="text-sm text-white/80">Your data is protected with encryption</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="Heart" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Make an Impact</h3>
                  <p className="text-sm text-white/80">Be part of positive community change</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <Link to="/home" className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-accent rounded-xl">
              <Icon name="MessageSquare" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">E-speak</h1>
            </div>
          </Link>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
            <p className="text-text-secondary">
              Fill in your details to get started
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm />

          {/* Sign In Link */}
          <div className="text-center pt-6 border-t border-border">
            <p className="text-sm text-text-secondary mb-3">
              Already have an account?
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium civic-transition"
            >
              <Icon name="LogIn" size={18} />
              <span>Sign In</span>
            </Link>
          </div>

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
              <span>Free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
