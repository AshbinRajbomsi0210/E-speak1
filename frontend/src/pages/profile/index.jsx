import React, { useEffect } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Auto-sync user to backend when profile loads
  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken();
          await fetch('http://127.0.0.1:8000/api/accounts/me/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ User synced to backend');
        } catch (error) {
          console.error('User sync error:', error);
        }
      }
    };
    
    syncUser();
  }, [isSignedIn, user, getToken]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <div className="pt-20 max-w-3xl mx-auto px-4 space-y-8">
        <div className="civic-card p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-semibold">
              {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {user?.fullName || user?.firstName || 'Guest'}
              </h1>
              <p className="text-text-secondary text-sm">
                {user?.emailAddresses?.[0]?.emailAddress || 'Not signed in'}
              </p>
              {user?.unsafeMetadata?.role && (
                <div className="mt-1 inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-muted text-text-secondary capitalize">
                  <Icon name={user.unsafeMetadata.role === 'admin' ? 'Shield' : user.unsafeMetadata.role === 'authority' ? 'Award' : 'User'} size={14} />
                  <span>{user.unsafeMetadata.role}</span>
                </div>
              )}
            </div>
          </div>
          {!isSignedIn && (
            <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
              <p>You are currently not signed in. Choose a role from the header Sign In menu or go to the full login page.</p>
              <Link to="/login" className="text-primary hover:underline inline-flex items-center space-x-1 text-sm">
                <Icon name="LogIn" size={14} />
                <span>Go to Login</span>
              </Link>
            </div>
          )}
          {isSignedIn && (
            <div className="flex flex-wrap gap-3">
              {(user?.unsafeMetadata?.role === 'admin' || user?.publicMetadata?.role === 'admin') && (
                <Link to="/admin">
                  <Button variant="primary">
                    <Icon name="Shield" size={16} />
                    <span className="ml-2">Admin Dashboard</span>
                  </Button>
                </Link>
              )}
              {(user?.unsafeMetadata?.role === 'authority' || user?.publicMetadata?.role === 'authority') && (
                <Link to="/authority">
                  <Button variant="primary">
                    <Icon name="Award" size={16} />
                    <span className="ml-2">Authority Dashboard</span>
                  </Button>
                </Link>
              )}
              <Button variant="outline" iconName="LogOut" onClick={handleSignOut}>Sign Out</Button>
            </div>
          )}
        </div>
        {isSignedIn && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="civic-card p-5 space-y-2">
              <h2 className="text-lg font-medium">Account Details</h2>
              <div className="text-sm text-text-secondary space-y-1">
                <div><span className="font-medium text-foreground">Email:</span> {user?.emailAddresses?.[0]?.emailAddress}</div>
                <div className="capitalize"><span className="font-medium text-foreground">Role:</span> {user?.unsafeMetadata?.role || 'user'}</div>
                <div><span className="font-medium text-foreground">Phone:</span> {user?.unsafeMetadata?.phone || 'Not provided'}</div>
                <div><span className="font-medium text-foreground">Member Since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
            <div className="civic-card p-5 space-y-2">
              <h2 className="text-lg font-medium">Activity Snapshot</h2>
              <p className="text-sm text-text-secondary">Placeholder stats for future integration.</p>
              <ul className="text-xs space-y-1 text-text-secondary">
                <li>0 reports submitted</li>
                <li>0 comments posted</li>
                <li>0 community votes</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
