import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Roles: 'admin' | 'user' | 'authority'
// For now we mock authentication and persist minimal session in localStorage.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, role, name }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('authSession');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed?.user || null);
      } catch (e) {
        console.warn('Failed to parse authSession');
      }
    }
    setLoading(false);
  }, []);

  const signIn = useCallback((role, overrides = {}) => {
    // Mock profile data based on role
    const baseUser = {
      role,
      email: overrides.email || `${role}@example.com`,
      name: overrides.name || (role === 'admin' ? 'Administrator' : role === 'authority' ? 'Authority Member' : 'Citizen User')
    };
    setUser(baseUser);
    localStorage.setItem('authSession', JSON.stringify({ user: baseUser, loginTime: Date.now() }));
    return baseUser;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authSession');
  }, []);

  const value = { user, loading, authenticated: !!user, role: user?.role, signIn, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
