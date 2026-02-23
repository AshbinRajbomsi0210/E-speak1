import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';

// Create Auth Context
export const AuthContext = createContext(null);

export function ClerkAuthProvider({ children }) {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isSignedIn: clerkIsSignedIn, signOut: clerkSignOut } = useClerk();
  const { getToken } = useClerkAuth();
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedRole, setSelectedRole] = useState(() => {
    // Initialize from localStorage first
    return localStorage.getItem('selectedRole') || 'user';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync Clerk user to Django backend on authentication
  useEffect(() => {
    const syncUserToBackend = async () => {
      try {
        setLoading(true);

        if (!isClerkLoaded) {
          setLoading(true);
          return;
        }

        if (clerkUser) {
          // User is authenticated with Clerk
          setUser({
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            profileImage: clerkUser.profileImageUrl,
          });

          // Role priority:
          // 1. Clerk public_metadata.role (set by admin when inviting authority users)
          // 2. Clerk unsafe_metadata.role
          // 3. localStorage (user's own selection)
          const clerkMetaRole =
            clerkUser.publicMetadata?.role ||
            clerkUser.unsafeMetadata?.role ||
            null;
          const storedRole = clerkMetaRole || localStorage.getItem('selectedRole') || 'user';
          console.log('🔐 ClerkAuthContext: clerkMetaRole:', clerkMetaRole, '| storedRole:', storedRole);
          
          // Sync user to Django backend
          try {
            const token = await getToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accounts/users/sync/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                clerk_id: clerkUser.id,
                email: clerkUser.primaryEmailAddress?.emailAddress,
                first_name: clerkUser.firstName,
                last_name: clerkUser.lastName,
                profile_image: clerkUser.profileImageUrl,
                role: storedRole,
              }),
            });

            if (!response.ok) {
              throw new Error(`Backend sync failed: ${response.statusText}`);
            }

            const data = await response.json();
            setProfile(data);
            // Always use the role from backend response, fallback to localStorage
            const responseRole = data.role || storedRole;
            console.log('📦 Backend response role:', data.role);
            console.log('🔄 Setting selectedRole to:', responseRole);
            setSelectedRole(responseRole);
            localStorage.setItem('selectedRole', responseRole);
          } catch (backendError) {
            console.error('Backend sync error:', backendError);
            // Use the role from localStorage if backend sync fails
            setSelectedRole(storedRole);
            setProfile(null);
          }
        } else {
          // User is not authenticated
          setUser(null);
          setProfile(null);
          setSelectedRole('user');
        }

        setError(null);
      } catch (err) {
        console.error('Auth sync error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    syncUserToBackend();
  }, [clerkUser, isClerkLoaded]);

  // Update user role via backend
  // Get Clerk ID token for backend authentication
  const getAuthToken = async () => {
    if (!clerkUser) return null;
    try {
      return await getToken();
    } catch (err) {
      console.error('Failed to get token:', err);
      return null;
    }
  };

  const updateUserRole = async (newRole) => {
    if (!clerkUser) return;

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/accounts/users/role/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.statusText}`);
      }

      const data = await response.json();
      setProfile(data);
      setSelectedRole(newRole);
      localStorage.setItem('selectedRole', newRole);
      return data;
    } catch (err) {
      console.error('Failed to update role:', err);
      throw err;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await clerkSignOut();
      setUser(null);
      setProfile(null);
      setSelectedRole('user');
      localStorage.removeItem('selectedRole');
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    }
  };

  const value = {
    // User state
    user,
    profile,
    selectedRole,
    clerkUser,
    
    // Auth state
    isSignedIn: !!clerkUser,
    isLoaded: isClerkLoaded,
    loading,
    error,
    
    // Methods
    getToken: getAuthToken,
    updateUserRole,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within ClerkAuthProvider');
  }
  return context;
}
