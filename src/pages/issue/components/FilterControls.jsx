import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FilterControls = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortChange,
  onClearFilters,
  isFiltersExpanded,
  onToggleFilters
}) => {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Public Safety', label: 'Public Safety' },
    { value: 'Environment', label: 'Environment' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Health', label: 'Health' },
    { value: 'Education', label: 'Education' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'In Discussion', label: 'In Discussion' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Adopted', label: 'Adopted' },
    { value: 'Resolved', label: 'Resolved' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most-voted', label: 'Most Voted' },
    { value: 'most-commented', label: 'Most Commented' },
    { value: 'priority', label: 'By Priority' }
  ];

  const hasActiveFilters = selectedCategory !== 'all' || 
                          selectedStatus !== 'all' || 
                          selectedPriority !== 'all' || 
                          searchQuery?.length > 0;

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      {/* Search Bar - Always Visible */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search issues by title, description, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="w-full"
          />
        </div>
        
        {/* Mobile Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="md:hidden"
        >
          <Icon name="Filter" size={16} />
          <span className="ml-2">Filters</span>
        </Button>
      </div>
      {/* Filter Controls */}
      <div className={`space-y-4 ${isFiltersExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={onCategoryChange}
          />

          <Select
            label="Status"
            options={statusOptions}
            value={selectedStatus}
            onChange={onStatusChange}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value={selectedPriority}
            onChange={onPriorityChange}
          />

          <Select
            label="Sort By"
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-text-secondary hover:text-foreground"
            >
              <Icon name="X" size={16} />
              <span className="ml-2">Clear Filters</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;