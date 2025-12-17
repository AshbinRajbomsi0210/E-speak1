import React from "react";
import {
  BrowserRouter as Router,
  Routes as RouterRoutes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import MapView from "./pages/map-view";
import Community from "./pages/community";
import Login from "./pages/login";
import Register from "./pages/register";
import RoleSelection from "./pages/role-selection";
import ReportIssue from "./pages/report-issue";
import Issues from "./pages/issue";
import Profile from "./pages/profile";
import Admin from "./pages/admin";
import ConnectionTest from "./pages/connection-test";
import TestUserSync from "./pages/test-sync";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  ClerkProvider,
  useAuth,
} from "@clerk/clerk-react";
import SSOCallback from "./pages/sso-callback";

// Inside RouterRoutes:

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
const Routes = () => {
  return (
    <>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Router>
          <ErrorBoundary>
            <ScrollToTop />
            <RouterRoutes>
              {/* routes */}
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route path="/map-view" element={<MapView />} />
              <Route path="/community" element={<Community />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/report-issue" element={<ProtectedRoute>
                <ReportIssue />
                </ProtectedRoute>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/connection-test" element={<ConnectionTest />} />
              <Route path="/test-sync" element={<TestUserSync />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/sso-callback" element={<SSOCallback />} />
            </RouterRoutes>
          </ErrorBoundary>
        </Router>
      </ClerkProvider>
    </>
  );
};

export default Routes;
