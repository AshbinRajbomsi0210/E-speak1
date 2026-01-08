import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignIn, useClerk } from '@clerk/clerk-react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isLoaded, signIn } = useSignIn();
  const { signOut } = useClerk();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'code'
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clear any existing Clerk session on component mount
  useEffect(() => {
    if (isLoaded && signIn && signIn.status) {
      // Component mounted with existing session, clear localStorage flag
      localStorage.removeItem('clerk_password_reset_in_progress');
    }
  }, [isLoaded, signIn]);

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Start the password reset process
      const result = await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setSuccessMessage('Reset code sent! Check your email.');
      setStep('code');
    } catch (err) {
      console.error('Reset error:', err);
      
      // If there's an existing session, provide instructions
      if (err.errors?.[0]?.code === 'form_identifier_exists' || 
          err.errors?.[0]?.message?.toLowerCase().includes('session')) {
        setError('An active session exists. Please click "Refresh Page" below to start a new reset.');
      } else {
        setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      // Attempt to reset the password with both code and password
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        
        // IMPORTANT: Sign out immediately after password reset
        // This prevents the auto-login that Clerk does after password reset
        await signOut();
        
        // Clear all state
        setEmail('');
        setCode('');
        setNewPassword('');
        setStep('email');
        
        // Redirect to login page immediately
        sessionStorage.setItem('password_reset_complete', 'true');
        // Use replace to prevent going back to this page
        window.location.replace('/login');
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid code or failed to reset password. Please check your code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
    setNewPassword('');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="civic-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Lock" size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
              </h1>
              <p className="text-text-secondary">
                {step === 'email' 
                  ? "Enter your email address and we'll send you a reset code"
                  : 'Enter the code and your new password'}
              </p>
            </div>

            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleSendResetCode} className="space-y-6">
                {error && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error flex items-start space-x-2">
                    <Icon name="AlertCircle" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success flex items-start space-x-2">
                    <Icon name="CheckCircle" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  icon="Mail"
                />

                <Button
                  type="submit"
                  variant="default"
                  fullWidth
                  loading={isLoading}
                  disabled={!email || isLoading}
                >
                  Send Reset Code
                </Button>

                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary hover:text-primary/80 civic-transition">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* Code & New Password Step */}
            {step === 'code' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {error && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error flex items-start space-x-2">
                    <Icon name="AlertCircle" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success flex items-start space-x-2">
                    <Icon name="CheckCircle" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <Input
                  label="Reset Code"
                  type="text"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  icon="Key"
                  maxLength={6}
                />

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    required
                    icon="Lock"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-text-secondary hover:text-foreground civic-transition"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                  </button>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={handleBackToEmail}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    fullWidth
                    loading={isLoading}
                    disabled={!code || code.length !== 6 || !newPassword || newPassword.length < 8 || isLoading}
                  >
                    Reset Password
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-text-secondary">
            {step === 'code' && (
              <>
                <p>Didn't receive the code? Check your spam folder or</p>
                <button
                  onClick={handleBackToEmail}
                  className="text-primary hover:text-primary/80 civic-transition ml-1"
                >
                  try again
                </button>
              </>
            )}
            {step === 'email' && (
              <>
                <p className="text-xs mt-2">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 civic-transition">
                    Sign in
                  </Link>
                </p>
                {error && error.includes('session') && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
