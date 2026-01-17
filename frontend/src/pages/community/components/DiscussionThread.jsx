import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import CreateDiscussionModal from './CreateDiscussionModal';

const DiscussionThread = ({ discussions, onCreateDiscussion, onComment, onDelete }) => {
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [newComment, setNewComment] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [likedThreads, setLikedThreads] = useState(new Set());
  const [likedComments, setLikedComments] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const toggleThread = (threadId) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
    }
    setExpandedThreads(newExpanded);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const commentTime = new Date(timestamp);
    
    // Check for invalid date
    if (isNaN(commentTime.getTime())) return '';
    
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return commentTime.toLocaleDateString();
  };

  const getAuthorName = (author) => {
    if (!author) return 'Community Member';
    return author.fullName || author.name || author.email?.split('@')[0] || 'Community Member';
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(discussionId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleAddComment = async (threadId) => {
    const commentText = newComment[threadId];
    if (commentText?.trim() && onComment) {
      try {
        await onComment(threadId, commentText);
        setNewComment(prev => ({ ...prev, [threadId]: '' }));
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const handleLikeThread = (threadId) => {
    setLikedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const handleLikeComment = (commentId) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getCategoryStyles = (category) => {
    const styles = {
      infrastructure: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'Building' },
      environment: { bg: 'bg-green-100', text: 'text-green-700', icon: 'Leaf' },
      safety: { bg: 'bg-red-100', text: 'text-red-700', icon: 'Shield' },
      transportation: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'Car' },
      general: { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'MessageSquare' },
    };
    return styles[category] || styles.general;
  };

  const filteredDiscussions = discussions?.filter(d => 
    filterCategory === 'all' || d.category === filterCategory
  ) || [];

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
    }
    if (sortBy === 'popular') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    }
    if (sortBy === 'comments') {
      return (b.repliesCount || b.comments_count || 0) - (a.repliesCount || a.comments_count || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="MessageSquare" size={24} className="text-primary" />
              Community Discussions
            </h2>
            <p className="text-gray-600 mt-1">Join conversations and share your ideas</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow-lg shadow-primary/25"
          >
            <Icon name="Plus" size={18} />
            New Topic
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-primary/10">
          <div className="flex items-center gap-2">
            <Icon name="Filter" size={16} className="text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="environment">Environment</option>
              <option value="safety">Safety</option>
              <option value="transportation">Transportation</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="ArrowUpDown" size={16} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="comments">Most Comments</option>
            </select>
          </div>
          
          <span className="text-sm text-gray-500 ml-auto">
            {sortedDiscussions.length} discussion{sortedDiscussions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Discussions List */}
      <div className="space-y-4">
        {sortedDiscussions.length > 0 ? (
          sortedDiscussions.map((thread) => {
            const categoryStyle = getCategoryStyles(thread.category);
            const isExpanded = expandedThreads.has(thread.id);
            const isLiked = likedThreads.has(thread.id);
            
            return (
              <div 
                key={thread.id} 
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Thread Header */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Author Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                      {thread.author?.avatar ? (
                        <Image
                          src={thread.author.avatar}
                          alt={thread.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                          {getAuthorName(thread.author).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* Thread Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{getAuthorName(thread.author)}</span>
                        {formatTimeAgo(thread.createdAt || thread.created_at) && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{formatTimeAgo(thread.createdAt || thread.created_at)}</span>
                          </>
                        )}
                        {thread.isPinned && (
                          <span className="flex items-center gap-1 text-xs text-primary font-medium">
                            <Icon name="Pin" size={12} />
                            Pinned
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                        {thread.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {thread.preview || thread.content}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex items-center flex-wrap gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
                          <Icon name={categoryStyle.icon} size={12} />
                          {thread.category}
                        </span>
                        
                        <button 
                          onClick={() => toggleThread(thread.id)}
                          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          <Icon name="MessageCircle" size={14} />
                          <span>{thread.repliesCount || thread.comments_count || 0} replies</span>
                          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
                        </button>
                        
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Icon name="Eye" size={14} />
                          {thread.views || 0} views
                        </span>

                        {/* Like Button */}
                        <button
                          onClick={() => handleLikeThread(thread.id)}
                          className={`flex items-center gap-1.5 text-sm transition-all ${
                            isLiked 
                              ? 'text-red-500' 
                              : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <Icon name="Heart" size={14} fill={isLiked ? 'currentColor' : 'none'} />
                          <span>{(thread.upvotes || 0) + (isLiked ? 1 : 0)}</span>
                        </button>

                        {/* Delete Button */}
                        <div className="relative ml-auto">
                          <button
                            onClick={() => setDeleteConfirmId(deleteConfirmId === thread.id ? null : thread.id)}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                            title="Delete discussion"
                          >
                            <Icon name="Trash2" size={14} />
                            <span>Delete</span>
                          </button>
                          
                          {/* Delete Confirmation Dropdown - positioned above */}
                          {deleteConfirmId === thread.id && (
                            <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[100]">
                              <p className="text-sm text-gray-700 mb-3 font-medium">Delete this discussion?</p>
                              <p className="text-xs text-gray-500 mb-3">This action cannot be undone.</p>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteDiscussion(thread.id); }}
                                  disabled={isDeleting}
                                  className="flex-1 bg-red-500 hover:bg-red-600"
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Comments Section */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-5 space-y-4">
                      {/* Comments List */}
                      {thread.replies && thread.replies.length > 0 ? (
                        <div className="space-y-3">
                          {thread.replies.map((reply) => {
                            const isCommentLiked = likedComments.has(reply.id);
                            return (
                              <div key={reply.id} className="flex gap-3 bg-white rounded-xl p-3 border border-gray-100">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  {reply.author?.avatar ? (
                                    <Image
                                      src={reply.author.avatar}
                                      alt={reply.author.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium">
                                      {reply.author?.name?.charAt(0) || 'U'}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 text-sm">{getAuthorName(reply.author)}</span>
                                    {formatTimeAgo(reply.createdAt || reply.created_at) && (
                                      <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt || reply.created_at)}</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{reply.content || reply.text}</p>
                                  
                                  <div className="flex items-center gap-3 mt-2">
                                    <button 
                                      onClick={() => handleLikeComment(reply.id)}
                                      className={`flex items-center gap-1 text-xs transition-colors ${
                                        isCommentLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                      }`}
                                    >
                                      <Icon name="Heart" size={12} fill={isCommentLiked ? 'currentColor' : 'none'} />
                                      <span>{(reply.upvotes || 0) + (isCommentLiked ? 1 : 0)}</span>
                                    </button>
                                    <button className="text-xs text-gray-500 hover:text-primary transition-colors">
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 text-sm py-4">No replies yet. Be the first to respond!</p>
                      )}
                      
                      {/* Add Comment Input */}
                      <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={14} className="text-primary" />
                        </div>
                        
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={newComment[thread.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [thread.id]: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(thread.id)}
                            className="flex-1 h-10 px-4 text-sm border border-gray-300 rounded-xl bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(thread.id)}
                            disabled={!newComment[thread.id]?.trim()}
                            className="px-4"
                          >
                            <Icon name="Send" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageSquare" size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Discussions Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to start a conversation in this community!</p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Icon name="Plus" size={18} />
              Start First Discussion
            </Button>
          </div>
        )}
      </div>
      
      {/* Load More */}
      {sortedDiscussions.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="gap-2">
            <Icon name="RefreshCw" size={16} />
            Load More Discussions
          </Button>
        </div>
      )}
      
      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDiscussion={onCreateDiscussion}
      />
    </div>
  );
};

export default DiscussionThread;
