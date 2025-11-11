import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import Home from './pages/home';
// import ScrollToTop from "components/ScrollToTop";
// import ErrorBoundary from "components/ErrorBoundary";
// import NotFound from "pages/NotFound";
import MapView from './pages/map-view';
// import Community from './pages/community';
// import Login from './pages/login';
// import ReportIssue from './pages/report-issue';
// import Issues from './pages/issues';

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
        {/* <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="*" element={<NotFound />} /> */}
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
