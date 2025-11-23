import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../context/AuthContext';

const RegisterForm = () => {
  const navigate = useNavigate();
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
  const { signIn } = useAuth();

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
    } else if (formData?.password !== formData?.confirmPassword) {
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
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Auto sign in after registration
      signIn('user', { email: formData?.email, name: formData?.fullName });
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/profile'), 900);
      setIsLoading(false);
    }, 1500);
  };

  const handleSocialRegister = (provider) => {
    setIsLoading(true);
    setErrors({});
    
    // Simulate OAuth registration flow
    setTimeout(() => {
      const mockSocialUser = {
        email: `new.user@${provider}.com`,
        name: `${provider[0].toUpperCase() + provider.slice(1)} User`,
        avatar: null,
        verified: true,
        createdVia: provider
      };
      
      signIn('user', mockSocialUser);
      setSuccessMessage(`${provider[0].toUpperCase()+provider.slice(1)} signup successful! Redirecting...`);
      setIsLoading(false);
      setTimeout(() => navigate('/profile'), 900);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
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
          <label className={`text-sm font-medium ${errors?.password ? 'text-destructive' : 'text-foreground'}`}>
            Password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData?.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors?.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute inset-y-0 right-2 flex items-center text-text-secondary hover:text-foreground"
              tabIndex={-1}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
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
          <label className={`text-sm font-medium ${errors?.confirmPassword ? 'text-destructive' : 'text-foreground'}`}>
            Confirm Password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData?.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors?.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(p => !p)}
              className="absolute inset-y-0 right-2 flex items-center text-text-secondary hover:text-foreground"
              tabIndex={-1}
            >
              <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
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
    </div>
  );
};

export default RegisterForm;
