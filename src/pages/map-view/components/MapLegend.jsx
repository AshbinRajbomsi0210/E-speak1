import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MapLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    {
      category: 'Priority Levels',
      items: [
        { color: 'bg-error', label: 'High Priority', icon: 'AlertTriangle' },
        { color: 'bg-warning', label: 'Medium Priority', icon: 'AlertCircle' },
        { color: 'bg-success', label: 'Low Priority', icon: 'CheckCircle' }
      ]
    },
    {
      category: 'Issue Categories',
      items: [
        { color: 'bg-blue-500', label: 'Infrastructure', icon: 'Wrench' },
        { color: 'bg-red-500', label: 'Public Safety', icon: 'Shield' },
        { color: 'bg-green-500', label: 'Environment', icon: 'Leaf' },
        { color: 'bg-purple-500', label: 'Transportation', icon: 'Car' },
        { color: 'bg-orange-500', label: 'Utilities', icon: 'Zap' }
      ]
    },
    {
      category: 'Status Indicators',
      items: [
        { color: 'bg-gray-400', label: 'Open', icon: 'Circle' },
        { color: 'bg-blue-400', label: 'Under Review', icon: 'Clock' },
        { color: 'bg-yellow-400', label: 'In Progress', icon: 'Play' },
        { color: 'bg-green-400', label: 'Resolved', icon: 'CheckCircle2' }
      ]
    }
  ];

  return (
    <div className="absolute bottom-4 left-4 z-30">
      <div className="bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
        {/* Legend Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-foreground hover:bg-muted civic-transition"
        >
          <div className="flex items-center space-x-2">
            <Icon name="Info" size={16} />
            <span>Map Legend</span>
          </div>
          <Icon 
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
            size={16} 
            className="civic-transition"
          />
        </button>

        {/* Legend Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 max-h-80 overflow-y-auto">
            {legendItems?.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                  {section?.category}
                </h4>
                <div className="space-y-2">
                  {section?.items?.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${item?.color} flex items-center justify-center`}>
                        <Icon name={item?.icon} size={10} color="white" />
                      </div>
                      <span className="text-sm text-foreground">{item?.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Additional Info */}
            <div className="pt-3 border-t border-border">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                Marker Features
              </h4>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">5</span>
                  </div>
                  <span>Vote count badge (5+ votes)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full bg-gray-400 shadow-sm"></div>
                  <span>Clustered markers show density</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapLegend;