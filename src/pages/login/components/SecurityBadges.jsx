import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'SSL Encrypted',
      description: 'Your data is protected with 256-bit encryption'
    },
    {
      icon: 'Lock',
      title: 'Secure Authentication',
      description: 'Multi-layer security verification'
    },
    {
      icon: 'CheckCircle',
      title: 'Government Verified',
      description: 'Official civic engagement platform'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground text-center">Security & Trust</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {securityFeatures?.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-success/10 rounded-full mb-2">
              <Icon name={feature?.icon} size={16} color="var(--color-success)" />
            </div>
            <h4 className="text-xs font-medium text-foreground mb-1">{feature?.title}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{feature?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityBadges;