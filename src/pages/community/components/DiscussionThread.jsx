import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const DiscussionThread = ({ discussions }) => {
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [newComment, setNewComment] = useState('');

  const toggleThread = (threadId) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded?.has(threadId)) {
      newExpanded?.delete(threadId);
    } else {
      newExpanded?.add(threadId);
    }
    setExpandedThreads(newExpanded);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleAddComment = (threadId) => {
    if (newComment?.trim()) {
      // In a real app, this would make an API call
      console.log('Adding comment to thread:', threadId, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="civic-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Active Discussions</h3>
        <Button variant="ghost" size="sm">
          <Icon name="MessageSquare" size={16} />
          <span className="ml-1">New Topic</span>
        </Button>
      </div>
      <div className="space-y-4">
        {discussions?.map((thread) => (
          <div key={thread?.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={thread?.author?.avatar}
                    alt={thread?.author?.avatarAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-foreground">{thread?.author?.name}</h4>
                    <span className="text-xs text-text-secondary">
                      {formatTimeAgo(thread?.createdAt)}
                    </span>
                    {thread?.isPinned && (
                      <Icon name="Pin" size={12} className="text-primary" />
                    )}
                  </div>
                  
                  <h5 className="font-medium text-foreground mb-2">{thread?.title}</h5>
                  <p className="text-sm text-text-secondary">{thread?.preview}</p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      onClick={() => toggleThread(thread?.id)}
                      className="flex items-center space-x-1 text-xs text-primary hover:underline"
                    >
                      <Icon name="MessageCircle" size={12} />
                      <span>{thread?.repliesCount} replies</span>
                    </button>
                    
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Icon name="Eye" size={12} />
                      <span>{thread?.views} views</span>
                    </div>
                    
                    <div className={`civic-status-indicator ${
                      thread?.category === 'infrastructure' ? 'bg-blue-100 text-blue-800' :
                      thread?.category === 'environment'? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {thread?.category}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Icon name="ThumbsUp" size={14} />
                  <span className="ml-1">{thread?.upvotes}</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="MoreHorizontal" size={14} />
                </Button>
              </div>
            </div>
            
            {expandedThreads?.has(thread?.id) && (
              <div className="pl-11 space-y-3 border-t border-border pt-3">
                {thread?.replies?.map((reply) => (
                  <div key={reply?.id} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={reply?.author?.avatar}
                        alt={reply?.author?.avatarAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground text-sm">{reply?.author?.name}</span>
                        <span className="text-xs text-text-secondary">
                          {formatTimeAgo(reply?.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{reply?.content}</p>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Icon name="ThumbsUp" size={12} />
                          <span className="ml-1">{reply?.upvotes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center space-x-3 mt-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={12} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e?.target?.value)}
                      className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(thread?.id)}
                      disabled={!newComment?.trim()}
                    >
                      <Icon name="Send" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full">
          Load More Discussions
        </Button>
      </div>
    </div>
  );
};

export default DiscussionThread;
