import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ 
  isOpen, 
  onToggle, 
  filters, 
  onFilterChange, 
  onClearFilters 
}) => {
  const categoryOptions = [
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Public Safety', label: 'Public Safety' },
    { value: 'Environment', label: 'Environment' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Utilities', label: 'Utilities' }
  ];

  const statusOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Resolved', label: 'Resolved' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'all', label: 'All Time' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/20"
          onClick={onToggle}
        />
      )}
      {/* Filter Panel */}
      <div className={`
        fixed lg:relative top-0 right-0 z-50 lg:z-auto
        w-80 h-full lg:h-auto
        bg-surface border-l lg:border-l-0 lg:border border-border
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        lg:rounded-lg lg:shadow-sm
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:border-b-0">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <button
            onClick={onToggle}
            className="lg:hidden flex items-center justify-center w-8 h-8 text-text-secondary hover:text-foreground civic-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Categories</h3>
            <div className="space-y-2">
              {categoryOptions?.map((category) => (
                <Checkbox
                  key={category?.value}
                  label={category?.label}
                  checked={filters?.categories?.includes(category?.value)}
                  onChange={(e) => {
                    const newCategories = e?.target?.checked
                      ? [...filters?.categories, category?.value]
                      : filters?.categories?.filter(c => c !== category?.value);
                    onFilterChange({ ...filters, categories: newCategories });
                  }}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Status</h3>
            <div className="space-y-2">
              {statusOptions?.map((status) => (
                <Checkbox
                  key={status?.value}
                  label={status?.label}
                  checked={filters?.statuses?.includes(status?.value)}
                  onChange={(e) => {
                    const newStatuses = e?.target?.checked
                      ? [...filters?.statuses, status?.value]
                      : filters?.statuses?.filter(s => s !== status?.value);
                    onFilterChange({ ...filters, statuses: newStatuses });
                  }}
                />
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <Select
              label="Priority Level"
              options={priorityOptions}
              value={filters?.priority}
              onChange={(value) => onFilterChange({ ...filters, priority: value })}
              placeholder="All priorities"
              clearable
            />
          </div>

          {/* Date Range */}
          <div>
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={filters?.dateRange}
              onChange={(value) => onFilterChange({ ...filters, dateRange: value })}
              placeholder="Select time period"
            />
          </div>

          {/* Vote Range */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Minimum Votes</h3>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="50"
                value={filters?.minVotes}
                onChange={(e) => onFilterChange({ ...filters, minVotes: parseInt(e?.target?.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-text-secondary">
                <span>0</span>
                <span className="font-medium">{filters?.minVotes} votes</span>
                <span>50+</span>
              </div>
            </div>
          </div>

          {/* Show Resolved Issues Toggle */}
          <div>
            <Checkbox
              label="Show resolved issues"
              checked={filters?.showResolved}
              onChange={(e) => onFilterChange({ ...filters, showResolved: e?.target?.checked })}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground border border-border rounded-lg hover:bg-muted civic-transition"
          >
            Clear All Filters
          </button>
          <button
            onClick={onToggle}
            className="lg:hidden w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 civic-transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;