import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../context/AuthContext';

const LoginForm = ({ forcedRole }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    userType: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  // Mock credentials for different user roles (user vs admin vs authority)
  const mockCredentials = {
    user: { email: 'user@example.com', password: 'user123' },
    admin: { email: 'admin@gov.local', password: 'admin123' },
    authority: { email: 'authority@dept.local', password: 'authority123' }
  };

  // Apply forcedRole from query param if provided
  useEffect(() => {
    if (forcedRole && ['user','admin','authority'].includes(forcedRole)) {
      setFormData(prev => ({ ...prev, userType: forcedRole }));
    }
  }, [forcedRole]);

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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const credentials = mockCredentials?.[formData?.userType];
      if (formData?.email === credentials?.email && formData?.password === credentials?.password) {
        // Use AuthContext signIn
        signIn(formData?.userType, { email: formData?.email });
        navigate('/profile');
      } else {
        setErrors({ general: `Invalid credentials. Use ${credentials?.email} / ${credentials?.password} for ${formData?.userType} access.` });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    if (formData?.userType !== 'user') {
      setErrors({ general: 'Social login is only available for standard user accounts' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      signIn('user', { email: `user@${provider}.com` });
      navigate('/profile');
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Account Role</label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'user' }))}
              className={`flex-1 px-4 py-3 rounded-lg border civic-transition ${
                formData?.userType === 'user' ?'bg-primary text-primary-foreground border-primary' :'bg-surface text-text-secondary border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Icon name="User" size={18} />
                <span className="font-medium">User</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'admin' }))}
              className={`flex-1 px-4 py-3 rounded-lg border civic-transition ${
                formData?.userType === 'admin' ?'bg-primary text-primary-foreground border-primary' :'bg-surface text-text-secondary border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Icon name="Shield" size={18} />
                <span className="font-medium">Administrator</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'authority' }))}
              className={`flex-1 px-4 py-3 rounded-lg border civic-transition ${
                formData?.userType === 'authority' ?'bg-primary text-primary-foreground border-primary' :'bg-surface text-text-secondary border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Icon name="Award" size={18} />
                <span className="font-medium">Authority</span>
              </div>
            </button>
          </div>
        </div>

        {/* General Error */}
        {errors?.general && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{errors?.general}</p>
          </div>
        )}

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

        {/* Password Input */}
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
        />

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData?.rememberMe}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 civic-transition"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          iconName="LogIn"
          iconPosition="right"
        >
          Sign In
        </Button>

        {/* Social Login - Only for standard user role */}
        {formData?.userType === 'user' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-text-secondary">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                iconName="Mail"
                iconPosition="left"
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                iconName="Facebook"
                iconPosition="left"
              >
                Facebook
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
