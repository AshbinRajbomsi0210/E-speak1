import React from 'react';

const LoadingCard = () => {
  return (
    <div className="civic-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="civic-skeleton h-6 w-20 rounded-full"></div>
          <div className="civic-skeleton h-4 w-4 rounded"></div>
        </div>
        <div className="civic-skeleton h-6 w-24 rounded-full"></div>
      </div>

      {/* Image */}
      <div className="civic-skeleton w-full h-48 rounded-lg"></div>

      {/* Content */}
      <div className="space-y-3">
        <div className="civic-skeleton h-6 w-3/4 rounded"></div>
        <div className="space-y-2">
          <div className="civic-skeleton h-4 w-full rounded"></div>
          <div className="civic-skeleton h-4 w-2/3 rounded"></div>
        </div>
        <div className="civic-skeleton h-4 w-1/2 rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="civic-skeleton h-6 w-6 rounded-full"></div>
          <div className="civic-skeleton h-4 w-32 rounded"></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="civic-skeleton h-8 w-16 rounded"></div>
          <div className="civic-skeleton h-8 w-16 rounded"></div>
        </div>
        <div className="civic-skeleton h-8 w-24 rounded"></div>
      </div>
    </div>
  );
};

export default LoadingCard;
