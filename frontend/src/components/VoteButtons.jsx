import React from 'react';
import Icon from './AppIcon';

const VoteButtons = ({ voteScore, userVote, onVote, size = 'medium', className = '' }) => {
  const sizes = {
    small: {
      button: 'w-8 h-8',
      icon: 20,
      text: 'text-sm'
    },
    medium: {
      button: 'w-10 h-10',
      icon: 24,
      text: 'text-base'
    },
    large: {
      button: 'w-12 h-12',
      icon: 28,
      text: 'text-lg'
    }
  };

  const config = sizes[size];

  const formatScore = (score) => {
    // Handle undefined, null, or NaN
    const numScore = Number(score);
    if (isNaN(numScore)) return 0;
    
    if (Math.abs(numScore) >= 1000000) {
      return `${(numScore / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(numScore) >= 1000) {
      return `${(numScore / 1000).toFixed(1)}K`;
    }
    return numScore;
  };

  const getScoreColor = () => {
    if (userVote === 'up') return 'text-orange-500';
    if (userVote === 'down') return 'text-blue-500';
    if (voteScore > 0) return 'text-text-secondary';
    if (voteScore < 0) return 'text-text-secondary';
    return 'text-text-secondary';
  };

  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-2 ${className}`}>
      {/* Upvote Button */}
      <button
        onClick={() => onVote('up')}
        className={`flex items-center justify-center rounded-md hover:bg-background/80 civic-transition
          ${userVote === 'up' ? 'text-orange-500' : 'text-text-secondary hover:text-orange-500'}`}
        title="Upvote"
      >
        <Icon 
          name="ArrowUp" 
          size={config.icon}
          strokeWidth={userVote === 'up' ? 3.5 : 3}
        />
      </button>

      {/* Vote Score */}
      <span className={`${config.text} font-bold min-w-[2.5rem] text-center ${getScoreColor()}`}>
        {formatScore(voteScore)}
      </span>
    </div>
  );
};

export default VoteButtons;
