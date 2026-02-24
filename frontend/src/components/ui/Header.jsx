import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import Icon from '../AppIcon';
import Button from './Button';
import { useNotifications } from '../../context/NotificationContext';

const STATUS_ICONS = {
  'Resolved': 'CheckCircle',
  'Rejected': 'XCircle',
  'In Progress': 'Clock',
  'Under Review': 'Eye',
  'In Discussion': 'MessageSquare',
  'Submitted': 'FileText',
  'Closed': 'Lock',
};

const STATUS_COLORS = {
  'Resolved': 'text-green-500',
  'Rejected': 'text-red-500',
  'In Progress': 'text-blue-500',
  'Under Review': 'text-amber-500',
  'In Discussion': 'text-purple-500',
  'Submitted': 'text-gray-500',
  'Closed': 'text-gray-400',
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const notifRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <Link to="/home" className="flex items-center ml-40 hover:scale-105 transition-transform duration-200">
            <img 
              src="/e-speak.png" 
              alt="E-speak" 
              className="h-32 w-auto"
            />
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
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Notifications"
                onClick={() => { setShowNotifications(prev => !prev); setShowUserMenu(false); }}
              >
                <Icon name="Bell" size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Icon name="BellOff" size={20} className="text-text-secondary" />
                        </div>
                        <p className="text-sm text-text-secondary font-medium">No notifications yet</p>
                        <p className="text-xs text-text-secondary mt-1">We'll notify you when your issues are updated</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif.id);
                            setShowNotifications(false);
                            navigate(`/issue/${notif.issueId}`);
                          }}
                          className={`w-full text-left px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/70 ${
                            !notif.isRead ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Status Icon */}
                            <div className={`mt-0.5 flex-shrink-0 ${STATUS_COLORS[notif.newStatus] || 'text-gray-500'}`}>
                              <Icon name={STATUS_ICONS[notif.newStatus] || 'Bell'} size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                                  {notif.issueTitle}
                                </p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-text-secondary">{notif.oldStatus}</span>
                                <Icon name="ArrowRight" size={10} className="text-text-secondary" />
                                <span className={`text-xs font-medium ${STATUS_COLORS[notif.newStatus] || 'text-text-secondary'}`}>
                                  {notif.newStatus}
                                </span>
                              </div>
                              <p className="text-[11px] text-text-secondary mt-1">{timeAgo(notif.createdAt)}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {isSignedIn ? (
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowUserMenu(prev => !prev)} aria-haspopup="menu" aria-expanded={showUserMenu}>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                    {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                  </div>
                  <span className="ml-2 hidden lg:inline font-medium">{user?.fullName || user?.firstName || 'User'}</span>
                  <Icon name={showUserMenu ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </Button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 civic-card p-2 space-y-1 border border-border rounded-lg shadow-lg z-50">
                    <div className="px-3 py-2 text-sm text-text-secondary">
                      Signed in as <span className="font-medium text-foreground">{user?.emailAddresses?.[0]?.emailAddress}</span>
                      {user?.unsafeMetadata?.role && (
                        <div className="text-xs mt-1 capitalize">Role: {user.unsafeMetadata.role}</div>
                      )}
                    </div>
                    <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted text-sm civic-transition" onClick={() => setShowUserMenu(false)}>
                      <Icon name="User" size={16} />
                      <span>Profile</span>
                    </Link>
                    <button className="flex w-full items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted text-sm civic-transition" onClick={async () => { await signOut(); setShowUserMenu(false); navigate('/home'); }}>
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-foreground hover:bg-muted civic-transition"
                >
                  <Icon name="LogIn" size={16} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 civic-transition"
                >
                  <Icon name="UserPlus" size={16} />
                  <span>Register</span>
                </Link>
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
                {isSignedIn ? (
                  <>
                    <div className="px-3 py-2 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                          {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user?.fullName || user?.firstName || 'User'}</div>
                          <div className="text-xs text-text-secondary">{user?.emailAddresses?.[0]?.emailAddress}</div>
                        </div>
                      </div>
                    </div>
                    {/* Mobile Notifications Link */}
                    <button
                      onClick={() => { setShowNotifications(prev => !prev); }}
                      className="flex items-center justify-between space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted civic-transition w-full"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon name="Bell" size={20} />
                        <span className="font-medium">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted civic-transition"
                    >
                      <Icon name="User" size={20} />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button className="flex items-center space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted civic-transition w-full" onClick={async () => { await signOut(); setIsMobileMenuOpen(false); navigate('/home'); }}>
                      <Icon name="LogOut" size={20} />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted civic-transition"
                    >
                      <Icon name="LogIn" size={20} />
                      <span className="font-medium">Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 civic-transition"
                    >
                      <Icon name="UserPlus" size={20} />
                      <span className="font-medium">Register</span>
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