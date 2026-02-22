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
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'high-priority'
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
            reporterName: issue.displayName || issue.reporterName || 'Anonymous',
            reporterEmail: issue.isAnonymous ? '[Protected]' : (issue.reporterEmail || ''),
            reporterPhone: issue.reporterPhone || '',
            isAnonymous: issue.isAnonymous || false,
            location: {
              latitude: issue.latitude || 0,
              longitude: issue.longitude || 0,
              address: issue.address || 'Unknown location',
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
            highPriority: transformedIssues.filter(i => {
              return (i.upvotes || 0) >= 5 && i.status !== 'resolved' && i.status !== 'rejected';
            }).length
          });
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchIssues();
    }
  }, [isSignedIn]);

  const filteredIssues = issues.filter(issue => {
    const statusMatch = filterStatus === 'all' || issue.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || issue.category === filterCategory;
    const isHighPriority = (issue.upvotes || 0) >= 5 && issue.status !== 'resolved' && issue.status !== 'rejected';
    
    // If on high-priority tab, only show high priority issues
    if (activeTab === 'high-priority') {
      return isHighPriority && statusMatch && categoryMatch;
    }
    
    return statusMatch && categoryMatch;
  });

  const highPriorityIssues = issues.filter(issue => {
    return (issue.upvotes || 0) >= 5 && issue.status !== 'resolved' && issue.status !== 'rejected';
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

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, issueId: null, newStatus: '', isLoading: false });

  const requestStatusChange = (issueId, newStatus) => {
    // Open confirmation modal instead of changing directly
    setConfirmModal({ open: true, issueId, newStatus, isLoading: false });
  };

  const cancelStatusChange = () => {
    setConfirmModal({ open: false, issueId: null, newStatus: '', isLoading: false });
  };

  const confirmStatusChange = async () => {
    const { issueId, newStatus } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isLoading: true }));

    // Map frontend status to backend status
    const statusMap = {
      'pending': 'Submitted',
      'in-progress': 'In Progress',
      'under-review': 'Under Review',
      'resolved': 'Resolved',
      'rejected': 'Rejected'
    };
    const backendStatus = statusMap[newStatus] || newStatus;

    // Save previous state for rollback
    const prevIssues = [...issues];
    const prevStats = { ...stats };
    const prevSelected = selectedIssue ? { ...selectedIssue } : null;

    // Optimistic UI update — instant feedback
    setIssues(prev => prev.map(issue => 
      issue.dbId === issueId ? { ...issue, status: newStatus } : issue
    ));
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
        return (i.upvotes || 0) >= 5 && i.status !== 'resolved' && i.status !== 'rejected';
      }).length
    });
    if (selectedIssue?.dbId === issueId) {
      setSelectedIssue(prev => ({ ...prev, status: newStatus }));
    }

    // Close modal immediately for instant feel
    setConfirmModal({ open: false, issueId: null, newStatus: '', isLoading: false });

    try {
      const token = await getToken();
      const response = await fetch(`http://127.0.0.1:8000/api/issues/${issueId}/update-status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: backendStatus })
      });

      if (!response.ok) {
        // Revert on failure
        setIssues(prevIssues);
        setStats(prevStats);
        if (prevSelected) setSelectedIssue(prevSelected);
        alert('Failed to update issue status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      setIssues(prevIssues);
      setStats(prevStats);
      if (prevSelected) setSelectedIssue(prevSelected);
      alert('Failed to update issue status. Please try again.');
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
          <div 
            onClick={() => setActiveTab('high-priority')}
            className={`bg-gradient-to-br from-orange-500/10 to-red-500/10 border rounded-lg p-6 hover:shadow-lg civic-transition cursor-pointer ${
              activeTab === 'high-priority' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-500/30'
            }`}
          >
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
              ≥5 community votes
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
            {/* Tab Switcher */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm civic-transition ${
                  activeTab === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-text-secondary hover:bg-muted/80'
                }`}
              >
                All Issues ({issues.length})
              </button>
              <button
                onClick={() => setActiveTab('high-priority')}
                className={`px-4 py-2 rounded-lg font-medium text-sm civic-transition flex items-center space-x-2 ${
                  activeTab === 'high-priority'
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border border-orange-500/30'
                }`}
              >
                <Icon name="TrendingUp" size={16} />
                <span>High Priority ({stats.highPriority})</span>
                {stats.highPriority > 0 && activeTab !== 'high-priority' && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>

            {/* High Priority Alert Banner */}
            {activeTab === 'high-priority' && stats.highPriority > 0 && (
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="AlertTriangle" size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-600 dark:text-orange-400">Threshold Reached - Requires Immediate Attention</h3>
                    <p className="text-sm text-orange-600/80 dark:text-orange-400/80 mt-1">
                      These {stats.highPriority} issue{stats.highPriority > 1 ? 's have' : ' has'} received 5+ community votes, indicating significant public concern. Please prioritize resolution.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-xl font-semibold text-foreground">
              {activeTab === 'high-priority' ? 'High Priority Issues' : 'Issues'} ({filteredIssues.length})
            </h2>
            
            {filteredIssues.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Icon name="Inbox" size={48} className="text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">
                  {activeTab === 'high-priority' 
                    ? 'No high priority issues at the moment' 
                    : 'No issues found'}
                </p>
              </div>
            ) : (
              filteredIssues.map(issue => {
                const isHighPriority = (issue.upvotes || 0) >= 5 && issue.status !== 'resolved' && issue.status !== 'rejected';
                return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`bg-card border rounded-lg p-4 hover:shadow-lg civic-transition cursor-pointer ${
                    selectedIssue?.id === issue.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : isHighPriority 
                        ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/5 to-transparent' 
                        : 'border-border'
                  }`}
                >
                  {isHighPriority && (
                    <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-orange-500/20">
                      <Icon name="TrendingUp" size={14} className="text-orange-500" />
                      <span className="text-xs font-medium text-orange-500">High Priority - Threshold Reached</span>
                    </div>
                  )}
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
                      <div className={`flex items-center space-x-1 ${isHighPriority ? 'text-orange-500' : ''}`}>
                        <Icon name="ThumbsUp" size={14} className={isHighPriority ? 'text-orange-500' : 'text-primary'} />
                        <span className={`text-xs font-medium ${isHighPriority ? 'text-orange-500' : 'text-primary'}`}>{issue.upvotes || 0} votes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )})
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
                        onClick={() => requestStatusChange(selectedIssue.dbId, 'pending')}
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
                        onClick={() => requestStatusChange(selectedIssue.dbId, 'in-progress')}
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
                        onClick={() => requestStatusChange(selectedIssue.dbId, 'resolved')}
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
                        onClick={() => requestStatusChange(selectedIssue.dbId, 'rejected')}
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
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <Icon name="ThumbsUp" size={20} className="text-primary" />
                          <span className="text-3xl font-bold text-primary">{selectedIssue.upvotes || 0}</span>
                        </div>
                        <p className="text-sm text-text-secondary">Community Votes</p>
                        {(selectedIssue.upvotes || 0) >= 5 && (
                          <span className="inline-block mt-2 px-2 py-1 bg-orange-500/10 text-orange-500 text-xs font-medium rounded-full border border-orange-500/20">
                            🔥 High Priority - Threshold Reached (5+ votes)
                          </span>
                        )}
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
                    <p className="text-sm text-text-secondary">
                      {selectedIssue.reporterName}
                      {selectedIssue.isAnonymous && (
                        <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">Anonymous</span>
                      )}
                    </p>
                    {!selectedIssue.isAnonymous && selectedIssue.reporterEmail && (
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
                            src={photo.image?.startsWith('http') ? photo.image : `http://127.0.0.1:8000${photo.image}`}
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
                      onClick={() => navigate(`/map-view?issue=${selectedIssue.dbId}&lat=${selectedIssue.location.latitude}&lng=${selectedIssue.location.longitude}`)}
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

      {/* Status Change Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                confirmModal.newStatus === 'resolved' ? 'bg-success/10' :
                confirmModal.newStatus === 'rejected' ? 'bg-error/10' :
                confirmModal.newStatus === 'in-progress' ? 'bg-primary/10' :
                'bg-warning/10'
              }`}>
                <Icon 
                  name={confirmModal.newStatus === 'resolved' ? 'CheckCircle' : 
                        confirmModal.newStatus === 'rejected' ? 'XCircle' : 
                        confirmModal.newStatus === 'in-progress' ? 'Activity' : 'Clock'} 
                  size={20} 
                  className={`${
                    confirmModal.newStatus === 'resolved' ? 'text-success' :
                    confirmModal.newStatus === 'rejected' ? 'text-error' :
                    confirmModal.newStatus === 'in-progress' ? 'text-primary' :
                    'text-warning'
                  }`}
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Confirm Status Change</h3>
            </div>

            <p className="text-text-secondary mb-2">
              You are about to change the status of this issue to{' '}
              <span className={`font-semibold capitalize ${
                confirmModal.newStatus === 'resolved' ? 'text-success' :
                confirmModal.newStatus === 'rejected' ? 'text-error' :
                confirmModal.newStatus === 'in-progress' ? 'text-primary' :
                'text-warning'
              }`}>
                {confirmModal.newStatus.replace('-', ' ')}
              </span>.
            </p>

            {confirmModal.newStatus === 'resolved' && (
              <div className="bg-success/5 border border-success/20 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Icon name="Mail" size={16} className="text-success mt-0.5" />
                  <p className="text-sm text-success">
                    The issue reporter and all community members who upvoted this issue will be notified via email that it has been resolved.
                  </p>
                </div>
              </div>
            )}

            {confirmModal.newStatus === 'rejected' && (
              <div className="bg-error/5 border border-error/20 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-error mt-0.5" />
                  <p className="text-sm text-error">
                    This action will reject the reported issue. The reporter will be notified.
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-text-secondary mb-6">Are you sure you want to proceed with this decision?</p>

            <div className="flex space-x-3">
              <button
                onClick={cancelStatusChange}
                disabled={confirmModal.isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-muted/50 font-medium text-sm civic-transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={confirmModal.isLoading}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-white civic-transition ${
                  confirmModal.newStatus === 'resolved' ? 'bg-success hover:bg-success/90' :
                  confirmModal.newStatus === 'rejected' ? 'bg-error hover:bg-error/90' :
                  confirmModal.newStatus === 'in-progress' ? 'bg-primary hover:bg-primary/90' :
                  'bg-warning hover:bg-warning/90'
                }`}
              >
                {confirmModal.isLoading ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
