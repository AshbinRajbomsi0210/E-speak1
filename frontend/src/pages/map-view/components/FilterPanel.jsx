import React, { useMemo } from 'react';
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
  // Log current filters for debugging
  console.log('Current filters:', filters);

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

  // Simplified category handler
  const handleCategoryChange = (categoryValue, checked) => {
    console.log('Category changed:', categoryValue, 'Checked:', checked);
    
    const currentCategories = filters?.categories || [];
    let newCategories;
    
    if (checked) {
      // Add category if not already present
      newCategories = currentCategories.includes(categoryValue) 
        ? currentCategories 
        : [...currentCategories, categoryValue];
    } else {
      // Remove category
      newCategories = currentCategories.filter(c => c !== categoryValue);
    }
    
    console.log('New categories:', newCategories);
    onFilterChange({ 
      ...filters, 
      categories: newCategories 
    });
  };

  // Simplified status handler
  const handleStatusChange = (statusValue, checked) => {
    console.log('Status changed:', statusValue, 'Checked:', checked);
    
    const currentStatuses = filters?.statuses || [];
    let newStatuses;
    
    if (checked) {
      newStatuses = currentStatuses.includes(statusValue)
        ? currentStatuses
        : [...currentStatuses, statusValue];
    } else {
      newStatuses = currentStatuses.filter(s => s !== statusValue);
    }
    
    console.log('New statuses:', newStatuses);
    onFilterChange({ 
      ...filters, 
      statuses: newStatuses 
    });
  };

  const handlePriorityChange = (value) => {
    console.log('Priority changed:', value);
    onFilterChange({ ...filters, priority: value });
  };

  const handleDateRangeChange = (value) => {
    console.log('Date range changed:', value);
    onFilterChange({ ...filters, dateRange: value });
  };

  const handleMinVotesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    console.log('Min votes changed:', value);
    if (!isNaN(value)) {
      onFilterChange({ ...filters, minVotes: value });
    }
  };

  const handleShowResolvedChange = (checked) => {
    console.log('Show resolved changed:', checked);
    onFilterChange({ ...filters, showResolved: checked });
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters?.categories?.length > 0) count += filters.categories.length;
    if (filters?.statuses?.length > 0) count += filters.statuses.length;
    if (filters?.priority) count += 1;
    if (filters?.dateRange && filters.dateRange !== 'all') count += 1;
    if (filters?.minVotes > 0) count += 1;
    if (!filters?.showResolved) count += 1;
    return count;
  }, [filters]);

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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden flex items-center justify-center w-8 h-8 text-text-secondary hover:text-foreground civic-transition"
            aria-label="Close filters"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Categories</h3>
              {filters?.categories?.length > 0 && (
                <button
                  onClick={() => {
                    console.log('Clearing categories');
                    onFilterChange({ ...filters, categories: [] });
                  }}
                  className="text-xs text-primary hover:text-primary/80 civic-transition"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2">
              {categoryOptions.map((category) => {
                const isChecked = (filters?.categories || []).includes(category.value);
                console.log(`Category ${category.value} checked:`, isChecked);
                
                return (
                  <Checkbox
                    key={category.value}
                    label={category.label}
                    checked={isChecked}
                    onChange={(e) => handleCategoryChange(category.value, e.target.checked)}
                  />
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Status</h3>
              {filters?.statuses?.length > 0 && (
                <button
                  onClick={() => {
                    console.log('Clearing statuses');
                    onFilterChange({ ...filters, statuses: [] });
                  }}
                  className="text-xs text-primary hover:text-primary/80 civic-transition"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2">
              {statusOptions.map((status) => {
                const isChecked = (filters?.statuses || []).includes(status.value);
                
                return (
                  <Checkbox
                    key={status.value}
                    label={status.label}
                    checked={isChecked}
                    onChange={(e) => handleStatusChange(status.value, e.target.checked)}
                  />
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <Select
              label="Priority Level"
              options={priorityOptions}
              value={filters?.priority || ''}
              onChange={handlePriorityChange}
              placeholder="All priorities"
              clearable
            />
          </div>

          {/* Date Range */}
          <div>
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={filters?.dateRange || 'all'}
              onChange={handleDateRangeChange}
              placeholder="Select time period"
            />
          </div>

          {/* Vote Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Minimum Votes</h3>
              {filters?.minVotes > 0 && (
                <button
                  onClick={() => onFilterChange({ ...filters, minVotes: 0 })}
                  className="text-xs text-primary hover:text-primary/80 civic-transition"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={filters?.minVotes || 0}
                onChange={handleMinVotesChange}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Minimum votes filter"
              />
              <div className="flex justify-between text-xs text-text-secondary">
                <span>0</span>
                <span className="font-medium text-foreground">
                  {filters?.minVotes || 0} vote{filters?.minVotes !== 1 ? 's' : ''}
                </span>
                <span>50+</span>
              </div>
            </div>
          </div>

          {/* Show Resolved Issues Toggle */}
          <div className="pt-2 border-t border-border">
            <Checkbox
              label="Show resolved issues"
              checked={filters?.showResolved ?? true}
              onChange={(e) => handleShowResolvedChange(e.target.checked)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => {
              console.log('Clearing all filters');
              onClearFilters();
            }}
            disabled={activeFilterCount === 0}
            className="w-full px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground border border-border rounded-lg hover:bg-muted civic-transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
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