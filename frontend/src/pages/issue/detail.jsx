import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import VoteButtons from '../../components/VoteButtons';

// Helper function to get or create a unique visitor ID for anonymous users
const getVisitorId = () => {
  let visitorId = localStorage.getItem('e_speak_visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('e_speak_visitor_id', visitorId);
  }
  return visitorId;
};

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [issue, setIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const viewIncrementedRef = useRef(false);

  useEffect(() => {
    fetchIssueDetail();
    fetchComments();
    // Increment view count only once
    if (!viewIncrementedRef.current) {
      incrementViewCount();
      viewIncrementedRef.current = true;
    }
    // Scroll to comments if hash is present
    if (window.location.hash === '#comments') {
      setTimeout(() => {
        document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [id]);

  useEffect(() => {
    if (isSignedIn && user?.emailAddresses?.[0]?.emailAddress && issue) {
      checkUserVote();
    }
  }, [isSignedIn, user, issue?.id]);

  const fetchIssueDetail = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issues/${id}/`);
      const data = await response.json();
      
      if (data.success) {
        const issueData = data.data;
        setIssue({
          id: issueData.id,
          reportId: issueData.report_id,
          title: issueData.title,
          description: issueData.description,
          category: issueData.category,
          status: issueData.status,
          priority: issueData.priority,
          location: issueData.address,
          latitude: issueData.latitude,
          longitude: issueData.longitude,
          images: issueData.photos?.map(p => p.image) || [],
          upvotes: issueData.upvotes || 0,
          downvotes: issueData.downvotes || 0,
          voteScore: issueData.voteScore || 0,
          views: issueData.views || 0,
          commentCount: issueData.commentCount || 0,
          isAnonymous: issueData.isAnonymous || false,
          reporter: {
            name: issueData.displayName || issueData.reporterName || 'Anonymous',
            email: issueData.reporterEmail || ''
          },
          createdAt: new Date(issueData.created_at),
          updatedAt: new Date(issueData.updated_at)
        });
      }
    } catch (error) {
      console.error('Error fetching issue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      // Use email for logged-in users, visitor ID for anonymous users
      const viewerId = isSignedIn && user?.emailAddresses?.[0]?.emailAddress 
        ? user.emailAddresses[0].emailAddress 
        : getVisitorId();
      
      await fetch(`http://127.0.0.1:8000/api/issues/${id}/increment-views/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewer_id: viewerId })
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const checkUserVote = async () => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    if (!userEmail) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/issues/${id}/check-upvote/?voter_email=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setIssue(prev => ({
          ...prev,
          userVote: data.data?.vote_type || null
        }));
      }
    } catch (error) {
      console.error('Error checking vote:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issues/${id}/comments/`);
      const data = await response.json();
      
      console.log('Comments Response:', data);
      console.log('Comments Data:', data.data);
      
      if (data.success) {
        setComments(data.data || []);
      } else {
        console.error('Failed to fetch comments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!isSignedIn) {
      navigate('/login', { state: { from: `/issue/${id}` } });
      return;
    }

    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    if (!userEmail) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issues/${id}/vote/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          voter_email: userEmail,
          vote_type: voteType 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIssue(prev => ({
          ...prev,
          upvotes: data.data.upvotes,
          downvotes: data.data.downvotes,
          voteScore: data.data.voteScore,
          userVote: data.data.userVote
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      navigate('/login', { state: { from: `/issue/${id}` } });
      return;
    }

    if (!newComment.trim()) return;

    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const userName = user?.fullName || user?.firstName || 'Anonymous';
    
    setIsSubmittingComment(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issues/${id}/comments/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: userName,
          comment: newComment
        })
      });

      const data = await response.json();
      
      console.log('Comment Response:', data);
      console.log('Response Status:', response.status);
      
      if (data.success) {
        setNewComment('');
        fetchComments();
        setIssue(prev => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1
        }));
      } else {
        console.error('Comment Error:', data);
        alert(data.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment: ' + error.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issues/${id}/comments/${commentId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail
        })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchComments();
        setIssue(prev => ({
          ...prev,
          commentCount: Math.max(0, (prev.commentCount || 0) - 1)
        }));
        setDeleteConfirmId(null);
      } else {
        alert(data.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this civic issue: ${issue?.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: issue?.title,
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Discussion':
        return 'bg-warning text-warning-foreground';
      case 'Under Review':
        return 'bg-accent text-accent-foreground';
      case 'Adopted':
        return 'bg-primary text-primary-foreground';
      case 'Resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Infrastructure':
        return 'bg-blue-100 text-blue-800';
      case 'Public Safety':
        return 'bg-red-100 text-red-800';
      case 'Environment':
        return 'bg-green-100 text-green-800';
      case 'Transportation':
        return 'bg-purple-100 text-purple-800';
      case 'Health':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Issue Not Found</h2>
            <p className="text-text-secondary mb-6">The issue you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/issues">Back to Issues</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/issues">
              <Icon name="ArrowLeft" size={16} />
              <span className="ml-2">Back to Issues</span>
            </Link>
          </Button>

          {/* Issue Content */}
          <div className="civic-card p-8 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`civic-status-indicator ${getCategoryColor(issue.category)}`}>
                    {issue.category}
                  </span>
                  <span className="text-sm text-text-secondary">
                    Report ID: {issue.reportId}
                  </span>
                </div>
                <span className={`civic-status-indicator ${getStatusColor(issue.status)}`}>
                  {issue.status}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-foreground">
                {issue.title}
              </h1>

              <div className="flex items-center justify-between text-sm text-text-secondary">
                <div className="flex items-center space-x-4">
                  <span>Reported by {issue.reporter.name}</span>
                  <span>•</span>
                  <span>{formatDate(issue.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div className={`grid gap-4 ${issue.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {issue.images.map((img, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt={`Issue photo ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-text-secondary whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>

            {/* Location */}
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <div className="flex items-start space-x-2">
                <Icon name="MapPin" size={20} className="text-primary mt-1" />
                <div>
                  <p className="text-text-secondary">{issue.location}</p>
                  {issue.latitude && issue.longitude && (
                    <p className="text-sm text-text-secondary">
                      Coordinates: {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <VoteButtons
                    voteScore={issue.voteScore}
                    userVote={issue.userVote}
                    onVote={handleVote}
                    size="medium"
                    className="bg-muted/50 border border-border"
                  />
                  
                  <a
                    href="#comments"
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-muted/50 border border-border hover:bg-muted text-text-secondary hover:text-foreground civic-transition"
                  >
                    <Icon name="MessageCircle" size={20} />
                    <span className="text-sm font-bold">{issue.commentCount || 0}</span>
                  </a>

                  <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-text-secondary">
                    <Icon name="Eye" size={20} />
                    <span className="text-sm font-bold">{issue.views || 0}</span>
                  </div>
                </div>

                <Button variant="outline" onClick={handleShare}>
                  <Icon name="Share2" size={16} />
                  <span className="ml-2">Share</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div id="comments" className="mt-8 civic-card p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Icon name="MessageCircle" size={24} className="text-primary" />
                <span>Comments ({issue.commentCount || 0})</span>
              </h2>
            </div>

            {/* Comment Form */}
            {isSignedIn ? (
              <div className="bg-muted/30 rounded-lg p-6 border border-border">
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                      {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full px-4 py-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-text-secondary"
                        rows="4"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? (
                        <>
                          <Icon name="Loader" size={16} className="animate-spin" />
                          <span className="ml-2">Posting...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Send" size={16} />
                          <span className="ml-2">Post Comment</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
                <Icon name="Lock" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-text-secondary mb-4 text-lg">
                  Sign in to join the conversation
                </p>
                <Button asChild>
                  <Link to="/login" state={{ from: `/issue/${id}` }}>
                    <Icon name="LogIn" size={16} />
                    <span className="ml-2">Sign In to Comment</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => {
                  const isOwnComment = user?.emailAddresses?.[0]?.emailAddress === comment.userEmail;
                  
                  return (
                    <div key={comment.id}>
                      <div className="bg-background border border-border rounded-lg p-5 hover:bg-muted/20 civic-transition">
                        <div className="flex items-start space-x-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                            {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          
                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-foreground">{comment.userName}</span>
                                {isOwnComment && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    You
                                  </span>
                                )}
                                <span className="text-xs text-text-secondary">•</span>
                                <span className="text-sm text-text-secondary">
                                  {formatDate(new Date(comment.createdAt))}
                                </span>
                              </div>
                              
                              {/* Delete Button (only for own comments) */}
                              {isOwnComment && (
                                <button
                                  onClick={() => setDeleteConfirmId(comment.id)}
                                  className="p-2 rounded-md hover:bg-red-50 text-text-secondary hover:text-red-600 civic-transition"
                                  title="Delete comment"
                                >
                                  <Icon name="Trash2" size={16} />
                                </button>
                              )}
                            </div>
                            
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed text-left">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delete Confirmation Modal */}
                      {deleteConfirmId === comment.id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                          <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Icon name="AlertTriangle" size={24} className="text-red-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">Delete Comment</h3>
                                <p className="text-sm text-text-secondary">This action cannot be undone</p>
                              </div>
                            </div>
                            
                            <p className="text-foreground text-left">
                              Are you sure you want to delete this comment? It will be permanently removed from this issue.
                            </p>

                            <div className="flex items-center justify-end space-x-3 pt-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="default"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Icon name="Trash2" size={16} />
                                <span className="ml-2">Delete Comment</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <Icon name="MessageSquare" size={56} className="mx-auto mb-3 text-muted-foreground opacity-40" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No comments yet</h3>
                  <p className="text-sm text-text-secondary">
                    Be the first to share your thoughts on this issue
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IssueDetail;
