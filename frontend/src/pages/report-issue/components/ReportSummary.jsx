import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportSummary = ({ formData, onEdit, onConfirm, onBack, isSubmitting }) => {
  const getCategoryLabel = (category) => {
    const labels = {
      infrastructure: 'Infrastructure',
      safety: 'Safety',
      environment: 'Environment',
      transportation: 'Transportation',
      utilities: 'Utilities',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-text-secondary bg-muted',
      medium: 'text-warning bg-warning/10',
      high: 'text-orange-500 bg-orange-500/10',
      critical: 'text-error bg-error/10'
    };
    return colors[priority] || colors.medium;
  };

  const SummaryField = ({ label, value, icon, onEditClick, editSection }) => (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-start space-x-3 flex-1">
        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name={icon} size={16} className="text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-foreground font-medium mt-0.5 break-words">{value || <span className="text-text-secondary italic">Not provided</span>}</p>
        </div>
      </div>
      {onEditClick && (
        <button
          onClick={() => onEditClick(editSection)}
          className="p-2 text-primary hover:bg-primary/10 rounded-lg civic-transition flex-shrink-0"
          title={`Edit ${label}`}
        >
          <Icon name="Edit2" size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border p-6 civic-shadow-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="FileCheck" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Review Your Report</h2>
          <p className="text-sm text-text-secondary">Please verify all information before submitting</p>
        </div>
      </div>

      {/* Issue Details Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Issue Details</h3>
          <button
            onClick={() => onEdit('details')}
            className="text-xs text-primary hover:underline flex items-center space-x-1"
          >
            <Icon name="Edit2" size={12} />
            <span>Edit Section</span>
          </button>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 space-y-0">
          <SummaryField 
            label="Title" 
            value={formData.title} 
            icon="FileText"
          />
          <SummaryField 
            label="Description" 
            value={formData.description} 
            icon="AlignLeft"
          />
          <div className="flex items-start justify-between py-3 border-b border-border">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Tag" size={16} className="text-text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-secondary">Category</p>
                <span className="inline-flex items-center px-2 py-1 mt-1 bg-primary/10 text-primary text-sm font-medium rounded">
                  {getCategoryLabel(formData.category)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between py-3">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={16} className="text-text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-secondary">Priority</p>
                <span className={`inline-flex items-center px-2 py-1 mt-1 text-sm font-medium rounded capitalize ${getPriorityColor(formData.priority)}`}>
                  {getPriorityLabel(formData.priority)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Location</h3>
          <button
            onClick={() => onEdit('location')}
            className="text-xs text-primary hover:underline flex items-center space-x-1"
          >
            <Icon name="Edit2" size={12} />
            <span>Edit Section</span>
          </button>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <SummaryField 
            label="Address" 
            value={formData.location?.address} 
            icon="MapPin"
          />
          {formData.location?.coordinates && (
            <div className="flex items-start py-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Navigation" size={16} className="text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Coordinates</p>
                  <p className="text-foreground font-mono text-sm mt-0.5">
                    {formData.location.coordinates.lat?.toFixed(6)}, {formData.location.coordinates.lng?.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Photos</h3>
          <button
            onClick={() => onEdit('photos')}
            className="text-xs text-primary hover:underline flex items-center space-x-1"
          >
            <Icon name="Edit2" size={12} />
            <span>Edit Section</span>
          </button>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          {formData.photos && formData.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img
                    src={photo.preview || photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-text-secondary">
              <Icon name="ImageOff" size={20} />
              <span className="text-sm">No photos attached</span>
            </div>
          )}
        </div>
      </div>

      {/* Reporter Information Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Reporter Information</h3>
          <button
            onClick={() => onEdit('details')}
            className="text-xs text-primary hover:underline flex items-center space-x-1"
          >
            <Icon name="Edit2" size={12} />
            <span>Edit Section</span>
          </button>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 space-y-0">
          <SummaryField 
            label="Name" 
            value={formData.isAnonymous ? 'Anonymous' : formData.reporterName} 
            icon="User"
          />
          <SummaryField 
            label="Email" 
            value={formData.isAnonymous ? 'Hidden (Anonymous Report)' : formData.reporterEmail} 
            icon="Mail"
          />
          {formData.reporterPhone && !formData.isAnonymous && (
            <SummaryField 
              label="Phone" 
              value={formData.reporterPhone} 
              icon="Phone"
            />
          )}
          {formData.isAnonymous && (
            <div className="flex items-center space-x-2 mt-3 px-3 py-2 bg-warning/10 rounded-lg border border-warning/20">
              <Icon name="EyeOff" size={16} className="text-warning" />
              <span className="text-sm text-warning">This report will be submitted anonymously</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Edit
        </Button>
        <Button
          variant="default"
          onClick={onConfirm}
          loading={isSubmitting}
          className="flex-1"
          iconName="Send"
          iconPosition="left"
        >
          {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-text-secondary text-center mt-4">
        By submitting this report, you confirm that the information provided is accurate to the best of your knowledge.
      </p>
    </div>
  );
};

export default ReportSummary;
