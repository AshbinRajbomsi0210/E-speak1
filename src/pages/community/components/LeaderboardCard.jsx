import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';


const LeaderboardCard = ({ leaders }) => {
  const getBadgeIcon = (badge) => {
    const badgeIcons = {
      'Top Reporter': 'Award',
      'Community Helper': 'Heart',
      'Problem Solver': 'CheckCircle',
      'Civic Champion': 'Star',
      'Active Voter': 'Vote',
      'Discussion Leader': 'MessageSquare'
    };
    return badgeIcons?.[badge] || 'Award';
  };

  const getBadgeColor = (badge) => {
    const badgeColors = {
      'Top Reporter': 'text-yellow-600',
      'Community Helper': 'text-red-500',
      'Problem Solver': 'text-green-600',
      'Civic Champion': 'text-purple-600',
      'Active Voter': 'text-blue-600',
      'Discussion Leader': 'text-indigo-600'
    };
    return badgeColors?.[badge] || 'text-gray-600';
  };

  return (
    <div className="civic-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Community Leaders</h3>
        <Button variant="ghost" size="sm">
          <Icon name="Trophy" size={16} />
          <span className="ml-1">View All</span>
        </Button>
      </div>
      <div className="space-y-4">
        {leaders?.map((leader, index) => (
          <div key={leader?.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 civic-transition">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {index + 1}
            </div>
            
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={leader?.avatar}
                alt={leader?.avatarAlt}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-foreground truncate">{leader?.name}</h4>
                {leader?.topBadge && (
                  <Icon
                    name={getBadgeIcon(leader?.topBadge)}
                    size={14}
                    className={getBadgeColor(leader?.topBadge)}
                  />
                )}
              </div>
              <p className="text-xs text-text-secondary">{leader?.points} points</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{leader?.level}</div>
              <div className="text-xs text-text-secondary">{leader?.recentActivity}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <Button variant="outline" size="sm" className="w-full">
            View Full Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;
