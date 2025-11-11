import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ formData }) => {
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

  const getStepBg = (step) => {
    const status = getStepStatus(step);
    if (status === 'complete') return 'bg-success/10 border-success/20';
    if (status === 'in-progress') return 'bg-warning/10 border-warning/20';
    return 'bg-muted border-border';
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="bg-card rounded-lg border border-border p-6 civic-shadow-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="BarChart3" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Report Progress</h2>
          <p className="text-sm text-text-secondary">Complete all sections to submit your report</p>
        </div>
      </div>
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Completion</span>
          <span className="text-sm font-medium text-primary">{overallProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full civic-transition"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      {/* Step Progress */}
      <div className="space-y-4">
        {steps?.map((step, index) => {
          const status = getStepStatus(step);
          const isLast = index === steps?.length - 1;
          
          return (
            <div key={step?.id} className="relative">
              <div className={`flex items-center space-x-4 p-4 rounded-lg border ${getStepBg(step)}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  status === 'complete' ? 'bg-success text-white' :
                  status === 'in-progress'? 'bg-warning text-white' : 'bg-muted text-text-secondary'
                }`}>
                  <Icon name={getStepIcon(step)} size={16} />
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    status === 'complete' ? 'text-success' :
                    status === 'in-progress'? 'text-warning' : 'text-text-secondary'
                  }`}>
                    {step?.label}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    {status === 'complete' && (
                      <span className="text-xs text-success">Complete</span>
                    )}
                    {status === 'in-progress' && (
                      <span className="text-xs text-warning">In Progress</span>
                    )}
                    {status === 'pending' && (
                      <span className="text-xs text-text-secondary">Not Started</span>
                    )}
                  </div>
                </div>

                <div className={getStepColor(step)}>
                  {status === 'complete' && <Icon name="Check" size={16} />}
                  {status === 'in-progress' && <Icon name="Clock" size={16} />}
                  {status === 'pending' && <Icon name="Circle" size={16} />}
                </div>
              </div>
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-8 top-16 w-0.5 h-4 bg-border" />
              )}
            </div>
          );
        })}
      </div>
      {/* Completion Status */}
      {overallProgress === 100 ? (
        <div className="mt-6 p-4 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center space-x-3">
            <Icon name="CheckCircle" size={20} className="text-success" />
            <div>
              <h3 className="text-sm font-medium text-success">Ready to Submit!</h3>
              <p className="text-xs text-text-secondary">All required sections are complete</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Info" size={20} className="text-primary" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Keep Going!</h3>
              <p className="text-xs text-text-secondary">
                Complete the remaining sections to submit your report
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;