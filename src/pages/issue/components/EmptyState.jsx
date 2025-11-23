import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ hasFilters, onClearFilters }) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <Icon name="Search" size={32} className="text-text-secondary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No issues match your filters
        </h3>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Try adjusting your search criteria or clearing filters to see more results.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          <Icon name="X" size={16} />
          <span className="ml-2">Clear All Filters</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
        <Icon name="FileText" size={32} className="text-text-secondary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No issues reported yet
      </h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        Be the first to report an issue in your community and help make a difference.
      </p>
      <Button variant="default" asChild>
        <Link to="/report-issue">
          <Icon name="Plus" size={16} />
          <span className="ml-2">Report First Issue</span>
        </Link>
      </Button>
    </div>
  );
};

export default EmptyState;