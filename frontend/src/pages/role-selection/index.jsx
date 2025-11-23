import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

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
              Choose Your Role
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Select how you'd like to access the platform. Different roles have different capabilities and access levels.
            </p>
            
            <div className="space-y-4 pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="User" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Standard User</h3>
                  <p className="text-sm text-white/80">Report issues, engage with community</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="Shield" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Administrator</h3>
                  <p className="text-sm text-white/80">Manage platform and moderate content</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon name="Award" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Authority</h3>
                  <p className="text-sm text-white/80">Respond to and resolve community issues</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Role Selection */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <Link to="/home" className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
              <Icon name="MessageSquare" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">E-speak</h1>
            </div>
          </Link>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Select Your Role</h2>
            <p className="text-text-secondary">
              Choose how you want to sign in
            </p>
          </div>

          {/* Role Cards */}
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('user')}
              className="w-full p-6 bg-card rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 civic-transition group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-lg civic-transition">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground text-lg mb-1">Standard User</h3>
                  <p className="text-sm text-text-secondary">Report issues and engage with community</p>
                </div>
                <Icon name="ChevronRight" size={20} className="text-text-secondary group-hover:text-primary civic-transition" />
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full p-6 bg-card rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 civic-transition group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-lg civic-transition">
                  <Icon name="Shield" size={24} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground text-lg mb-1">Administrator</h3>
                  <p className="text-sm text-text-secondary">Manage platform and moderate content</p>
                </div>
                <Icon name="ChevronRight" size={20} className="text-text-secondary group-hover:text-primary civic-transition" />
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('authority')}
              className="w-full p-6 bg-card rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 civic-transition group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-lg civic-transition">
                  <Icon name="Award" size={24} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground text-lg mb-1">Authority</h3>
                  <p className="text-sm text-text-secondary">Respond to and resolve community issues</p>
                </div>
                <Icon name="ChevronRight" size={20} className="text-text-secondary group-hover:text-primary civic-transition" />
              </div>
            </button>
          </div>

          {/* Sign Up Link */}
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

export default RoleSelection;
