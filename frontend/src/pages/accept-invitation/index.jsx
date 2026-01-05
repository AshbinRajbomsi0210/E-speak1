import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, isLoaded, setActive } = useSignUp();
  const { getToken } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [invitationToken, setInvitationToken] = useState(null);
  const [invitationData, setInvitationData] = useState(null);

  useEffect(() => {
    // Get invitation token from URL
    const token = searchParams.get('__clerk_ticket');
    if (token) {
      setInvitationToken(token);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !isLoaded || !invitationToken) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Create sign up with invitation token
      await signUp.create({
        strategy: 'ticket',
        ticket: invitationToken,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      });

      // Complete the sign up
      const result = await signUp.attemptEmailAddressVerification({
        strategy: 'ticket',
        ticket: invitationToken,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Wait for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sync user to backend to create Django record with correct role
        try {
          const token = await getToken();
          if (token) {
            await fetch('http://127.0.0.1:8000/api/accounts/me/', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('✅ User synced to backend after invitation');
          }
        } catch (syncError) {
          console.error('⚠️ Sync error:', syncError);
        }
        
        // Redirect to profile to trigger another sync
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 500);
      }
    } catch (err) {
      console.error('Invitation acceptance error:', err);
      setErrors({ 
        general: err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to accept invitation. The link may be expired or invalid.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitationToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
              <Icon name="AlertCircle" size={32} className="text-error" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Invitation</h2>
            <p className="text-text-secondary mb-6">
              The invitation link is invalid or has expired. Please contact your administrator for a new invitation.
            </p>
            <Button onClick={() => navigate('/login')} variant="default">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Mail" size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Accept Invitation</h1>
          <p className="text-text-secondary">
            Complete your account setup to join e-Speak
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                required
              />
              
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${errors.password ? 'text-destructive' : 'text-foreground'}`}>
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                  }`}
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
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="default"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              iconName="CheckCircle"
              iconPosition="right"
            >
              {isLoading ? 'Creating Account...' : 'Accept Invitation'}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary/80 font-medium civic-transition"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
