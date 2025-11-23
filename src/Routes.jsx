import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import Home from './pages/home';
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import MapView from './pages/map-view';
import Community from './pages/community';
import Login from './pages/login';
import Register from './pages/register';
import RoleSelection from './pages/role-selection';
import ReportIssue from './pages/report-issue';
import Issues from './pages/issue';
import Profile from './pages/profile';
import Admin from './pages/admin';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<MapView />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map-view" element={<MapView />} />
        <Route path="/community" element={<Community />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
  <Route path="/report-issue" element={<ReportIssue />} />
  <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
