import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center space-y-6">
      {/* Logo */}
      <Link to="/home" className="inline-flex items-center space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
          <Icon name="MessageSquare" size={28} color="white" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-foreground">E-speak</h1>
          <p className="text-sm text-text-secondary">Empowering Voices, Developing Communities</p>
        </div>
      </Link>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
        <p className="text-text-secondary">
          Sign in to your account to report issues, engage with your community, and make a difference.
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;