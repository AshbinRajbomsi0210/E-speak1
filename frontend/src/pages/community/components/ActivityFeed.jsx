import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';


const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      'issue_reported': 'AlertCircle',
      'issue_resolved': 'CheckCircle',
      'poll_created': 'Vote',
      'comment_added': 'MessageCircle',
      'vote_cast': 'ThumbsUp',
      'government_response': 'Building'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      'issue_reported': 'text-warning',
      'issue_resolved': 'text-success',
      'poll_created': 'text-primary',
      'comment_added': 'text-blue-600',
      'vote_cast': 'text-green-600',
      'government_response': 'text-purple-600'
    };
    return colors?.[type] || 'text-text-secondary';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="civic-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Button variant="ghost" size="sm">
          <Icon name="RefreshCw" size={16} />
        </Button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 civic-transition">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-muted ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={activity?.user?.avatar}
                    alt={activity?.user?.avatarAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-foreground text-sm">{activity?.user?.name}</span>
              </div>
              
              <p className="text-sm text-text-secondary mb-1">{activity?.description}</p>
              
              {activity?.relatedItem && (
                <div className="text-xs text-primary hover:underline cursor-pointer">
                  {activity?.relatedItem}
                </div>
              )}
            </div>
            
            <div className="text-xs text-text-secondary flex-shrink-0">
              {formatTimeAgo(activity?.timestamp)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full">
          View All Activity
        </Button>
      </div>
    </div>
  );
};

export default ActivityFeed;
