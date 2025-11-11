import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const IssueForm = ({ formData, onFormChange, onSubmit, isSubmitting }) => {
  const [charCount, setCharCount] = useState(formData?.description?.length || 0);
  const maxChars = 500;

  const categoryOptions = [
    { value: 'infrastructure', label: 'Infrastructure', description: 'Roads, bridges, utilities' },
    { value: 'public-safety', label: 'Public Safety', description: 'Crime, lighting, emergency services' },
    { value: 'environment', label: 'Environment', description: 'Pollution, waste, green spaces' },
    { value: 'transportation', label: 'Transportation', description: 'Traffic, parking, public transit' },
    { value: 'community-services', label: 'Community Services', description: 'Parks, libraries, facilities' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', description: 'Minor inconvenience' },
    { value: 'medium', label: 'Medium Priority', description: 'Moderate impact' },
    { value: 'high', label: 'High Priority', description: 'Significant impact' },
    { value: 'urgent', label: 'Urgent', description: 'Immediate attention required' }
  ];

  const handleDescriptionChange = (e) => {
    const value = e?.target?.value;
    if (value?.length <= maxChars) {
      setCharCount(value?.length);
      onFormChange('description', value);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 civic-shadow-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="FileText" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Issue Details</h2>
          <p className="text-sm text-text-secondary">Provide comprehensive information about the issue</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Issue Title"
          type="text"
          placeholder="Brief, descriptive title of the issue"
          value={formData?.title || ''}
          onChange={(e) => onFormChange('title', e?.target?.value)}
          required
          maxLength={100}
          description="Keep it concise and specific"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            className="w-full min-h-[120px] px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
            placeholder="Provide detailed information about the issue, including when it started, how it affects the community, and any relevant context..."
            value={formData?.description || ''}
            onChange={handleDescriptionChange}
            required
            maxLength={maxChars}
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">Be specific and include relevant details</span>
            <span className={`${charCount > maxChars * 0.9 ? 'text-warning' : 'text-text-secondary'}`}>
              {charCount}/{maxChars}
            </span>
          </div>
        </div>

        <Select
          label="Issue Category"
          placeholder="Select the most appropriate category"
          options={categoryOptions}
          value={formData?.category || ''}
          onChange={(value) => onFormChange('category', value)}
          required
          description="This helps route your issue to the right department"
        />

        <Select
          label="Priority Level"
          placeholder="How urgent is this issue?"
          options={priorityOptions}
          value={formData?.priority || ''}
          onChange={(value) => onFormChange('priority', value)}
          required
          description="Help us understand the urgency of this matter"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Your Name"
            type="text"
            placeholder="Full name"
            value={formData?.reporterName || ''}
            onChange={(e) => onFormChange('reporterName', e?.target?.value)}
            required
          />
          
          <Input
            label="Contact Email"
            type="email"
            placeholder="your.email@example.com"
            value={formData?.reporterEmail || ''}
            onChange={(e) => onFormChange('reporterEmail', e?.target?.value)}
            required
            description="For updates on your report"
          />
        </div>

        <Input
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData?.reporterPhone || ''}
          onChange={(e) => onFormChange('reporterPhone', e?.target?.value)}
          description="In case we need to contact you directly"
        />

        <div className="pt-4 border-t border-border">
          <Button
            type="submit"
            variant="default"
            size="lg"
            loading={isSubmitting}
            iconName="Send"
            iconPosition="right"
            className="w-full md:w-auto"
            disabled={!formData?.title || !formData?.description || !formData?.category || !formData?.priority || !formData?.reporterName || !formData?.reporterEmail}
          >
            {isSubmitting ? 'Processing Report...' : 'Submit Issue Report'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IssueForm;