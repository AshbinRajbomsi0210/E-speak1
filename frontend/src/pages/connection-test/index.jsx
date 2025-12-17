import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import Button from '../../components/ui/Button';

const ConnectionTest = () => {
  const { user, isLoaded } = useUser();
  const [testResults, setTestResults] = useState({
    frontend: { status: 'pending', message: '', details: '' },
    clerk: { status: 'pending', message: '', details: '' },
    backend: { status: 'pending', message: '', details: '' },
    database: { status: 'pending', message: '', details: '' },
    clerkAuth: { status: 'pending', message: '', details: '' }
  });
  const [loading, setLoading] = useState(false);

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '⏳';
    }
  };

  const testBackend = async () => {
    setLoading(true);
    const newResults = { ...testResults };

    // Test 1: Frontend
    try {
      newResults.frontend = {
        status: 'success',
        message: 'Frontend is running',
        details: `React app loaded successfully at ${window.location.origin}`
      };
    } catch (error) {
      newResults.frontend = {
        status: 'error',
        message: 'Frontend error',
        details: error.message
      };
    }

    // Test 2: Clerk
    try {
      if (isLoaded && user) {
        newResults.clerk = {
          status: 'success',
          message: 'Clerk authentication active',
          details: `Logged in as: ${user.primaryEmailAddress?.emailAddress || 'Unknown'}`
        };
      } else if (isLoaded && !user) {
        newResults.clerk = {
          status: 'warning',
          message: 'Clerk loaded but no user logged in',
          details: 'Please log in to test full authentication'
        };
      } else {
        newResults.clerk = {
          status: 'warning',
          message: 'Clerk is loading',
          details: 'Please wait...'
        };
      }
    } catch (error) {
      newResults.clerk = {
        status: 'error',
        message: 'Clerk error',
        details: error.message
      };
    }

    // Test 3: Backend Health
    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/test/health/');
      const data = await response.json();
      
      if (response.ok) {
        newResults.backend = {
          status: 'success',
          message: 'Backend is running',
          details: `Django server: ${data.status}, Database: ${data.database}`
        };
      } else {
        newResults.backend = {
          status: 'error',
          message: 'Backend error',
          details: `Status ${response.status}: ${JSON.stringify(data)}`
        };
      }
    } catch (error) {
      newResults.backend = {
        status: 'error',
        message: 'Cannot connect to backend',
        details: `Error: ${error.message}. Make sure Django server is running on http://127.0.0.1:8000`
      };
    }

    // Test 4: Database
    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/test/database/');
      const data = await response.json();
      
      if (response.ok) {
        newResults.database = {
          status: 'success',
          message: 'Database connected',
          details: `PostgreSQL ${data.version}, Users: ${data.user_count}`
        };
      } else {
        newResults.database = {
          status: 'error',
          message: 'Database error',
          details: `Status ${response.status}`
        };
      }
    } catch (error) {
      newResults.database = {
        status: 'error',
        message: 'Database connection failed',
        details: error.message
      };
    }

    // Test 5: Clerk + Django Auth
    if (isLoaded && user) {
      try {
        const token = await user.getToken();
        const response = await fetch('http://127.0.0.1:8000/api/accounts/test/clerk-auth/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok) {
          newResults.clerkAuth = {
            status: 'success',
            message: 'Clerk ↔ Django authentication working',
            details: `User synced: ${data.email}, Role: ${data.role}`
          };
        } else {
          newResults.clerkAuth = {
            status: 'error',
            message: 'Authentication failed',
            details: `Status ${response.status}: ${JSON.stringify(data)}`
          };
        }
      } catch (error) {
        newResults.clerkAuth = {
          status: 'error',
          message: 'Clerk-Django auth error',
          details: error.message
        };
      }
    } else {
      newResults.clerkAuth = {
        status: 'warning',
        message: 'User not logged in',
        details: 'Please log in to test Clerk-Django authentication'
      };
    }

    setTestResults(newResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔌 Connection Test Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 mb-4">
            This page tests all system connections: Frontend, Clerk Authentication, Django Backend, PostgreSQL Database, and the integration between Clerk and Django.
          </p>
          <Button 
            onClick={testBackend} 
            disabled={loading}
            className="w-full"
          >
            {loading ? '🔍 Testing...' : '▶️ Run Connection Tests'}
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span className="text-2xl">{getStatusEmoji(result.status)}</span>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </h3>
                  <p className="text-gray-700 font-medium">{result.message}</p>
                  {result.details && (
                    <p className="text-sm text-gray-500 mt-2">{result.details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {user && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📋 Current User Info</h3>
            <p className="text-sm text-gray-700">Email: {user.primaryEmailAddress?.emailAddress}</p>
            <p className="text-sm text-gray-700">Clerk ID: {user.id}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTest;
