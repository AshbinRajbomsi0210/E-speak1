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
  const [issues, setIssues] = useState([
    {
      id: 'RPT-2025-1120-001',
      title: 'Broken streetlight on Main Street',
      description: 'The streetlight near the intersection of Main St and 5th Ave has been out for 3 days.',
      category: 'infrastructure',
      priority: 'high',
      status: 'pending',
      reporterName: 'John Doe',
      reporterEmail: 'john@example.com',
      location: { address: '123 Main St, Downtown' },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      photos: []
    },
    {
      id: 'RPT-2025-1119-002',
      title: 'Pothole on Oak Avenue',
      description: 'Large pothole causing damage to vehicles. Approximately 2 feet in diameter.',
      category: 'infrastructure',
      priority: 'urgent',
      status: 'in-progress',
      reporterName: 'Jane Smith',
      reporterEmail: 'jane@example.com',
      location: { address: '456 Oak Ave, Westside' },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'Public Works Dept',
      photos: []
    },
    {
      id: 'RPT-2025-1118-003',
      title: 'Graffiti on community center wall',
      description: 'Offensive graffiti on the north wall of the community center needs removal.',
      category: 'public-safety',
      priority: 'medium',
      status: 'resolved',
      reporterName: 'Mike Johnson',
      reporterEmail: 'mike@example.com',
      location: { address: '789 Community Blvd' },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      photos: []
    },
    {
      id: 'RPT-2025-1117-004',
      title: 'Illegal dumping in park',
      description: 'Construction debris dumped in Lincoln Park near the playground area.',
      category: 'environment',
      priority: 'high',
      status: 'pending',
      reporterName: 'Sarah Williams',
      reporterEmail: 'sarah@example.com',
      location: { address: 'Lincoln Park, South entrance' },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      photos: []
    }
  ]);

  // Redirect if not admin or authority
  React.useEffect(() => {
    if (role !== 'admin' && role !== 'authority') {
      navigate('/home');
    }
  }, [role, navigate]);

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
      resolved: issues.filter(i => i.status === 'resolved').length
    };
  };

  const handleStatusChange = (issueId, newStatus) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, status: newStatus, ...(newStatus === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}) }
        : issue
    ));
  };

  const handleAssign = (issueId, department) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, assignedTo: department, status: 'in-progress' }
        : issue
    ));
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
    { id: 'issues', label: 'All Issues', icon: 'List' },
    { id: 'users', label: 'Users', icon: 'Users' },
    { id: 'reports', label: 'Analytics', icon: 'BarChart' }
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
            <div className="civic-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Issues</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Icon name="AlertCircle" size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="civic-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-2">{stats.pending}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-lg">
                  <Icon name="Clock" size={24} className="text-warning" />
                </div>
              </div>
            </div>

            <div className="civic-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-primary mt-2">{stats.inProgress}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Icon name="Activity" size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="civic-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Resolved</p>
                  <p className="text-3xl font-bold text-success mt-2">{stats.resolved}</p>
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
              <h2 className="text-xl font-semibold text-foreground">Recent Issues</h2>
              <div className="space-y-4">
                {issues.slice(0, 3).map((issue) => (
                  <div key={issue.id} className="civic-card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-mono text-sm text-text-secondary">{issue.id}</span>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                            {issue.priority} priority
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{issue.title}</h3>
                        <p className="text-text-secondary text-sm mb-3">{issue.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                          <span className="flex items-center space-x-1">
                            <Icon name="MapPin" size={14} />
                            <span>{issue.location.address}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="Calendar" size={14} />
                            <span>{formatDate(issue.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="User" size={14} />
                            <span>{issue.reporterName}</span>
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">All Issues</h2>
                <div className="flex items-center space-x-3">
                  <select className="px-3 py-2 text-sm border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="civic-card overflow-hidden">
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
                    {issues.map((issue) => (
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
          )}

          {activeTab === 'users' && (
            <div className="civic-card p-8 text-center">
              <Icon name="Users" size={48} className="text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">User Management</h3>
              <p className="text-text-secondary">User management features coming soon.</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="civic-card p-8 text-center">
              <Icon name="BarChart" size={48} className="text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Analytics & Reports</h3>
              <p className="text-text-secondary">Analytics dashboard coming soon.</p>
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
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedIssue(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
