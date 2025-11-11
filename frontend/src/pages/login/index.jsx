import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/Loginform';
import SecurityBadges from './components/SecurityBadges';
import SignupPrompt from './components/SignupPrompt';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const session = JSON.parse(userSession);
      if (session?.userType === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <LoginHeader />

          {/* Main Login Form */}
          <div className="civic-card p-6 space-y-6">
            <LoginForm />
          </div>

          {/* Security Badges */}
          <SecurityBadges />

          {/* Signup Prompt */}
          <SignupPrompt />
        </div>
      </div>

      {/* Trust Indicators Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-6 text-xs text-text-secondary">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Secure Connection</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Government Verified</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
