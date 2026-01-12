import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [stats, setStats] = useState({
    totalIssues: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    highPriority: 0
  });

  // Fetch user role from Django backend
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isSignedIn) return;
      
      try {
        const token = await getToken();
        const response = await fetch('http://127.0.0.1:8000/api/accounts/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
          
          // Redirect if not authority
          if (data.role !== 'authority' && data.role !== 'admin') {
            navigate('/home');
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchUserRole();
    }
  }, [isLoaded, isSignedIn, getToken, navigate]);

  // Fetch issues from backend
  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/issues/list/');
        const data = await response.json();
        
        if (data.success) {
          const transformedIssues = data.data.map(issue => ({
            id: issue.report_id,
            dbId: issue.id,
            title: issue.title,
            description: issue.description,
            category: issue.category?.toLowerCase() || 'other',
            priority: issue.priority?.toLowerCase() || 'medium',
            status: issue.status?.toLowerCase().replace(' ', '-') || 'pending',
            reporterName: issue.reporterName || 'Anonymous',
            reporterEmail: issue.reporterEmail || '',
            reporterPhone: issue.reporterPhone || '',
            location: {
              latitude: issue.location?.latitude || 0,
              longitude: issue.location?.longitude || 0,
              address: issue.location?.address || 'Unknown location',
            },
            photos: issue.photos || [],
            upvotes: issue.upvotes || 0,
            createdAt: issue.created_at || new Date().toISOString(),
          }));
          
          setIssues(transformedIssues);
          
          // Calculate stats
          const pending = transformedIssues.filter(i => i.status === 'pending').length;
          const inProgress = transformedIssues.filter(i => i.status === 'in-progress').length;
          const resolved = transformedIssues.filter(i => i.status === 'resolved').length;
          const rejected = transformedIssues.filter(i => i.status === 'rejected').length;
          
          setStats({
            totalIssues: transformedIssues.length,
            pending,
            inProgress,
            resolved,
            rejected,
            highPriority: allIssues.filter(i => {
              const voteScore = (i.upvotes || 0) - (i.downvotes || 0);
              return voteScore >= 10 && i.status !== 'resolved' && i.status !== 'rejected';
            }).length
          });
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && userRole) {
      fetchIssues();
    }
  }, [isSignedIn, userRole]);

  const filteredIssues = issues.filter(issue => {
    const statusMatch = filterStatus === 'all' || issue.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || issue.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-warning/10 text-warning border-warning/20',
      'in-progress': 'bg-primary/10 text-primary border-primary/20',
      'resolved': 'bg-success/10 text-success border-success/20',
      'rejected': 'bg-error/10 text-error border-error/20',
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-text-secondary',
      'medium': 'text-warning',
      'high': 'text-error',
      'critical': 'text-destructive',
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      infrastructure: 'Construction',
      safety: 'Shield',
      environment: 'Leaf',
      transportation: 'Car',
      utilities: 'Zap',
      other: 'AlertCircle',
    };
    return icons[category] || 'AlertCircle';
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://127.0.0.1:8000/api/issues/${issueId}/update-status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setIssues(prev => prev.map(issue => 
          issue.dbId === issueId ? { ...issue, status: newStatus } : issue
        ));
        
        // Recalculate stats
        const updatedIssues = issues.map(issue => 
          issue.dbId === issueId ? { ...issue, status: newStatus } : issue
        );
        
        setStats({
          totalIssues: updatedIssues.length,
          pending: updatedIssues.filter(i => i.status === 'pending').length,
          inProgress: updatedIssues.filter(i => i.status === 'in-progress').length,
          resolved: updatedIssues.filter(i => i.status === 'resolved').length,
          rejected: updatedIssues.filter(i => i.status === 'rejected').length,
          highPriority: updatedIssues.filter(i => {
            const voteScore = (i.upvotes || 0) - (i.downvotes || 0);
            return voteScore >= 10 && i.status !== 'resolved' && i.status !== 'rejected';
          }).length
        });
        
        if (selectedIssue?.dbId === issueId) {
          setSelectedIssue(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update issue status');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Authority Dashboard</h1>
              <p className="text-text-secondary">Manage and respond to civic issues</p>
            </div>
            <Button onClick={() => navigate('/profile')} variant="outline" iconName="User">
              Profile
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg civic-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalIssues}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="AlertCircle" size={24} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg civic-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Pending</p>
                <p className="text-3xl font-bold text-warning">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-warning" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg civic-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">In Progress</p>
                <p className="text-3xl font-bold text-primary">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Activity" size={24} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg civic-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Resolved</p>
                <p className="text-3xl font-bold text-success">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-success" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg civic-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Rejected</p>
                <p className="text-3xl font-bold text-error">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <Icon name="XCircle" size={24} className="text-error" />
              </div>
            </div>
          </div>

          {/* High Priority Card based on votes */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-6 hover:shadow-lg civic-transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">High Priority</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.highPriority}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-2">
              ≥10 net votes
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Categories</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="safety">Safety</option>
                <option value="environment">Environment</option>
                <option value="transportation">Transportation</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Issues ({filteredIssues.length})
            </h2>
            
            {filteredIssues.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Icon name="Inbox" size={48} className="text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">No issues found</p>
              </div>
            ) : (
              filteredIssues.map(issue => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`bg-card border rounded-lg p-4 hover:shadow-lg civic-transition cursor-pointer ${
                    selectedIssue?.id === issue.id ? 'border-primary' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${getCategoryIcon(issue.category)}/10`}>
                        <Icon name={getCategoryIcon(issue.category)} size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{issue.title}</h3>
                        <p className="text-sm text-text-secondary line-clamp-2">{issue.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('-', ' ')}
                      </span>
                      <span className="text-text-secondary capitalize">{issue.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Vote Score */}
                      <div className="flex items-center space-x-1">
                        <Icon name="ArrowUp" size={14} className="text-orange-500" />
                        <span className="text-xs font-medium text-orange-500">{issue.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="ArrowDown" size={14} className="text-blue-500" />
                        <span className="text-xs font-medium text-blue-500">{issue.downvotes || 0}</span>
                      </div>
                      <span className={`text-xs font-bold ${
                        (issue.upvotes - (issue.downvotes || 0)) > 0 ? 'text-orange-500' : 
                        (issue.upvotes - (issue.downvotes || 0)) < 0 ? 'text-blue-500' : 'text-text-secondary'
                      }`}>
                        {issue.upvotes - (issue.downvotes || 0) > 0 ? '+' : ''}{issue.upvotes - (issue.downvotes || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Issue Details Panel */}
          <div className="lg:sticky lg:top-8 h-fit">
            {selectedIssue ? (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">{selectedIssue.title}</h2>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="text-text-secondary hover:text-foreground"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Update Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedIssue.dbId, 'pending')}
                        className={`px-4 py-3 rounded-lg border-2 font-medium text-sm civic-transition ${
                          selectedIssue.status === 'pending'
                            ? 'bg-warning/10 border-warning text-warning'
                            : 'bg-background border-border text-text-secondary hover:border-warning/50'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Icon name="Clock" size={16} />
                          <span>Pending</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedIssue.dbId, 'in-progress')}
                        className={`px-4 py-3 rounded-lg border-2 font-medium text-sm civic-transition ${
                          selectedIssue.status === 'in-progress'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-background border-border text-text-secondary hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Icon name="Activity" size={16} />
                          <span>In Progress</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedIssue.dbId, 'resolved')}
                        className={`px-4 py-3 rounded-lg border-2 font-medium text-sm civic-transition ${
                          selectedIssue.status === 'resolved'
                            ? 'bg-success/10 border-success text-success'
                            : 'bg-background border-border text-text-secondary hover:border-success/50'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Icon name="CheckCircle" size={16} />
                          <span>Resolved</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedIssue.dbId, 'rejected')}
                        className={`px-4 py-3 rounded-lg border-2 font-medium text-sm civic-transition ${
                          selectedIssue.status === 'rejected'
                            ? 'bg-error/10 border-error text-error'
                            : 'bg-background border-border text-text-secondary hover:border-error/50'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Icon name="XCircle" size={16} />
                          <span>Rejected</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Description</p>
                    <p className="text-sm text-text-secondary">{selectedIssue.description}</p>
                  </div>

                  {/* Voting Statistics */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-sm font-medium text-foreground mb-3">Community Engagement</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Icon name="ArrowUp" size={16} className="text-orange-500" />
                          <span className="text-2xl font-bold text-orange-500">{selectedIssue.upvotes || 0}</span>
                        </div>
                        <p className="text-xs text-text-secondary">Upvotes</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Icon name="ArrowDown" size={16} className="text-blue-500" />
                          <span className="text-2xl font-bold text-blue-500">{selectedIssue.downvotes || 0}</span>
                        </div>
                        <p className="text-xs text-text-secondary">Downvotes</p>
                      </div>
                      <div className="text-center">
                        <div className="mb-1">
                          <span className={`text-2xl font-bold ${
                            (selectedIssue.upvotes - (selectedIssue.downvotes || 0)) > 0 ? 'text-orange-500' : 
                            (selectedIssue.upvotes - (selectedIssue.downvotes || 0)) < 0 ? 'text-blue-500' : 'text-text-secondary'
                          }`}>
                            {selectedIssue.upvotes - (selectedIssue.downvotes || 0) > 0 ? '+' : ''}
                            {selectedIssue.upvotes - (selectedIssue.downvotes || 0)}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">Net Score</p>
                      </div>
                    </div>
                    {selectedIssue.commentCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-center space-x-2 text-text-secondary">
                        <Icon name="MessageCircle" size={14} />
                        <span className="text-sm">{selectedIssue.commentCount} {selectedIssue.commentCount === 1 ? 'comment' : 'comments'}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Category</p>
                      <p className="text-sm text-text-secondary capitalize">{selectedIssue.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Priority</p>
                      <p className={`text-sm font-medium capitalize ${getPriorityColor(selectedIssue.priority)}`}>
                        {selectedIssue.priority}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Location</p>
                    <p className="text-sm text-text-secondary">{selectedIssue.location.address}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Reported By</p>
                    <p className="text-sm text-text-secondary">{selectedIssue.reporterName}</p>
                    {selectedIssue.reporterEmail && (
                      <p className="text-sm text-text-secondary">{selectedIssue.reporterEmail}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Reported On</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(selectedIssue.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Photos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedIssue.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={`http://127.0.0.1:8000${photo.photo}`}
                            alt={`Issue photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      fullWidth
                      iconName="MapPin"
                      onClick={() => window.open(`https://maps.google.com/?q=${selectedIssue.location.latitude},${selectedIssue.location.longitude}`, '_blank')}
                    >
                      View on Map
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">Select an issue to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
