import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PollDetailModal = ({ poll, isOpen, onClose, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(poll?.hasUserVoted);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: { name: 'John Doe', avatar: null },
      content: 'This is a great initiative! I fully support this proposal.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      upvotes: 5
    },
    {
      id: 2,
      author: { name: 'Jane Smith', avatar: null },
      content: 'I have some concerns about the implementation timeline. Can we get more details?',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      upvotes: 3
    }
  ]);

  if (!isOpen) return null;

  const handleVote = () => {
    if (selectedOption !== null && !hasVoted) {
      onVote(poll?.id, selectedOption);
      setHasVoted(true);
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: { name: 'Current User', avatar: null },
        content: comment,
        timestamp: new Date().toISOString(),
        upvotes: 0
      };
      setComments([newComment, ...comments]);
      setComment('');
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
    const endDate = new Date(poll?.endDate);
    const diff = endDate - now;
    
    if (diff <= 0) return 'Poll Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto civic-shadow-modal">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between z-10">
          <div className="flex-1 pr-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`civic-status-indicator ${
                poll?.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-text-secondary'
              }`}>
                {poll?.status}
              </span>
              <span className="text-xs text-text-secondary capitalize">• {poll?.category}</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{poll?.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span className="flex items-center space-x-1">
                <Icon name="Calendar" size={14} />
                <span>Created {formatDate(poll?.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>{getTimeRemaining()}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted civic-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
            <p className="text-text-secondary leading-relaxed">{poll?.description}</p>
          </div>

          {/* Voting Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Cast Your Vote</h3>
              <span className="text-sm text-text-secondary">{getTotalVotes()} total votes</span>
            </div>
            
            <div className="space-y-3">
              {poll?.options?.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3 cursor-pointer flex-1">
                      <input
                        type="radio"
                        name={`poll-detail-${poll?.id}`}
                        value={index}
                        checked={selectedOption === index}
                        onChange={() => setSelectedOption(index)}
                        disabled={hasVoted || poll?.status !== 'active'}
                        className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium text-foreground">{option?.text}</span>
                    </label>
                    
                    {hasVoted && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-text-secondary">{option?.votes} votes</span>
                        <span className="text-sm font-medium text-foreground">
                          {getVotePercentage(option?.votes)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {hasVoted && (
                    <div className="ml-7">
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                          style={{ width: `${getVotePercentage(option?.votes)}%` }}
                        >
                          {getVotePercentage(option?.votes) > 10 && (
                            <span className="text-xs text-white font-medium">
                              {getVotePercentage(option?.votes)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!hasVoted && poll?.status === 'active' && (
              <div className="pt-4">
                <Button
                  variant="default"
                  onClick={handleVote}
                  disabled={selectedOption === null}
                  className="w-full"
                  iconName="Check"
                  iconPosition="right"
                >
                  Cast Your Vote
                </Button>
              </div>
            )}
            {hasVoted && (
              <div className="pt-4 p-3 bg-success/10 border border-success/30 rounded-lg text-center">
                <span className="text-sm text-success font-medium flex items-center justify-center space-x-2">
                  <Icon name="CheckCircle" size={16} />
                  <span>You have successfully voted in this poll</span>
                </span>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Comments ({comments.length})
              </h3>
            </div>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="User" size={20} className="text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts on this poll..."
                    className="w-full min-h-[80px] px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring resize-vertical"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                      iconName="Send"
                      iconPosition="right"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comm) => (
                <div key={comm.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Icon name="User" size={20} className="text-text-secondary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">{comm.author.name}</span>
                        <span className="text-xs text-text-secondary">{getTimeAgo(comm.timestamp)}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{comm.content}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-xs text-text-secondary hover:text-primary civic-transition">
                        <Icon name="ThumbsUp" size={14} />
                        <span>{comm.upvotes}</span>
                      </button>
                      <button className="text-xs text-text-secondary hover:text-primary civic-transition">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <button className="flex items-center space-x-1 hover:text-primary civic-transition">
              <Icon name="Share2" size={16} />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-primary civic-transition">
              <Icon name="Bookmark" size={16} />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-primary civic-transition">
              <Icon name="Flag" size={16} />
              <span>Report</span>
            </button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PollDetailModal;
