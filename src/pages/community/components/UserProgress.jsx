import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const UserProgress = ({ userStats }) => {
  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

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
      'Top Reporter': 'text-yellow-600 bg-yellow-100',
      'Community Helper': 'text-red-500 bg-red-100',
      'Problem Solver': 'text-green-600 bg-green-100',
      'Civic Champion': 'text-purple-600 bg-purple-100',
      'Active Voter': 'text-blue-600 bg-blue-100',
      'Discussion Leader': 'text-indigo-600 bg-indigo-100'
    };
    return badgeColors?.[badge] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="civic-card p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <Image
            src={userStats?.avatar}
            alt={userStats?.avatarAlt}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{userStats?.name}</h3>
          <p className="text-text-secondary">Level {userStats?.level} • {userStats?.title}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Icon name="MapPin" size={14} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">{userStats?.location}</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress to Level {userStats?.level + 1}</span>
            <span className="text-sm text-text-secondary">
              {userStats?.currentPoints}/{userStats?.nextLevelPoints} points
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(userStats?.currentPoints, userStats?.nextLevelPoints)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{userStats?.totalReports}</div>
            <div className="text-xs text-text-secondary">Issues Reported</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{userStats?.totalVotes}</div>
            <div className="text-xs text-text-secondary">Votes Cast</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{userStats?.totalComments}</div>
            <div className="text-xs text-text-secondary">Comments</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{userStats?.streak}</div>
            <div className="text-xs text-text-secondary">Day Streak</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Earned Badges</h4>
          <div className="grid grid-cols-3 gap-2">
            {userStats?.badges?.map((badge, index) => (
              <div
                key={index}
                className={`flex flex-col items-center p-2 rounded-lg ${getBadgeColor(badge)}`}
              >
                <Icon name={getBadgeIcon(badge)} size={20} />
                <span className="text-xs font-medium mt-1 text-center">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Achievements</h4>
          <div className="space-y-2">
            {userStats?.recentAchievements?.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-success/10 rounded-lg">
                <Icon name="Trophy" size={16} className="text-success" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{achievement?.title}</div>
                  <div className="text-xs text-text-secondary">{achievement?.description}</div>
                </div>
                <div className="text-xs text-success font-medium">+{achievement?.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProgress;
