import React from 'react';
import Icon from '../../../components/AppIcon';

const IssueStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Issues',
      value: stats?.total,
      icon: 'FileText',
      color: 'text-primary'
    },
    {
      label: 'In Discussion',
      value: stats?.inDiscussion,
      icon: 'MessageSquare',
      color: 'text-warning'
    },
    {
      label: 'Under Review',
      value: stats?.underReview,
      icon: 'Eye',
      color: 'text-accent'
    },
    {
      label: 'Resolved',
      value: stats?.resolved,
      icon: 'CheckCircle',
      color: 'text-success'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems?.map((item, index) => (
        <div key={index} className="civic-card p-4 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-3`}>
            <Icon name={item?.icon} size={24} className={item?.color} />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{item?.value}</p>
            <p className="text-sm text-text-secondary">{item?.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IssueStats;
