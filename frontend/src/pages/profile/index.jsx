import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, authenticated, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <div className="pt-20 max-w-3xl mx-auto px-4 space-y-8">
        <div className="civic-card p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{user?.name || 'Guest'}</h1>
              <p className="text-text-secondary text-sm">{user?.email || 'Not signed in'}</p>
              {user?.role && (
                <div className="mt-1 inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-muted text-text-secondary capitalize">
                  <Icon name={user.role === 'admin' ? 'Shield' : user.role === 'authority' ? 'Award' : 'User'} size={14} />
                  <span>{user.role}</span>
                </div>
              )}
            </div>
          </div>
          {!authenticated && (
            <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
              <p>You are currently not signed in. Choose a role from the header Sign In menu or go to the full login page.</p>
              <Link to="/login" className="text-primary hover:underline inline-flex items-center space-x-1 text-sm">
                <Icon name="LogIn" size={14} />
                <span>Go to Login</span>
              </Link>
            </div>
          )}
          {authenticated && (
            <div className="flex space-x-3">
              <Button variant="outline" iconName="LogOut" onClick={signOut}>Sign Out</Button>
            </div>
          )}
        </div>
        {authenticated && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="civic-card p-5 space-y-2">
              <h2 className="text-lg font-medium">Account Details</h2>
              <div className="text-sm text-text-secondary space-y-1">
                <div><span className="font-medium text-foreground">Email:</span> {user.email}</div>
                <div className="capitalize"><span className="font-medium text-foreground">Role:</span> {user.role}</div>
                <div><span className="font-medium text-foreground">Member Since:</span> {new Date().toLocaleDateString()}</div>
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
