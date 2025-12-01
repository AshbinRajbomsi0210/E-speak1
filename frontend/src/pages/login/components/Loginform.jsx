import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';


const LoginForm = ({ forcedRole, redirectTo }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    userType: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak' });
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [socialLoading, setSocialLoading] = useState(null);

  // Apply forcedRole from query param if provided
  useEffect(() => {
    if (forcedRole && ['user','admin','authority'].includes(forcedRole)) {
      setFormData(prev => ({ ...prev, userType: forcedRole }));
    }
  }, [forcedRole]);

  const computePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Weak' };
    let score = [
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
      pwd.length >= 8,
      pwd.length >= 12
    ].filter(Boolean).length;

    const labelMap = {0:'Weak',1:'Weak',2:'Fair',3:'Good',4:'Strong',5:'Strong',6:'Elite'};
    return { score, label: labelMap[score] };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'password') setPasswordStrength(computePasswordStrength(value));

    if (name === 'email') {
      if (value && value.includes('@') && !/@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
        const domainPart = value.split('@')[1] || '';
        const commonDomains = ['gmail.com','outlook.com','yahoo.com','proton.me'];
        const suggestion = commonDomains.find(d => d.startsWith(domainPart));
        setEmailSuggestion(suggestion ? value.split('@')[0] + '@' + suggestion : '');
      } else setEmailSuggestion('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- EMAIL/PASSWORD LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
        const { data } = await axios.post('/api/accounts/login/', {
           email: formData.email,
           password: formData.password,
           user_type: formData.userType
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

      // Call your sign-in function with the data
      signIn(formData.userType, data);
      setSuccessMessage('Authentication successful. Redirecting...');

      const redirectPath = redirectTo || 
        ((formData.userType === 'admin' || formData.userType === 'authority') ? '/admin' : '/profile')

      navigate(`${redirectPath}`, { replace: true });

    } catch (err) {
      console.error(err);
      setErrors({ general: 'Server error. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- SOCIAL LOGIN (GOOGLE / FACEBOOK) ---
  const handleSocialLogin = async (provider) => {
    if (formData.userType !== 'user') {
      setErrors({ general: 'Social login is only available for standard user accounts' });
      return;
    }

    setSocialLoading(provider);
    setErrors({});
    setSuccessMessage('');

    try {
      // Replace with backend OAuth endpoint
      const response = await fetch(`/api/accounts/social-login/${provider}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data?.detail || `${provider} login failed` });
        setSocialLoading(null);
        return;
      }

      signIn('user', data);
      setSuccessMessage(`${provider[0].toUpperCase() + provider.slice(1)} login successful. Redirecting...`);
      setSocialLoading(null);

      setTimeout(() => navigate(redirectTo || '/profile'), 900);

    } catch (err) {
      console.error(err);
      setErrors({ general: `${provider} login failed. Try again later.` });
      setSocialLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Sign in as</label>
          <div className="inline-flex rounded-lg bg-muted p-1 w-full">
            {['user','admin','authority'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: role }))}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium civic-transition ${
                  formData.userType === role ? 'bg-background text-foreground shadow-sm' : 'text-text-secondary hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <Icon name={role === 'user' ? 'User' : role === 'admin' ? 'Shield' : 'Award'} size={16} />
                  <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* General Error */}
        {errors.general && <div className="p-3 bg-error/10 border border-error/20 rounded-lg"><p className="text-sm text-error">{errors.general}</p></div>}

        {/* Email Input */}
        <Input label="Email Address" type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} error={errors.email} required />
        {emailSuggestion && !errors.email && (
          <div className="text-xs text-text-secondary -mt-4 mb-2">
            Did you mean <button type="button" className="text-primary underline" onClick={() => setFormData(prev => ({...prev, email: emailSuggestion}))}>{emailSuggestion}</button>?
          </div>
        )}

        {/* Password */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${errors.password ? 'text-destructive' : 'text-foreground'}`}>Password <span className="text-destructive">*</span></label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyUp={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
              placeholder="Enter your password"
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
              required
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute inset-y-0 right-2 flex items-center text-text-secondary hover:text-foreground" tabIndex={-1}>
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
            </button>
          </div>
          {capsLockOn && <p className="text-xs text-warning">Caps Lock is ON</p>}
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          {!errors.password && formData.password && (
            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.score <= 2 ? 'bg-error' : passwordStrength.score === 3 ? 'bg-warning' : passwordStrength.score === 4 ? 'bg-success' : 'bg-primary'
                  }`}
                  style={{ width: `${(passwordStrength.score/6)*100}%` }}
                ></div>
              </div>
              <p className="text-xs text-text-secondary flex items-center space-x-2"><span>Password strength:</span><span className="font-medium">{passwordStrength.label}</span></p>
            </div>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} />
          <button type="button" className="text-sm text-primary hover:text-primary/80 civic-transition" onClick={() => navigate('/forgot-password')}>Forgot password?</button>
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="default" fullWidth loading={isLoading} iconName="LogIn" iconPosition="right" disabled={!!successMessage || isLoading || socialLoading}>
          {successMessage ? 'Redirecting…' : 'Sign In'}
        </Button>
        {successMessage && <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success animate-fade-in">{successMessage}</div>}

        {/* Social Login */}
        {formData.userType === 'user' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-background text-text-secondary">Or continue with</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => handleSocialLogin('google')} disabled={isLoading || !!successMessage || !!socialLoading} iconName="Mail" iconPosition="left" loading={socialLoading==='google'} className="relative">{socialLoading==='google' ? 'Connecting…' : 'Google'}</Button>
              <Button type="button" variant="outline" onClick={() => handleSocialLogin('facebook')} disabled={isLoading || !!successMessage || !!socialLoading} iconName="Facebook" iconPosition="left" loading={socialLoading==='facebook'} className="relative">{socialLoading==='facebook' ? 'Connecting…' : 'Facebook'}</Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
