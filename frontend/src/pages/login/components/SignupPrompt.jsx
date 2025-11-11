import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const SignupPrompt = () => {
  return (
    <div className="text-center space-y-4">
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-text-secondary mb-3">
          Don't have an account yet?
        </p>
        <Link to="/register">
          <Button
            variant="outline"
            fullWidth
            iconName="UserPlus"
            iconPosition="left"
          >
            Create Account
          </Button>
        </Link>
      </div>
      
      <div className="text-xs text-text-secondary space-y-1">
        <p>By signing in, you agree to our</p>
        <div className="flex items-center justify-center space-x-4">
          <Link to="/terms" className="text-primary hover:text-primary/80 civic-transition">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className="text-primary hover:text-primary/80 civic-transition">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPrompt;