import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CreateDiscussionModal = ({ isOpen, onClose, onCreateDiscussion }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Topic title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Discussion content is required';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Content must be at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onCreateDiscussion(formData);
      setFormData({ title: '', content: '', category: 'general' });
      setErrors({});
      onClose();
    } catch (error) {
      setErrors({ general: 'Failed to create discussion. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', content: '', category: 'general' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const categories = [
    { value: 'general', label: 'General', icon: 'MessageSquare', color: 'bg-gray-100 text-gray-700' },
    { value: 'infrastructure', label: 'Infrastructure', icon: 'Building', color: 'bg-blue-100 text-blue-700' },
    { value: 'environment', label: 'Environment', icon: 'Leaf', color: 'bg-green-100 text-green-700' },
    { value: 'safety', label: 'Safety', icon: 'Shield', color: 'bg-red-100 text-red-700' },
    { value: 'transportation', label: 'Transportation', icon: 'Car', color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon name="MessageSquarePlus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Start New Discussion</h2>
              <p className="text-sm text-gray-500">Share your thoughts with the community</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="hover:bg-gray-100 rounded-full">
            <Icon name="X" size={20} />
          </Button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-red-500" />
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}
          
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Topic Title</label>
            <input
              type="text"
              placeholder="What would you like to discuss?"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full h-12 px-4 text-base border-2 rounded-xl bg-white font-medium transition-all duration-200 ${
                errors.title 
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : 'border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10'
              } focus:outline-none`}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                {errors.title}
              </p>
            )}
          </div>
          
          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleInputChange('category', cat.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.category === cat.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <Icon name={cat.icon} size={16} />
                  </div>
                  <span className={`text-xs font-medium ${formData.category === cat.value ? 'text-primary' : 'text-gray-600'}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Discussion Content</label>
            <textarea
              placeholder="Share your thoughts, ideas, or questions in detail..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              className={`w-full px-4 py-3 text-base border-2 rounded-xl bg-white font-medium transition-all duration-200 resize-none ${
                errors.content 
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                  : 'border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10'
              } focus:outline-none`}
            />
            <div className="flex items-center justify-between">
              {errors.content ? (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors.content}
                </p>
              ) : (
                <span className="text-xs text-gray-400">Minimum 20 characters</span>
              )}
              <span className={`text-xs ${formData.content.length >= 20 ? 'text-green-500' : 'text-gray-400'}`}>
                {formData.content.length} characters
              </span>
            </div>
          </div>
          
          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Icon name="Lightbulb" size={20} className="text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Tips for a great discussion:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                  <li>Be specific and provide context</li>
                  <li>Ask clear questions or share actionable ideas</li>
                  <li>Be respectful and constructive</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader" size={16} className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Icon name="Send" size={16} className="mr-2" />
                Start Discussion
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateDiscussionModal;
