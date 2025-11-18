import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSigninMenu, setShowSigninMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticated, user, role, signIn, signOut } = useAuth();

  const navigationItems = [
    { label: 'Home', path: '/home', icon: 'Home' },
    { label: 'Report', path: '/report-issue', icon: 'Plus' },
    { label: 'Issues', path: '/issues', icon: 'AlertCircle' },
    { label: 'Map View', path: '/map-view', icon: 'Map' },
    { label: 'Community', path: '/community', icon: 'Users' }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border civic-shadow-card">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="MessageSquare" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">E-speak</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg civic-transition ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span className="font-medium">{item?.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-3 relative">
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <Icon name="Bell" size={18} />
            </Button>
            {authenticated ? (
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowUserMenu(prev => !prev)} aria-haspopup="menu" aria-expanded={showUserMenu}>
                  <Icon name="User" size={18} />
                  <span className="ml-2 hidden lg:inline font-medium">{user?.name}</span>
                  <Icon name={showUserMenu ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </Button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 civic-card p-2 space-y-1 border border-border rounded-lg shadow-lg z-50">
                    <div className="px-3 py-2 text-sm text-text-secondary">
                      Signed in as <span className="font-medium text-foreground">{user?.email}</span>
                      <div className="text-xs mt-1 capitalize">Role: {role}</div>
                    </div>
                    <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted text-sm civic-transition" onClick={() => setShowUserMenu(false)}>
                      <Icon name="User" size={16} />
                      <span>Profile</span>
                    </Link>
                    <button className="flex w-full items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted text-sm civic-transition" onClick={() => { signOut(); setShowUserMenu(false); navigate('/home'); }}>
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowSigninMenu(prev => !prev)} aria-haspopup="menu" aria-expanded={showSigninMenu}>
                  <Icon name="LogIn" size={18} />
                  <span className="ml-2 hidden lg:inline font-medium">Sign In</span>
                  <Icon name={showSigninMenu ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </Button>
                {showSigninMenu && (
                  <div className="absolute right-0 mt-2 w-48 civic-card p-2 space-y-1 border border-border rounded-lg shadow-lg z-50">
                    {['user','admin','authority'].map(r => (
                      <button key={r} className="flex w-full items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted text-sm civic-transition capitalize" onClick={() => { signIn(r); setShowSigninMenu(false); navigate('/profile'); }}>
                        <Icon name={r === 'admin' ? 'Shield' : r === 'authority' ? 'Award' : 'User'} size={16} />
                        <span>{r}</span>
                      </button>
                    ))}
                    <div className="border-t border-border mt-1 pt-1">
                      <Link to="/login" onClick={() => setShowSigninMenu(false)} className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted text-sm civic-transition">
                        <Icon name="Key" size={16} />
                        <span>Full Login Page</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface border-t border-border civic-shadow-card">
            <nav className="px-4 py-3 space-y-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg civic-transition ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text-secondary hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span className="font-medium">{item?.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Actions */}
              <div className="pt-3 mt-3 border-t border-border">
                {authenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted civic-transition"
                    >
                      <Icon name="User" size={20} />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button className="flex items-center space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted civic-transition w-full" onClick={() => { signOut(); setIsMobileMenuOpen(false); navigate('/home'); }}>
                      <Icon name="LogOut" size={20} />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 text-xs text-text-secondary">Quick Sign In</div>
                    {['user','admin','authority'].map(r => (
                      <button key={r} onClick={() => { signIn(r); setIsMobileMenuOpen(false); navigate('/profile'); }} className="flex items-center space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted civic-transition w-full capitalize">
                        <Icon name={r === 'admin' ? 'Shield' : r === 'authority' ? 'Award' : 'User'} size={20} />
                        <span className="font-medium">{r}</span>
                      </button>
                    ))}
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted civic-transition"
                    >
                      <Icon name="Key" size={20} />
                      <span className="font-medium">Full Login Page</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      {/* Mobile Floating Action Button */}
      <Link
        to="/report-issue"
        className="md:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full civic-shadow-modal civic-transition hover:scale-105 active:scale-95"
      >
        <Icon name="Plus" size={24} />
      </Link>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;