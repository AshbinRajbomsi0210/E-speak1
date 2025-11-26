import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      status: 'active',
      reportsSubmitted: 12,
      joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      status: 'active',
      reportsSubmitted: 8,
      joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'authority',
      status: 'active',
      reportsSubmitted: 3,
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      role: 'user',
      status: 'suspended',
      reportsSubmitted: 15,
      joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [polls, setPolls] = useState([
    {
      id: 1,
      title: 'Should we add more bike lanes?',
      status: 'active',
      votes: 245,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: 'Preferred location for new community center',
      status: 'active',
      votes: 189,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'System maintenance scheduled',
      message: 'Platform will be down for maintenance on Nov 25, 2025 from 2-4 AM',
      type: 'warning',
      isPublished: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // Redirect if not admin or authority
  React.useEffect(() => {
    if (role !== 'admin' && role !== 'authority') {
      navigate('/home');
    }
  }, [role, navigate]);

  // Fetch issues from backend
  React.useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/issues/list/');
        const data = await response.json();
        
        if (data.success) {
          // Transform backend data to match frontend format
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
            location: { address: issue.address || 'No address provided' },
            createdAt: issue.created_at,
            upvotes: issue.upvotes || 0,
            photos: issue.photos || []
          }));
          setIssues(transformedIssues);
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning/10 text-warning border-warning/30',
      'in-progress': 'bg-primary/10 text-primary border-primary/30',
      resolved: 'bg-success/10 text-success border-success/30',
      rejected: 'bg-error/10 text-error border-error/30'
    };
    return colors[status] || 'bg-muted text-text-secondary border-border';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-text-secondary',
      medium: 'text-warning',
      high: 'text-error',
      urgent: 'text-error font-bold'
    };
    return colors[priority] || 'text-text-secondary';
  };

  const getStats = () => {
    return {
      total: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      inProgress: issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length,
      activePolls: polls.filter(p => p.status === 'active').length
    };
  };

  const handleStatusChange = async (issueId, newStatus) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issues/${issue.dbId}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setIssues(prev => prev.map(item => 
          item.id === issueId 
            ? { ...item, status: newStatus, ...(newStatus === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}) }
            : item
        ));
        if (selectedIssue?.id === issueId) {
          setSelectedIssue(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert('Failed to update issue status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating issue status');
    }
  };

  const handleAssign = (issueId, department) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, assignedTo: department, status: 'in-progress' }
        : issue
    ));
  };

  const handleDeleteIssue = async (issueId) => {
    if (confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      const issue = issues.find(i => i.id === issueId);
      if (!issue) return;

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/issues/${issue.dbId}/delete/`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIssues(prev => prev.filter(item => item.id !== issueId));
          setSelectedIssue(null);
        } else {
          alert('Failed to delete issue');
        }
      } catch (error) {
        console.error('Error deleting issue:', error);
        alert('Error deleting issue');
      }
    }
  };

  const handleUserStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleUserRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSelectedUser(null);
    }
  };

  const handleDeletePoll = (pollId) => {
    if (confirm('Are you sure you want to delete this poll?')) {
      setPolls(prev => prev.filter(poll => poll.id !== pollId));
    }
  };

  const handlePollStatusChange = (pollId, newStatus) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId ? { ...poll, status: newStatus } : poll
    ));
  };

  const getFilteredIssues = () => {
    return issues.filter(issue => {
      const statusMatch = filterStatus === 'all' || issue.status === filterStatus;
      const categoryMatch = filterCategory === 'all' || issue.category === filterCategory;
      return statusMatch && categoryMatch;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = getStats();

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'issues', label: 'Issue Management', icon: 'AlertCircle' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'community', label: 'Community Content', icon: 'MessageSquare' },
    { id: 'analytics', label: 'Analytics & Reports', icon: 'BarChart' },
    { id: 'settings', label: 'System Settings', icon: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
                  <Icon name="Shield" size={32} className="text-primary" />
                  <span>Admin Dashboard</span>
                </h1>
                <p className="mt-2 text-text-secondary">
                  Welcome back, {user?.name || 'Administrator'}. Manage issues and monitor community reports.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full capitalize">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="civic-card p-6 hover:shadow-lg civic-transition cursor-pointer" onClick={() => setActiveTab('issues')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Issues</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
                  <p className="text-xs text-text-secondary mt-1">{stats.pending} pending</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Icon name="AlertCircle" size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="civic-card p-6 hover:shadow-lg civic-transition cursor-pointer" onClick={() => setActiveTab('issues')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Active Cases</p>
                  <p className="text-3xl font-bold text-primary mt-2">{stats.inProgress}</p>
                  <p className="text-xs text-text-secondary mt-1">In progress</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Icon name="Activity" size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="civic-card p-6 hover:shadow-lg civic-transition cursor-pointer" onClick={() => setActiveTab('users')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.totalUsers}</p>
                  <p className="text-xs text-text-secondary mt-1">{stats.activeUsers} active</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
                  <Icon name="Users" size={24} className="text-accent" />
                </div>
              </div>
            </div>

            <div className="civic-card p-6 hover:shadow-lg civic-transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Resolution Rate</p>
                  <p className="text-3xl font-bold text-success mt-2">{Math.round((stats.resolved / stats.total) * 100)}%</p>
                  <p className="text-xs text-text-secondary mt-1">{stats.resolved} resolved</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg">
                  <Icon name="CheckCircle" size={24} className="text-success" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap civic-transition ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-secondary hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Issues */}
                <div className="civic-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Recent Issues</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('issues')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {issues.slice(0, 3).map((issue) => (
                      <div key={issue.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 civic-transition cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{issue.title}</p>
                            <p className="text-xs text-text-secondary mt-1">{issue.location.address}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Users */}
                <div className="civic-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Recent Users</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {users.slice(0, 3).map((user) => (
                      <div key={user.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 civic-transition cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icon name="User" size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{user.name}</p>
                              <p className="text-xs text-text-secondary">{user.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="civic-card p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="AlertCircle" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground"><span className="font-semibold">John Doe</span> reported a new issue</p>
                      <p className="text-xs text-text-secondary">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="CheckCircle" size={16} className="text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground"><span className="font-semibold">Admin</span> resolved issue #RPT-2025-1118-003</p>
                      <p className="text-xs text-text-secondary">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="UserPlus" size={16} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">New user <span className="font-semibold">Jane Smith</span> joined</p>
                      <p className="text-xs text-text-secondary">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-foreground">Issue Management</h2>
                <div className="flex items-center space-x-3">
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="public-safety">Public Safety</option>
                    <option value="environment">Environment</option>
                    <option value="utilities">Utilities</option>
                  </select>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="civic-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {getFilteredIssues().map((issue) => (
                        <tr key={issue.id} className="hover:bg-muted/30 civic-transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-secondary">{issue.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground max-w-xs truncate">{issue.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">{issue.category.replace('-', ' ')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`capitalize ${getPriorityColor(issue.priority)}`}>
                              {issue.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(issue.status)}`}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {formatDate(issue.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedIssue(issue)}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">User Management</h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" iconName="Download">
                    Export Users
                  </Button>
                  <Button variant="default" size="sm" iconName="UserPlus">
                    Add User
                  </Button>
                </div>
              </div>

              <div className="civic-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Reports</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Last Active</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30 civic-transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Icon name="User" size={16} className="text-primary" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.reportsSubmitted}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDate(user.lastActive)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Community Polls</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {polls.map((poll) => (
                    <div key={poll.id} className="civic-card p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{poll.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${poll.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-text-secondary'}`}>
                          {poll.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                        <span>{poll.votes} votes</span>
                        <span>{formatDate(poll.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePollStatusChange(poll.id, poll.status === 'active' ? 'closed' : 'active')}
                        >
                          {poll.status === 'active' ? 'Close' : 'Reopen'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePoll(poll.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">System Announcements</h2>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="civic-card p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              announcement.type === 'warning' ? 'bg-warning/10 text-warning' : 
                              announcement.type === 'info' ? 'bg-primary/10 text-primary' : 
                              'bg-error/10 text-error'
                            }`}>
                              {announcement.type}
                            </span>
                            {announcement.isPublished && (
                              <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium">
                                Published
                              </span>
                            )}
                          </div>
                          <p className="text-text-secondary text-sm mb-2">{announcement.message}</p>
                          <p className="text-xs text-text-secondary">{formatDate(announcement.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" iconName="Edit">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" iconName="Trash">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Analytics & Reports</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="civic-card p-6">
                  <h3 className="text-sm font-semibold text-text-secondary mb-2">Avg. Resolution Time</h3>
                  <p className="text-3xl font-bold text-foreground">4.2 days</p>
                  <p className="text-xs text-success mt-1">↓ 12% from last month</p>
                </div>
                <div className="civic-card p-6">
                  <h3 className="text-sm font-semibold text-text-secondary mb-2">User Satisfaction</h3>
                  <p className="text-3xl font-bold text-foreground">87%</p>
                  <p className="text-xs text-success mt-1">↑ 5% from last month</p>
                </div>
                <div className="civic-card p-6">
                  <h3 className="text-sm font-semibold text-text-secondary mb-2">Active Users (30d)</h3>
                  <p className="text-3xl font-bold text-foreground">1,234</p>
                  <p className="text-xs text-success mt-1">↑ 23% from last month</p>
                </div>
              </div>

              <div className="civic-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Issue Categories Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">Infrastructure</span>
                      <span className="text-text-secondary">45%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">Public Safety</span>
                      <span className="text-text-secondary">30%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent rounded-full h-2" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">Environment</span>
                      <span className="text-text-secondary">25%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success rounded-full h-2" style={{width: '25%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button variant="default" iconName="Download">
                  Export Full Report
                </Button>
                <Button variant="outline" iconName="Calendar">
                  Custom Date Range
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">System Settings</h2>
              
              <div className="civic-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Auto-approve reports</p>
                      <p className="text-sm text-text-secondary">Automatically publish new reports without review</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Email notifications</p>
                      <p className="text-sm text-text-secondary">Send email alerts for new reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Maintenance mode</p>
                      <p className="text-sm text-text-secondary">Temporarily disable public access</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="civic-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Content Moderation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Banned words</label>
                    <textarea className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary" rows="3" placeholder="Enter comma-separated words..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Report review threshold</label>
                    <select className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary">
                      <option>Automatic (AI-assisted)</option>
                      <option>Manual review required</option>
                      <option>Trusted users only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="civic-card p-6 bg-error/5 border-error/20">
                <h3 className="text-lg font-semibold text-error mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="text-error border-error hover:bg-error/10">
                    Clear All Notifications
                  </Button>
                  <Button variant="outline" className="text-error border-error hover:bg-error/10">
                    Reset Analytics Data
                  </Button>
                  <Button variant="outline" className="text-error border-error hover:bg-error/10">
                    Export & Delete All Data
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto civic-shadow-modal">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between z-10">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-mono text-sm text-text-secondary">{selectedIssue.id}</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(selectedIssue.status)}`}>
                    {selectedIssue.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{selectedIssue.title}</h2>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted civic-transition"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-text-secondary">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Category</h3>
                  <p className="text-text-secondary capitalize">{selectedIssue.category.replace('-', ' ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Priority</h3>
                  <p className={`capitalize ${getPriorityColor(selectedIssue.priority)}`}>{selectedIssue.priority}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Location</h3>
                <p className="text-text-secondary">{selectedIssue.location.address}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Reporter</h3>
                <p className="text-text-secondary">{selectedIssue.reporterName} ({selectedIssue.reporterEmail})</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Reported At</h3>
                <p className="text-text-secondary">{formatDate(selectedIssue.createdAt)}</p>
              </div>

              {selectedIssue.assignedTo && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Assigned To</h3>
                  <p className="text-text-secondary">{selectedIssue.assignedTo}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'in-progress', 'resolved', 'rejected'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedIssue.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange(selectedIssue.id, status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {!selectedIssue.assignedTo && selectedIssue.status !== 'resolved' && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Assign To Department</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Public Works', 'Police Dept', 'Fire Dept', 'Parks & Rec'].map((dept) => (
                      <Button
                        key={dept}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssign(selectedIssue.id, dept)}
                      >
                        {dept}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-error mb-2">Danger Zone</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-error border-error hover:bg-error/10"
                  onClick={() => handleDeleteIssue(selectedIssue.id)}
                >
                  <Icon name="Trash" size={16} className="mr-2" />
                  Delete Issue Permanently
                </Button>
              </div>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedIssue(null)}>
                Close
              </Button>
              <Button variant="default" iconName="MessageSquare">
                Contact Reporter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto civic-shadow-modal">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between z-10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={32} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedUser.name}</h2>
                  <p className="text-text-secondary">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted civic-transition"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Role</h3>
                  <p className="text-text-secondary capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Status</h3>
                  <p className={`capitalize ${selectedUser.status === 'active' ? 'text-success' : 'text-error'}`}>
                    {selectedUser.status}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Reports Submitted</h3>
                <p className="text-text-secondary">{selectedUser.reportsSubmitted} reports</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Member Since</h3>
                <p className="text-text-secondary">{formatDate(selectedUser.joinedAt)}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Last Active</h3>
                <p className="text-text-secondary">{formatDate(selectedUser.lastActive)}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Change Role</h3>
                <div className="flex flex-wrap gap-2">
                  {['user', 'authority', 'admin'].map((role) => (
                    <Button
                      key={role}
                      variant={selectedUser.role === role ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleUserRoleChange(selectedUser.id, role)}
                      className="capitalize"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Account Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedUser.status === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUserStatusChange(selectedUser.id, 'active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={selectedUser.status === 'suspended' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUserStatusChange(selectedUser.id, 'suspended')}
                  >
                    Suspended
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-error mb-2">Danger Zone</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-error border-error hover:bg-error/10"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  <Icon name="Trash" size={16} className="mr-2" />
                  Delete User Account
                </Button>
              </div>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              <Button variant="default" iconName="Mail">
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
