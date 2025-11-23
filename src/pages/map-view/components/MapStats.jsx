import React from 'react';
import Icon from '../../../components/AppIcon';

const MapStats = ({ totalIssues, filteredIssues, filters }) => {
  const getStatsData = () => {
    const stats = {
      total: filteredIssues?.length,
      byStatus: {},
      byPriority: {},
      byCategory: {}
    };

    filteredIssues?.forEach(issue => {
      // Count by status
      stats.byStatus[issue.status] = (stats?.byStatus?.[issue?.status] || 0) + 1;
      
      // Count by priority
      stats.byPriority[issue.priority] = (stats?.byPriority?.[issue?.priority] || 0) + 1;
      
      // Count by category
      stats.byCategory[issue.category] = (stats?.byCategory?.[issue?.category] || 0) + 1;
    });

    return stats;
  };

  const stats = getStatsData();

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters?.categories?.length > 0) count++;
    if (filters?.statuses?.length > 0) count++;
    if (filters?.priority) count++;
    if (filters?.dateRange && filters?.dateRange !== 'all') count++;
    if (filters?.minVotes > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Map Statistics</h3>
        {activeFiltersCount > 0 && (
          <div className="flex items-center space-x-1 text-xs text-primary">
            <Icon name="Filter" size={12} />
            <span>{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active</span>
          </div>
        )}
      </div>
      {/* Total Count */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-foreground">{stats?.total}</div>
        <div className="text-sm text-text-secondary">
          of {totalIssues} total issues
        </div>
      </div>
      {/* Status Breakdown */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          By Status
        </h4>
        <div className="space-y-1">
          {Object.entries(stats?.byStatus)?.map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  status === 'Resolved' ? 'bg-success' :
                  status === 'In Progress' ? 'bg-warning' :
                  status === 'Under Review' ? 'bg-blue-500' : 'bg-secondary'
                }`} />
                <span className="text-foreground">{status}</span>
              </div>
              <span className="text-text-secondary font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Priority Breakdown */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          By Priority
        </h4>
        <div className="space-y-1">
          {Object.entries(stats?.byPriority)?.map(([priority, count]) => (
            <div key={priority} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={
                    priority === 'high' ? 'AlertTriangle' :
                    priority === 'medium' ? 'AlertCircle' : 'CheckCircle'
                  } 
                  size={12} 
                  className={
                    priority === 'high' ? 'text-error' :
                    priority === 'medium' ? 'text-warning' : 'text-success'
                  }
                />
                <span className="text-foreground capitalize">{priority}</span>
              </div>
              <span className="text-text-secondary font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Category Breakdown */}
      <div>
        <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          Top Categories
        </h4>
        <div className="space-y-1">
          {Object.entries(stats?.byCategory)?.sort(([,a], [,b]) => b - a)?.slice(0, 3)?.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={
                      category === 'Infrastructure' ? 'Wrench' :
                      category === 'Public Safety' ? 'Shield' :
                      category === 'Environment' ? 'Leaf' :
                      category === 'Transportation' ? 'Car' : 'AlertCircle'
                    } 
                    size={12} 
                    className="text-text-secondary"
                  />
                  <span className="text-foreground">{category}</span>
                </div>
                <span className="text-text-secondary font-medium">{count}</span>
              </div>
            ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-primary-foreground civic-transition">
            Export Data
          </button>
          <button className="px-3 py-2 text-xs font-medium text-text-secondary border border-border rounded-md hover:bg-muted civic-transition">
            Share View
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapStats;