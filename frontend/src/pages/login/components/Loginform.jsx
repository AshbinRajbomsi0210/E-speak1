import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useSignIn, useUser } from '@clerk/clerk-react';


const LoginForm = ({ forcedRole, redirectTo, onRoleChange }) => {
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user } = useUser();

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

  // Apply forcedRole from query param if provided and notify parent of initial/forced role
  useEffect(() => {
    if (forcedRole && ['user','admin','authority'].includes(forcedRole)) {
      setFormData(prev => ({ ...prev, userType: forcedRole }));
      if (onRoleChange) onRoleChange(forcedRole);
    } else if (onRoleChange) {
      // Notify parent of initial role (default 'user')
      onRoleChange(formData.userType);
    }
  }, [forcedRole, onRoleChange]);

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
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Notify parent component when role changes
    if (name === 'userType' && onRoleChange) {
      onRoleChange(newValue);
    }

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
    if (!isLoaded) return;

    // Clear any password reset flags
    sessionStorage.removeItem('password_reset_complete');

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === 'complete') {
        // Activate the session first
        await setActive({ session: result.createdSessionId });
        
        setSuccessMessage('Authentication successful. Redirecting...');

        // Redirect based on role or custom redirectTo
        const redirectPath = redirectTo || 
          (formData.userType === 'authority' ? '/authority' : 
           formData.userType === 'admin' ? '/admin' : '/home');

        // Redirect after a short delay to allow session to be fully established
        setTimeout(() => navigate(`${redirectPath}`, { replace: true }), 900);
      } else {
        // Handle other statuses
        console.log('Sign in status:', result.status);
        setErrors({ general: 'Sign in requires additional steps. Please contact support.' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: err.errors?.[0]?.message || 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- SOCIAL LOGIN (GOOGLE / FACEBOOK) ---
  const handleSocialLogin = async (provider) => {
    if (!isLoaded) return;
    
    if (formData.userType !== 'user') {
      setErrors({ general: 'Social login is only available for standard user accounts' });
      return;
    }

    setSocialLoading(provider);
    setErrors({});
    setSuccessMessage('');

    try {
      const oauthProvider = provider === 'google' ? 'oauth_google' : 'oauth_facebook';
      await signIn.authenticateWithRedirect({
        strategy: oauthProvider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: redirectTo || '/profile'
      });
    } catch (err) {
      console.error('OAuth error:', err);
      setErrors({ general: err.errors?.[0]?.message || `${provider} login failed. Try again later.` });
      setSocialLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Sign in as</label>
          <div className="grid grid-cols-3 gap-2">
            {['user','admin','authority'].map(role => {
              const isSelected = formData.userType === role;
              const roleConfig = {
                user: { icon: 'User', label: 'User', description: 'Report issues' },
                admin: { icon: 'Shield', label: 'Admin', description: 'Manage system' },
                authority: { icon: 'Award', label: 'Authority', description: 'Handle issues' }
              };
              const config = roleConfig[role];
              
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, userType: role }));
                    if (onRoleChange) onRoleChange(role);
                  }}
                  className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary/10 border-primary shadow-md shadow-primary/20 scale-[1.02]' 
                      : 'bg-muted/50 border-transparent hover:bg-muted hover:border-border'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Check" size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isSelected ? 'bg-primary text-white' : 'bg-muted text-text-secondary'
                  }`}>
                    <Icon name={config.icon} size={20} />
                  </div>
                  <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-text-secondary mt-0.5">{config.description}</span>
                </button>
              );
            })}
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
          <label className={`text-sm font-semibold ${errors.password ? 'text-destructive' : 'text-slate-700'}`}>Password <span className="text-destructive">*</span></label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyUp={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
              placeholder="Enter your password"
              className={`flex h-11 w-full rounded-lg border-2 px-4 py-2 text-sm font-medium shadow-sm ring-offset-background transition-all duration-200 pr-12 ${errors.password ? 'border-destructive bg-white text-slate-900 placeholder:text-slate-400 hover:border-destructive focus:border-destructive focus:outline-none focus:ring-4 focus:ring-destructive/20' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20'}`}
              required
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors" tabIndex={-1}>
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
          {capsLockOn && <p className="text-xs text-warning">Caps Lock is ON</p>}
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
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