import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PollCard = ({ poll, onVote, onDelete, onComment, currentUserId }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(poll?.has_user_voted || poll?.hasUserVoted);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(poll?.likes_count || 0);

  const handleVote = (e) => {
    e.stopPropagation();
    if (selectedOption !== null && !hasVoted) {
      const option = poll?.options[selectedOption];
      onVote(poll?.id, option?.id);
      setHasVoted(true);
    }
  };

  const getTotalVotes = () => {
    return poll?.options?.reduce((total, option) => total + (option?.votes || option?.votes_count || 0), 0) || 0;
  };

  const getVotePercentage = (votes) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(poll?.end_date || poll?.endDate);
    const diff = endDate - now;
    
    if (diff <= 0) return { text: 'Ended', isEnded: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h left`, isEnded: false };
    if (hours > 0) return { text: `${hours}h ${minutes}m left`, isEnded: false };
    return { text: `${minutes}m left`, isEnded: false };
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(poll?.id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await onComment(poll?.id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Comment failed:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const timeInfo = getTimeRemaining();
  const totalVotes = getTotalVotes();
  const isCreator = poll?.created_by?.id === currentUserId || poll?.createdBy?.id === currentUserId;

  const getCategoryColor = (category) => {
    const colors = {
      'infrastructure': 'bg-blue-100 text-blue-700 border-blue-200',
      'environment': 'bg-green-100 text-green-700 border-green-200',
      'safety': 'bg-red-100 text-red-700 border-red-200',
      'transportation': 'bg-purple-100 text-purple-700 border-purple-200',
      'general': 'bg-gray-100 text-gray-700 border-gray-200',
      'education': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[category] || colors.general;
  };

  const getCreatorName = () => {
    const creator = poll?.created_by || poll?.createdBy;
    if (!creator) return 'Community Member';
    return creator.fullName || creator.name || creator.email?.split('@')[0] || 'Community Member';
  };

  const getCreatorInitial = () => {
    return getCreatorName().charAt(0).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Poll Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Creator Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {getCreatorInitial()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900 text-sm">
                  {getCreatorName()}
                </span>
                {formatDate(poll?.created_at || poll?.createdAt) && (
                  <>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-500 text-xs">
                      {formatDate(poll?.created_at || poll?.createdAt)}
                    </span>
                  </>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-2">{poll?.title}</h3>
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="flex items-center gap-1">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(poll?.category)}`}>
              {poll?.category}
            </span>
            
            {onDelete && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(!showDeleteConfirm); }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
                
                {/* Delete Confirmation Dropdown */}
                {showDeleteConfirm && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
                    <p className="text-sm text-gray-600 mb-3">Delete this poll?</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        {poll?.description && (
          <p className="text-gray-600 text-sm mt-3 line-clamp-2">{poll?.description}</p>
        )}
      </div>
      
      {/* Poll Options */}
      <div className="px-5 pb-4 space-y-2.5">
        {poll?.options?.map((option, index) => {
          const votes = option?.votes || option?.votes_count || 0;
          const percentage = getVotePercentage(votes);
          const isSelected = selectedOption === index;
          const isWinning = hasVoted && percentage === Math.max(...poll?.options?.map(o => getVotePercentage(o?.votes || o?.votes_count || 0)));
          
          return (
            <div 
              key={option?.id || index} 
              onClick={(e) => { e.stopPropagation(); if (!hasVoted && poll?.status === 'active') setSelectedOption(index); }}
              className={`relative rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                hasVoted 
                  ? isWinning 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 bg-gray-50'
                  : isSelected 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <div 
                  className={`absolute inset-0 transition-all duration-500 ${isWinning ? 'bg-primary/10' : 'bg-gray-100'}`}
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <div className="relative flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  {!hasVoted && poll?.status === 'active' ? (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {isSelected && <Icon name="Check" size={12} className="text-white" />}
                    </div>
                  ) : (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isWinning ? 'bg-primary' : 'bg-gray-300'}`}>
                      {isWinning && <Icon name="Check" size={12} className="text-white" />}
                    </div>
                  )}
                  <span className={`font-medium text-sm ${hasVoted && isWinning ? 'text-primary' : 'text-gray-700'}`}>
                    {option?.text}
                  </span>
                </div>
                
                {hasVoted && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{votes} votes</span>
                    <span className={`font-bold text-sm ${isWinning ? 'text-primary' : 'text-gray-600'}`}>
                      {percentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Vote Button */}
      {!hasVoted && poll?.status === 'active' && (
        <div className="px-5 pb-4">
          <Button
            variant="default"
            onClick={handleVote}
            disabled={selectedOption === null}
            className="w-full h-11 font-semibold"
          >
            <Icon name="Vote" size={18} className="mr-2" />
            Cast Your Vote
          </Button>
        </div>
      )}
      
      {/* Voted Confirmation */}
      {hasVoted && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg border border-green-200">
            <Icon name="CheckCircle" size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">You voted!</span>
          </div>
        </div>
      )}
      
      {/* Poll Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Icon name="Users" size={15} />
              <span className="font-medium">{totalVotes}</span>
              <span className="hidden sm:inline">votes</span>
            </div>
            <div className={`flex items-center gap-1.5 ${timeInfo.isEnded ? 'text-red-500' : 'text-gray-500'}`}>
              <Icon name="Clock" size={15} />
              <span className="font-medium">{timeInfo.text}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              poll?.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {poll?.status?.toUpperCase()}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`gap-1.5 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Icon name="Heart" size={16} />
              <span className="font-medium">{likeCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
              className="gap-1.5 text-gray-500 hover:text-primary"
            >
              <Icon name="MessageCircle" size={16} />
              <span className="font-medium">{poll?.comments_count || poll?.commentsCount || 0}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-primary"
            >
              <Icon name="Share2" size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 bg-white">
          <div className="p-4 space-y-4">
            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={14} className="text-primary" />
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="px-4"
                >
                  {isSubmittingComment ? (
                    <Icon name="Loader" size={14} className="animate-spin" />
                  ) : (
                    <Icon name="Send" size={14} />
                  )}
                </Button>
              </div>
            </form>
            
            {/* Comments List */}
            {poll?.comments && poll.comments.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {poll.comments.map((comment, idx) => (
                  <div key={comment?.id || idx} className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {comment?.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment?.user?.name || 'User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment?.created_at || comment?.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{comment?.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollCard;
