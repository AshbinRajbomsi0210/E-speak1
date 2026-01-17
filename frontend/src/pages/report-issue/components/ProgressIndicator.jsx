import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ formData }) => {
  const [hoveredStep, setHoveredStep] = useState(null);
  
  const steps = [
    {
      id: 'details',
      label: 'Issue Details',
      icon: 'FileText',
      fields: ['title', 'description', 'category', 'priority', 'reporterName', 'reporterEmail']
    },
    {
      id: 'photos',
      label: 'Photos',
      icon: 'Camera',
      fields: ['photos']
    },
    {
      id: 'location',
      label: 'Location',
      icon: 'MapPin',
      fields: ['location']
    }
  ];

  const getStepStatus = (step) => {
    const requiredFields = step?.fields;
    let completedFields = 0;
    
    requiredFields?.forEach(field => {
      if (field === 'photos') {
        if (formData?.photos && formData?.photos?.length > 0) {
          completedFields++;
        }
      } else if (field === 'location') {
        if (formData?.location && formData?.location?.address) {
          completedFields++;
        }
      } else {
        if (formData?.[field] && formData?.[field]?.trim() !== '') {
          completedFields++;
        }
      }
    });
    
    const progress = (completedFields / requiredFields?.length) * 100;
    
    if (progress === 100) return 'complete';
    if (progress > 0) return 'in-progress';
    return 'pending';
  };

  const getOverallProgress = () => {
    const totalSteps = steps?.length;
    const completedSteps = steps?.filter(step => getStepStatus(step) === 'complete')?.length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const getStepIcon = (step) => {
    const status = getStepStatus(step);
    if (status === 'complete') return 'CheckCircle';
    if (status === 'in-progress') return 'Clock';
    return step?.icon;
  };

  const getStepColor = (step) => {
    const status = getStepStatus(step);
    if (status === 'complete') return 'text-success';
    if (status === 'in-progress') return 'text-warning';
    return 'text-text-secondary';
  };

  const overallProgress = getOverallProgress();
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="bg-card rounded-lg border border-border p-4 civic-shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
          <Icon name="BarChart3" size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Report Progress</h2>
          <p className="text-xs text-text-secondary">Complete all sections</p>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-500"
              style={{
                filter: overallProgress === 100 ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))' : 'none'
              }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute flex flex-col items-center">
            <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
            <div className="text-xs text-text-secondary mt-0.5">Complete</div>
          </div>
        </div>
      </div>

      {/* Step Circles */}
      <div className="flex justify-between items-end gap-2 mb-4">
        {steps?.map((step, index) => {
          const status = getStepStatus(step);
          const isHovered = hoveredStep === step.id;
          
          return (
            <div 
              key={step?.id}
              className="flex-1 flex flex-col items-center"
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Circle */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                  status === 'complete' 
                    ? `bg-success/10 border-success ${isHovered ? 'scale-110 shadow-lg shadow-success/30' : ''}` 
                    : status === 'in-progress'
                    ? `bg-warning/10 border-warning ${isHovered ? 'scale-110 shadow-lg shadow-warning/30' : ''}`
                    : `bg-muted border-border ${isHovered ? 'scale-110 shadow-lg' : ''}`
                }`}
              >
                <Icon 
                  name={getStepIcon(step)} 
                  size={18} 
                  className={`transition-all duration-300 ${
                    status === 'complete' ? 'text-success' :
                    status === 'in-progress' ? 'text-warning' :
                    'text-text-secondary'
                  }`}
                />
              </div>

              {/* Label */}
              <div className={`mt-2 text-center transition-all duration-300 ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-75'
              }`}>
                <p className={`text-xs font-medium ${
                  status === 'complete' ? 'text-success' :
                  status === 'in-progress' ? 'text-warning' :
                  'text-text-secondary'
                }`}>
                  {step?.label}
                </p>
              </div>

              {/* Status badge on hover */}
              {isHovered && (
                <div className={`mt-1 text-xs px-2 py-0.5 rounded-full bg-background border animate-fadeIn ${
                  status === 'complete' ? 'border-success/30 text-success' :
                  status === 'in-progress' ? 'border-warning/30 text-warning' :
                  'border-border text-text-secondary'
                }`}>
                  {status === 'complete' ? 'Done' : status === 'in-progress' ? 'Filling' : 'Start'}
                </div>
              )}

              {/* Connector line to next step */}
              {index < steps.length - 1 && (
                <div className={`absolute h-1 bg-border transition-all duration-300 ${
                  status === 'complete' ? 'bg-success' : ''
                }`}
                style={{
                  width: 'calc(100% / 3 - 28px)',
                  left: 'calc((100% / 3) * ' + index + ' + 28px)',
                  top: '56px'
                }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Status */}
      {overallProgress === 100 ? (
        <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20 hover:bg-success/15 hover:shadow-lg hover:shadow-success/20 transition-all duration-300">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-success animate-pulse" />
            <div>
              <h3 className="text-xs font-medium text-success">Ready to Submit!</h3>
              <p className="text-xs text-text-secondary">All sections complete</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-muted rounded-lg hover:bg-muted/80 hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-2">
            <Icon name="Info" size={16} className="text-primary" />
            <div>
              <h3 className="text-xs font-medium text-foreground">Keep Going!</h3>
              <p className="text-xs text-text-secondary">
                {3 - steps?.filter(step => getStepStatus(step) === 'complete')?.length} section{3 - steps?.filter(step => getStepStatus(step) === 'complete')?.length !== 1 ? 's' : ''} left
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProgressIndicator;
