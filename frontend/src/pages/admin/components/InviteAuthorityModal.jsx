import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { useUser } from '@clerk/clerk-react';

const InviteAuthorityModal = ({ isOpen, onClose, onSuccess }) => {
  const { getToken } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get Clerk token for backend authentication
      const token = await getToken();
      
      const response = await fetch('http://127.0.0.1:8000/api/accounts/invite-authority/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Invitation sent successfully to ${formData.email}`);
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Invitation error:', err);
      setError('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', first_name: '', last_name: '' });
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg border border-border w-full max-w-md">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Invite Authority User</h2>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted civic-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
              <p className="text-sm text-success">{success}</p>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="authority@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <Input
            label="First Name (Optional)"
            type="text"
            name="first_name"
            placeholder="John"
            value={formData.first_name}
            onChange={handleInputChange}
          />

          <Input
            label="Last Name (Optional)"
            type="text"
            name="last_name"
            placeholder="Doe"
            value={formData.last_name}
            onChange={handleInputChange}
          />

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-foreground mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Invite email will be sent via Clerk</li>
                  <li>Authority sets their own password</li>
                  <li>Account is pre-configured with authority role</li>
                  <li>They can login immediately after accepting</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="submit"
              variant="default"
              fullWidth
              loading={isLoading}
              disabled={!formData.email || isLoading || !!success}
              iconName="Send"
            >
              {success ? 'Invitation Sent!' : 'Send Invitation'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteAuthorityModal;
