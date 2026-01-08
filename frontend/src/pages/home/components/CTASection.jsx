import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const CTASection = () => {
  const [stats, setStats] = useState({
    resolved: 0,
    users: 0,
    satisfaction: 98
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/issues/stats/');
      const data = await response.json();
      
      if (data.success) {
        setStats({
          resolved: data.data.by_status['Resolved'] || 0,
          users: 156, // Placeholder - will need users API
          satisfaction: 98
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const features = [
    { icon: 'Shield', text: 'Safe & Secure' },
    { icon: 'Users', text: 'Community Driven' },
    { icon: 'TrendingUp', text: 'Real Impact' },
    { icon: 'CheckCircle', text: 'Transparent Process' }
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="bg-card rounded-2xl border border-border civic-shadow-card overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="p-8 lg:p-12">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                Ready to Make a Difference?
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Your Voice Matters in Building Better Communities
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                Join thousands of active citizens making real changes in their neighborhoods. Report issues, engage with your community, and track progress in real-time.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={feature.icon} size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/report-issue" className="flex-1 sm:flex-initial">
                  <button className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 civic-transition flex items-center justify-center space-x-2">
                    <Icon name="Plus" size={20} />
                    <span>Report an Issue</span>
                  </button>
                </Link>
                <Link to="/map-view" className="flex-1 sm:flex-initial">
                  <button className="w-full px-8 py-4 bg-card text-foreground border-2 border-border rounded-lg font-semibold hover:bg-muted civic-transition flex items-center justify-center space-x-2">
                    <Icon name="Map" size={20} />
                    <span>View Map</span>
                  </button>
                </Link>
              </div>

              <p className="text-xs text-text-secondary mt-4">
                No credit card required • Free to use • Instant access
              </p>
            </div>

            {/* Right Visual */}
            <div className="relative h-full min-h-[400px] bg-gradient-to-br from-primary/20 to-accent/20 p-8 lg:p-12">
              <div className="relative z-10 h-full flex flex-col justify-center">
                {/* Stats Cards */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-lg transform hover:scale-105 civic-transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-foreground">{stats.resolved}</span>
                      <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                        <Icon name="CheckCircle" size={20} className="text-success" />
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">Issues Resolved</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-lg transform hover:scale-105 civic-transition ml-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-foreground">{stats.users}</span>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="Users" size={20} className="text-primary" />
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">Active Citizens</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-lg transform hover:scale-105 civic-transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-foreground">{stats.satisfaction}%</span>
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Icon name="TrendingUp" size={20} className="text-accent" />
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">Satisfaction Rate</p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
