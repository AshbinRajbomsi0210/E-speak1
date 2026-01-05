import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const UserProgress = ({ userStats }) => {
  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getBadgeIcon = (badgeType) => {
    const badgeIcons = {
      'top_reporter': 'Award',
      'community_helper': 'Heart',
      'problem_solver': 'CheckCircle',
      'civic_champion': 'Star',
      'active_voter': 'Vote',
      'discussion_leader': 'MessageSquare'
    };
    return badgeIcons?.[badgeType] || 'Award';
  };

  const getBadgeColor = (badgeType) => {
    const badgeColors = {
      'top_reporter': 'text-yellow-600 bg-yellow-100',
      'community_helper': 'text-red-500 bg-red-100',
      'problem_solver': 'text-green-600 bg-green-100',
      'civic_champion': 'text-purple-600 bg-purple-100',
      'active_voter': 'text-blue-600 bg-blue-100',
      'discussion_leader': 'text-indigo-600 bg-indigo-100'
    };
    return badgeColors?.[badgeType] || 'text-gray-600 bg-gray-100';
  };

  const getLevelName = (level) => {
    const levels = {
      'rising_star': 'Rising Star',
      'engaged_voter': 'Engaged Voter',
      'active_citizen': 'Active Citizen',
      'community_helper': 'Community Helper',
      'civic_champion': 'Civic Champion'
    };
    return levels[level] || level;
  };

  if (!userStats) return null;

  return (
    <div className="civic-card p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="User" size={32} className="text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">Your Progress</h3>
          <p className="text-text-secondary">{getLevelName(userStats?.level)}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Icon name="Star" size={14} className="text-primary" />
            <span className="text-sm text-text-secondary">{userStats?.total_points || 0} points</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {/* Badges Section */}
        {userStats?.badges && userStats.badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Earned Badges</h4>
            <div className="grid grid-cols-3 gap-2">
              {userStats.badges.map((badge, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center p-2 rounded-lg ${getBadgeColor(badge.badge_type)}`}
                >
                  <Icon name={getBadgeIcon(badge.badge_type)} size={20} />
                  <span className="text-xs font-medium mt-1 text-center">{badge.badge_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {userStats?.recent_activities && userStats.recent_activities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Recent Activities</h4>
            <div className="space-y-2">
              {userStats.recent_activities.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-success/10 rounded-lg">
                  <Icon name="Activity" size={16} className="text-success" />
                  <div className="flex-1">
                    <div className="text-xs text-text-secondary">{activity.description}</div>
                  </div>
                  {activity.points > 0 && (
                    <div className="text-xs text-success font-medium">+{activity.points}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProgress;
