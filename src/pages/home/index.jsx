import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import ImpactMetricsSection from './components/ImpactMetricsSection';
import RecentReportsSection from './components/RecentReportsSection';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>E-speak - Empowering Voices, Developing Communities</title>
        <meta name="description" content="Report civic issues, engage with your community, and track government responses in real-time. Your voice matters in building a better tomorrow." />
        <meta name="keywords" content="civic engagement, community issues, government response, local democracy, citizen participation" />
        <meta property="og:title" content="E-speak - Empowering Voices, Developing Communities" />
        <meta property="og:description" content="Report civic issues, engage with your community, and track government responses in real-time." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <HeroSection />
          <HowItWorksSection />
          <ImpactMetricsSection />
          <RecentReportsSection />
        </main>

        {/* Footer */}
        <footer className="bg-foreground text-white py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                    <span className="text-white font-bold text-sm">E</span>
                  </div>
                  <span className="text-xl font-semibold">E-speak</span>
                </div>
                <p className="text-gray-300 mb-4 max-w-md">
                  Empowering citizens to report issues, engage with communities, and drive positive change through transparent civic participation.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-white civic-transition">
                    <span className="sr-only">Facebook</span>
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white civic-transition">
                    <span className="sr-only">Twitter</span>
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white civic-transition">
                    <span className="sr-only">LinkedIn</span>
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/report-issue" className="text-gray-300 hover:text-white civic-transition">Report Issue</a></li>
                  <li><a href="/map-view" className="text-gray-300 hover:text-white civic-transition">Map View</a></li>
                  <li><a href="/issues" className="text-gray-300 hover:text-white civic-transition">Browse Issues</a></li>
                  <li><a href="/community" className="text-gray-300 hover:text-white civic-transition">Community</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white civic-transition">Help Center</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white civic-transition">Contact Us</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white civic-transition">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white civic-transition">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm">
                © {new Date()?.getFullYear()} E-speak. All rights reserved.
              </p>
              <p className="text-gray-300 text-sm mt-2 md:mt-0">
                Building stronger communities together
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;