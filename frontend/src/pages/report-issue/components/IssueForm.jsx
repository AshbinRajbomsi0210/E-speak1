import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const countryCodes = [
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
];

const IssueForm = ({ formData, onFormChange }) => {
  const [charCount, setCharCount] = useState(formData?.description?.length || 0);
  const [countryCode, setCountryCode] = useState('+977');
  const maxChars = 500;

  const categoryOptions = [
    { value: 'infrastructure', label: 'Infrastructure', description: 'Roads, bridges, utilities' },
    { value: 'public safety', label: 'Public Safety', description: 'Crime, lighting, emergency services' },
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

  const preventSubmit = (e) => {
    e?.preventDefault();
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
      <form onSubmit={preventSubmit} className="space-y-6">
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
            className="w-full min-h-[120px] px-4 py-3 border-2 border-slate-300 rounded-lg bg-white text-slate-900 font-medium shadow-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:bg-slate-50 disabled:opacity-50 resize-vertical transition-all duration-200"
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

        {/* Anonymous Reporting Toggle - Prominent placement */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-5 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="flex items-center h-6 pt-0.5">
              <input
                type="checkbox"
                id="anonymousReport"
                checked={formData?.isAnonymous || false}
                onChange={(e) => onFormChange('isAnonymous', e.target.checked)}
                className="w-6 h-6 rounded-md border-2 border-primary/50 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer transition-colors"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="anonymousReport" className="flex items-center gap-2 text-base font-semibold text-foreground cursor-pointer">
                <Icon name="Shield" size={20} className="text-primary" />
                Report Anonymously
              </label>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Protect your identity while still making your voice heard. Your name will appear as "Anonymous" on the public issue report. 
                Your email will be stored securely for administrative purposes only.
              </p>
              {formData?.isAnonymous && (
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-success bg-success/10 px-3 py-2 rounded-lg w-fit">
                  <Icon name="CheckCircle" size={16} />
                  <span>Your identity will be protected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={formData?.isAnonymous ? "Your Name (hidden from public)" : "Your Name"}
            type="text"
            placeholder={formData?.isAnonymous ? "Your name (will be kept private)" : "Full name"}
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
            description={formData?.isAnonymous ? "Private - only for receiving updates" : "For updates on your report"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Phone Number (Optional)
          </label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-2 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-700 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer appearance-none"
              style={{ minWidth: '110px' }}
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone number"
              value={formData?.reporterPhone || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                onFormChange('reporterPhone', value);
              }}
              maxLength={15}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <p className="text-xs text-text-secondary">Select country code and enter phone number</p>
        </div>

      </form>
    </div>
  );
};

export default IssueForm;