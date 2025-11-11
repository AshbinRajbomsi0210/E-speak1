import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ImpactMetricsSection = () => {
  const [animatedCounts, setAnimatedCounts] = useState({
    issues: 0,
    resolved: 0,
    users: 0,
    responses: 0
  });

  const finalCounts = {
    issues: 2847,
    resolved: 1923,
    users: 15642,
    responses: 3456
  };

  const metrics = [
    {
      id: 'issues',
      icon: 'AlertCircle',
      label: 'Issues Reported',
      value: animatedCounts?.issues,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'resolved',
      icon: 'CheckCircle',
      label: 'Issues Resolved',
      value: animatedCounts?.resolved,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 'users',
      icon: 'Users',
      label: 'Active Citizens',
      value: animatedCounts?.users,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'responses',
      icon: 'MessageSquare',
      label: 'Government Responses',
      value: animatedCounts?.responses,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const intervals = Object.keys(finalCounts)?.map(key => {
      const increment = finalCounts?.[key] / steps;
      let currentStep = 0;

      return setInterval(() => {
        currentStep++;
        setAnimatedCounts(prev => ({
          ...prev,
          [key]: Math.min(Math.floor(increment * currentStep), finalCounts?.[key])
        }));

        if (currentStep >= steps) {
          clearInterval(intervals?.find(interval => interval === this));
        }
      }, stepDuration);
    });

    return () => {
      intervals?.forEach(interval => clearInterval(interval));
    };
  }, []);

  const formatNumber = (num) => {
    return num?.toLocaleString();
  };

  return (
    <section className="py-16 lg:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Community Impact
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Real numbers showing how E-speak is transforming civic engagement across communities
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics?.map((metric) => (
            <div key={metric?.id} className="civic-card p-6 lg:p-8 text-center civic-card-hover">
              <div className={`w-12 h-12 lg:w-16 lg:h-16 ${metric?.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon name={metric?.icon} size={24} className={metric?.color} />
              </div>
              <div className={`text-2xl lg:text-3xl font-bold ${metric?.color} mb-2`}>
                {formatNumber(metric?.value)}
              </div>
              <p className="text-sm lg:text-base text-text-secondary font-medium">
                {metric?.label}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="civic-card p-6 lg:p-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                <Icon name="TrendingUp" size={20} className="text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Resolution Rate</h3>
                <p className="text-text-secondary">Average issue resolution</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-success mb-2">67.5%</div>
            <p className="text-sm text-text-secondary">
              Issues successfully resolved within 30 days
            </p>
          </div>

          <div className="civic-card p-6 lg:p-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Icon name="Clock" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Response Time</h3>
                <p className="text-text-secondary">Average government response</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-primary mb-2">4.2 days</div>
            <p className="text-sm text-text-secondary">
              From issue report to official acknowledgment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactMetricsSection;