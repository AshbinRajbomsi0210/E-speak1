import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportSummary = ({ formData, onEdit, onConfirm, onBack, isSubmitting }) => {
  const getCategoryLabel = (category) => {
    const labels = {
      infrastructure: 'Infrastructure',
      'public safety': 'Public Safety',
      safety: 'Safety',
      environment: 'Environment',
      transportation: 'Transportation',
      'community-services': 'Community Services',
      utilities: 'Utilities',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      infrastructure: 'Building2',
      'public safety': 'ShieldAlert',
      safety: 'ShieldAlert',
      environment: 'Leaf',
      transportation: 'Car',
      'community-services': 'Users',
      utilities: 'Zap',
      other: 'HelpCircle'
    };
    return icons[category] || 'Tag';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      critical: 'Critical'
    };
    return labels[priority] || priority;
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      low: 'text-slate-600 bg-slate-100 border-slate-200',
      medium: 'text-amber-700 bg-amber-50 border-amber-200',
      high: 'text-orange-700 bg-orange-50 border-orange-200',
      urgent: 'text-red-700 bg-red-50 border-red-200',
      critical: 'text-red-700 bg-red-50 border-red-200'
    };
    return styles[priority] || styles.medium;
  };

  const getPriorityDot = (priority) => {
    const dots = {
      low: 'bg-slate-400',
      medium: 'bg-amber-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500',
      critical: 'bg-red-500'
    };
    return dots[priority] || dots.medium;
  };

  // Count completed sections
  const sections = [
    { filled: !!(formData.title && formData.description && formData.category && formData.priority) },
    { filled: !!(formData.location?.address) },
    { filled: !!(formData.photos?.length > 0) },
    { filled: !!(formData.reporterName && formData.reporterEmail) }
  ];
  const filledCount = sections.filter(s => s.filled).length;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-card rounded-xl border border-border p-6 civic-shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
              <Icon name="ClipboardCheck" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Review Your Report</h2>
              <p className="text-sm text-text-secondary">Please verify everything looks correct before submitting</p>
            </div>
          </div>
        </div>

        {/* Completeness bar */}
        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
          <div className="flex gap-1.5">
            {sections.map((s, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${s.filled ? 'bg-success' : 'bg-border'}`} />
            ))}
          </div>
          <span className="text-xs text-text-secondary">{filledCount} of {sections.length} sections completed</span>
        </div>
      </div>

      {/* Issue Overview Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden civic-shadow-card">
        <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="FileText" size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Issue Details</h3>
          </div>
          <button
            onClick={() => onEdit('details')}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
          >
            <Icon name="Pencil" size={12} />
            Edit
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-medium mb-1">Title</p>
            <p className="text-lg font-semibold text-foreground leading-snug">{formData.title}</p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-medium mb-1">Description</p>
            <p className="text-sm text-foreground leading-relaxed bg-muted/20 rounded-lg p-3 border border-border/50">{formData.description}</p>
          </div>

          {/* Category + Priority - side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-medium mb-2">Category</p>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/15 rounded-lg">
                <Icon name={getCategoryIcon(formData.category)} size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">{getCategoryLabel(formData.category)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-medium mb-2">Priority</p>
              <div className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg ${getPriorityStyle(formData.priority)}`}>
                <div className={`w-2 h-2 rounded-full ${getPriorityDot(formData.priority)}`} />
                <span className="text-sm font-medium capitalize">{getPriorityLabel(formData.priority)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden civic-shadow-card">
        <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Location</h3>
          </div>
          <button
            onClick={() => onEdit('location')}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
          >
            <Icon name="Pencil" size={12} />
            Edit
          </button>
        </div>

        <div className="p-6">
          {formData.location?.address ? (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="MapPin" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{formData.location.address}</p>
                {formData.location?.coordinates && (
                  <p className="text-xs text-text-secondary font-mono mt-1">
                    {formData.location.coordinates.lat?.toFixed(6)}, {formData.location.coordinates.lng?.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Icon name="MapPinOff" size={18} className="text-text-secondary" />
              <span className="text-sm text-text-secondary italic">No location provided</span>
              <button onClick={() => onEdit('location')} className="ml-auto text-xs text-primary font-medium hover:underline">Add location</button>
            </div>
          )}
        </div>
      </div>

      {/* Photos Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden civic-shadow-card">
        <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="Camera" size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Photos {formData.photos?.length > 0 && <span className="text-text-secondary font-normal">({formData.photos.length})</span>}
            </h3>
          </div>
          <button
            onClick={() => onEdit('photos')}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
          >
            <Icon name="Pencil" size={12} />
            Edit
          </button>
        </div>

        <div className="p-6">
          {formData.photos && formData.photos.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  <img
                    src={photo.preview || photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Icon name="ImageOff" size={18} className="text-text-secondary" />
              <span className="text-sm text-text-secondary italic">No photos attached</span>
              <button onClick={() => onEdit('photos')} className="ml-auto text-xs text-primary font-medium hover:underline">Add photos</button>
            </div>
          )}
        </div>
      </div>

      {/* Reporter Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden civic-shadow-card">
        <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="User" size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Reporter Information</h3>
          </div>
          <button
            onClick={() => onEdit('details')}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
          >
            <Icon name="Pencil" size={12} />
            Edit
          </button>
        </div>

        <div className="p-6">
          {formData.isAnonymous && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-warning/10 rounded-lg border border-warning/20">
              <Icon name="EyeOff" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">Anonymous Report — Your identity will be hidden publicly</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={16} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-[11px] text-text-secondary uppercase tracking-wider">Name</p>
                <p className="text-sm font-medium text-foreground">{formData.isAnonymous ? 'Anonymous' : formData.reporterName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Mail" size={16} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-[11px] text-text-secondary uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-foreground">{formData.isAnonymous ? 'Hidden' : formData.reporterEmail}</p>
              </div>
            </div>
            {formData.reporterPhone && !formData.isAnonymous && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Phone" size={16} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-foreground">{formData.reporterPhone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-card rounded-xl border border-border p-6 civic-shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12"
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Back to Edit
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            loading={isSubmitting}
            className="flex-1 h-12 text-base"
            iconName="Send"
            iconPosition="right"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>

        <p className="text-[11px] text-text-secondary text-center mt-4 leading-relaxed">
          By submitting, you confirm the information is accurate. Your report will be reviewed and assigned to the appropriate authority.
        </p>
      </div>
    </div>
  );
};

export default ReportSummary;
