import { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import Button from '../../components/ui/Button';

const TestUserSync = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testSync = async () => {
    if (!user) {
      setSyncResult({ error: 'Please log in first!' });
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      
      // Make authenticated API call - this triggers lazy sync
      const response = await fetch('http://127.0.0.1:8000/api/accounts/me/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSyncResult({
          success: true,
          message: 'User synced to PostgreSQL!',
          data: {
            email: data.email,
            role: data.role,
            clerk_user_id: user.id,
            fullName: data.fullName || 'Not set',
            phone: data.phone || 'Not set'
          }
        });
      } else {
        setSyncResult({
          error: `Sync failed: ${JSON.stringify(data)}`
        });
      }
    } catch (error) {
      setSyncResult({
        error: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🔄 Test User Sync (Lazy Sync)</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Clerk User</h2>
          {isLoaded && user ? (
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
              <p><strong>Clerk ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user.id}</code></p>
              <p><strong>Status:</strong> <span className="text-green-600">✅ Logged in</span></p>
            </div>
          ) : (
            <p className="text-gray-500">Please log in to test sync</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">How Lazy Sync Works:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>You register/login through Clerk (Frontend)</li>
            <li>Click the button below to make an API request</li>
            <li>Django receives JWT token and verifies it</li>
            <li>Django creates user in PostgreSQL (if doesn't exist)</li>
            <li>User is now synced! ✅</li>
          </ol>
        </div>

        <Button 
          onClick={testSync} 
          disabled={!user || loading}
          className="w-full mb-6"
        >
          {loading ? '⏳ Syncing...' : '🚀 Trigger User Sync to PostgreSQL'}
        </Button>

        {syncResult && (
          <div className={`rounded-lg p-6 ${syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {syncResult.success ? (
              <>
                <h3 className="text-lg font-semibold text-green-700 mb-4">
                  ✅ {syncResult.message}
                </h3>
                <div className="bg-white rounded p-4 space-y-2 text-sm">
                  <p><strong>Email:</strong> {syncResult.data.email}</p>
                  <p><strong>Role:</strong> <span className="bg-blue-100 px-2 py-1 rounded">{syncResult.data.role}</span></p>
                  <p><strong>Full Name:</strong> {syncResult.data.fullName}</p>
                  <p><strong>Phone:</strong> {syncResult.data.phone}</p>
                  <p><strong>Clerk User ID:</strong> <code className="bg-gray-100 px-1">{syncResult.data.clerk_user_id}</code></p>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm">
                    <strong>✅ Check Django Admin:</strong><br />
                    Visit <a href="http://127.0.0.1:8000/admin/accounts/customuser/" target="_blank" className="text-blue-600 underline">http://127.0.0.1:8000/admin/accounts/customuser/</a> to see this user!
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-red-700 mb-2">❌ Sync Failed</h3>
                <p className="text-sm">{syncResult.error}</p>
              </>
            )}
          </div>
        )}

        {!user && isLoaded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm">
              <strong>⚠️ Not logged in.</strong> Please <a href="/login" className="text-blue-600 underline">login</a> or <a href="/register" className="text-blue-600 underline">register</a> first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUserSync;
