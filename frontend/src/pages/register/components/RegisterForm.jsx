import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const RegisterForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak' });
  const [successMessage, setSuccessMessage] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get query params
  const queryParams = new URLSearchParams(location.search);

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const computePasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: 'Weak' };
    const tests = [
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
      pwd.length >= 8,
      pwd.length >= 12
    ];
    score = tests.filter(Boolean).length;
    const labelMap = {
      0: 'Weak',
      1: 'Weak',
      2: 'Fair',
      3: 'Good',
      4: 'Strong',
      5: 'Strong',
      6: 'Elite'
    };
    return { score, label: labelMap[score] };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'password') {
      setPasswordStrength(computePasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {``
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData?.phone && !/^[\d\s\-\+\(\)]+$/.test(formData?.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    if (!isLoaded) return;
    
    setIsLoading(true);
    
    try {
      // Create the user with Clerk
      await signUp.create({
        emailAddress: formData?.email,
        password: formData?.password,
        firstName: formData?.fullName.split(' ')[0],
        lastName: formData?.fullName.split(' ').slice(1).join(' ') || formData?.fullName.split(' ')[0],
        unsafeMetadata: {
          role: queryParams.get('role') || 'user',
          phone: formData?.phone
        }
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      // Switch to verification mode
      setVerifying(true);
      setSuccessMessage('Verification code sent to your email!');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Parse Clerk errors and assign to specific fields
      const clerkError = error.errors?.[0];
      const errorMessage = clerkError?.longMessage || clerkError?.message || 'Registration failed';
      
      // Check if error is related to specific field
      if (clerkError?.meta?.paramName === 'password' || errorMessage.toLowerCase().includes('password')) {
        setErrors({ password: errorMessage });
      } else if (clerkError?.meta?.paramName === 'email_address' || errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Attempt email verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim()
      });
      
      console.log('Full verification result:', JSON.stringify(completeSignUp, null, 2));
      console.log('Status:', completeSignUp.status);
      console.log('Created user ID:', completeSignUp.createdUserId);
      console.log('Created session ID:', completeSignUp.createdSessionId);
      
      // If status is complete, activate the session
      if (completeSignUp.status === 'complete' && completeSignUp.createdSessionId) {
        console.log('Verification complete, setting active session...');
        await setActive({ session: completeSignUp.createdSessionId });
        console.log('Session activated successfully');
        
        // Trigger user sync to backend after successful registration
        try {
          const token = await completeSignUp.createdSessionId.getToken();
          await fetch('http://127.0.0.1:8000/api/accounts/me/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('User synced to backend');
        } catch (syncError) {
          console.error('User sync error:', syncError);
          // Continue anyway - sync will happen on next API call
        }
        
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/profile'), 1500);
      } 
      // If missing requirements, handle it
      else if (completeSignUp.status === 'missing_requirements') {
        console.log('Missing fields:', completeSignUp.missingFields);
        console.log('Unverified fields:', completeSignUp.unverifiedFields);
        
        // Email is verified but other fields might be missing
        // Redirect to login where they can complete their profile
        setSuccessMessage('Email verified! Please sign in to complete your profile.');
        setTimeout(() => navigate('/login'), 2000);
      }
      // If verification is complete but no session (shouldn't happen normally)
      else if (completeSignUp.status === 'complete' && !completeSignUp.createdSessionId) {
        console.warn('Verification complete but no session created');
        setSuccessMessage('Account verified! Please sign in.');
        setTimeout(() => navigate('/login'), 2000);
      }
      // Any other status
      else {
        console.error('Unexpected status:', completeSignUp.status);
        setErrors({ verification: 'Verification completed with unexpected status. Please try signing in.' });
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (error) {
      console.error('Verification error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      const errorCode = error.errors?.[0]?.code;
      const errorMessage = error.errors?.[0]?.longMessage || error.errors?.[0]?.message || 'Verification failed';
      
      // Handle "already verified" case
      if (errorCode === 'verification_already_verified' || errorMessage.toLowerCase().includes('already verified')) {
        console.log('Already verified, attempting to use existing session...');
        
        // Check if we have a session ID from the signup
        if (signUp.createdSessionId) {
          try {
            await setActive({ session: signUp.createdSessionId });
            setSuccessMessage('Account verified! Redirecting...');
            setTimeout(() => navigate('/profile'), 1000);
            return;
          } catch (sessionError) {
            console.error('Failed to set active session:', sessionError);
          }
        }
        
        // If no session, redirect to login
        setSuccessMessage('Account already verified! Please sign in.');
        setTimeout(() => navigate('/login'), 1500);
      }
      // Invalid code
      else if (errorCode === 'form_code_incorrect' || errorMessage.toLowerCase().includes('incorrect')) {
        setErrors({ verification: 'Invalid verification code. Please check and try again.' });
      }
      // Any other error
      else {
        setErrors({ verification: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || resendCooldown > 0) return;
    
    setResendLoading(true);
    setErrors({});
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setSuccessMessage('New verification code sent!');
      setResendCooldown(60); // 60 second cooldown
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Resend error:', error);
      setErrors({ verification: error.errors?.[0]?.message || 'Failed to resend code. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSocialRegister = async (provider) => {
    if (!isLoaded) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const oauthProvider = provider === 'google' ? 'oauth_google' : 'oauth_facebook';
      await signUp.authenticateWithRedirect({
        strategy: oauthProvider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/'
      });
    } catch (error) {
      console.error('OAuth error:', error);
      setErrors({ general: error.errors?.[0]?.message || `${provider} signup failed` });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {verifying ? (
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Check your email</h3>
            <p className="text-sm text-text-secondary">
              We sent a verification code to <strong>{formData?.email}</strong>
            </p>
          </div>

          {errors?.verification && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{errors?.verification}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success animate-fade-in">
              {successMessage}
            </div>
          )}

          <Input
            label="Verification Code"
            type="text"
            name="code"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (errors?.verification) {
                setErrors({});
              }
            }}
            required
          />

          <Button
            type="submit"
            variant="default"
            fullWidth
            loading={isLoading}
            disabled={!code || isLoading}
          >
            Verify Email
          </Button>

          <div className="text-center text-sm text-text-secondary">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || resendLoading}
              className={`font-medium ${
                resendCooldown > 0 || resendLoading
                  ? 'text-text-secondary cursor-not-allowed'
                  : 'text-primary hover:underline'
              }`}
            >
              {resendLoading
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Code'}
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => {
              setVerifying(false);
              setCode('');
              setErrors({});
              setSuccessMessage('');
            }}
            disabled={isLoading}
          >
            Back to Registration
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
        {/* General Error */}
        {errors?.general && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{errors?.general}</p>
          </div>
        )}

        {/* Full Name Input */}
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={formData?.fullName}
          onChange={handleInputChange}
          error={errors?.fullName}
          required
        />

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData?.email}
          onChange={handleInputChange}
          error={errors?.email}
          required
        />

        {/* Phone Input */}
        <Input
          label="Phone Number (Optional)"
          type="tel"
          name="phone"
          placeholder="+1 (555) 123-4567"
          value={formData?.phone}
          onChange={handleInputChange}
          error={errors?.phone}
        />

        {/* Password Input with toggle & strength */}
        <div className="space-y-2">
          <label className={`text-sm font-semibold ${errors?.password ? 'text-destructive' : 'text-slate-700'}`}>
            Password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData?.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              className={`flex h-11 w-full rounded-lg border-2 px-4 py-2 text-sm font-medium shadow-sm ring-offset-background transition-all duration-200 pr-12 ${errors?.password ? 'border-destructive bg-white text-slate-900 placeholder:text-slate-400 hover:border-destructive focus:border-destructive focus:outline-none focus:ring-4 focus:ring-destructive/20' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20'}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
              tabIndex={-1}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
          {errors?.password && <p className="text-sm text-destructive">{errors?.password}</p>}
          {!errors?.password && formData?.password && (
            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.score <= 2 ? 'bg-error' : passwordStrength.score === 3 ? 'bg-warning' : passwordStrength.score === 4 ? 'bg-success' : 'bg-primary'
                  }`}
                  style={{ width: `${(passwordStrength.score/6)*100}%` }}
                ></div>
              </div>
              <p className="text-xs text-text-secondary flex items-center space-x-2">
                <span>Password strength:</span>
                <span className="font-medium">{passwordStrength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <label className={`text-sm font-semibold ${errors?.confirmPassword ? 'text-destructive' : 'text-slate-700'}`}>
            Confirm Password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData?.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              className={`flex h-11 w-full rounded-lg border-2 px-4 py-2 text-sm font-medium shadow-sm ring-offset-background transition-all duration-200 pr-12 ${errors?.confirmPassword ? 'border-destructive bg-white text-slate-900 placeholder:text-slate-400 hover:border-destructive focus:border-destructive focus:outline-none focus:ring-4 focus:ring-destructive/20' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20'}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(p => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
              tabIndex={-1}
            >
              <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
          {errors?.confirmPassword && <p className="text-sm text-destructive">{errors?.confirmPassword}</p>}
        </div>

        {/* Terms Agreement */}
        <div className="space-y-2">
          <Checkbox
            label={
              <span className="text-sm text-text-secondary">
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </span>
            }
            name="agreeToTerms"
            checked={formData?.agreeToTerms}
            onChange={handleInputChange}
          />
          {errors?.agreeToTerms && <p className="text-sm text-destructive">{errors?.agreeToTerms}</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          iconName="UserPlus"
          iconPosition="right"
          disabled={!!successMessage || isLoading}
        >
          {successMessage ? 'Redirecting…' : 'Create Account'}
        </Button>

        {successMessage && (
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success animate-fade-in">
            {successMessage}
          </div>
        )}

        {/* Social Register */}
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-text-secondary">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialRegister('google')}
              disabled={isLoading || !!successMessage}
              iconName="Mail"
              iconPosition="left"
              loading={isLoading}
              className="relative"
            >
              {isLoading ? 'Connecting…' : 'Google'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialRegister('facebook')}
              disabled={isLoading || !!successMessage}
              iconName="Facebook"
              iconPosition="left"
              loading={isLoading}
              className="relative"
            >
              {isLoading ? 'Connecting…' : 'Facebook'}
            </Button>
          </div>
        </>
      </form>
      )}
    </div>
  );
};

export default RegisterForm;
