import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PollCard = ({ poll, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(poll?.hasUserVoted);

  const handleVote = () => {
    if (selectedOption !== null && !hasVoted) {
      onVote(poll?.id, selectedOption);
      setHasVoted(true);
    }
  };

  const getTotalVotes = () => {
    return poll?.options?.reduce((total, option) => total + option?.votes, 0);
  };

  const getVotePercentage = (votes) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(poll.endDate);
    const diff = endDate - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="civic-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{poll?.title}</h3>
          <p className="text-text-secondary text-sm mb-3">{poll?.description}</p>
          
          <div className="flex items-center space-x-4 text-xs text-text-secondary">
            <span className="flex items-center space-x-1">
              <Icon name="Users" size={14} />
              <span>{getTotalVotes()} votes</span>
            </span>
            <span className="flex items-center space-x-1">
              <Icon name="Clock" size={14} />
              <span>{getTimeRemaining()}</span>
            </span>
            <span className={`civic-status-indicator ${
              poll?.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-text-secondary'
            }`}>
              {poll?.status}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Icon name="MessageCircle" size={16} />
            <span className="ml-1">{poll?.commentsCount}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="Share2" size={16} />
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {poll?.options?.map((option, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer flex-1">
                <input
                  type="radio"
                  name={`poll-${poll?.id}`}
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  disabled={hasVoted || poll?.status !== 'active'}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                />
                <span className="text-sm font-medium text-foreground">{option?.text}</span>
              </label>
              
              {hasVoted && (
                <span className="text-sm font-medium text-text-secondary">
                  {getVotePercentage(option?.votes)}%
                </span>
              )}
            </div>
            
            {hasVoted && (
              <div className="ml-7">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getVotePercentage(option?.votes)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {!hasVoted && poll?.status === 'active' && (
        <div className="pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleVote}
            disabled={selectedOption === null}
            className="w-full"
          >
            Cast Vote
          </Button>
        </div>
      )}
      {hasVoted && (
        <div className="pt-2 text-center">
          <span className="text-sm text-success font-medium">✓ You have voted</span>
        </div>
      )}
    </div>
  );
};

export default PollCard;
