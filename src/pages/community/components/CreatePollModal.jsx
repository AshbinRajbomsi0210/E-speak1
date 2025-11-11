import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CreatePollModal = ({ isOpen, onClose, onCreatePoll }) => {
  const [pollData, setPollData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    category: 'general',
    duration: '7'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setPollData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollData?.options];
    newOptions[index] = value;
    setPollData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (pollData?.options?.length < 6) {
      setPollData(prev => ({
        ...prev,
        options: [...prev?.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (pollData?.options?.length > 2) {
      const newOptions = pollData?.options?.filter((_, i) => i !== index);
      setPollData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!pollData?.title?.trim()) {
      newErrors.title = 'Poll title is required';
    }
    
    if (!pollData?.description?.trim()) {
      newErrors.description = 'Poll description is required';
    }
    
    const validOptions = pollData?.options?.filter(opt => opt?.trim());
    if (validOptions?.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (validateForm()) {
      const validOptions = pollData?.options?.filter(opt => opt?.trim());
      const newPoll = {
        ...pollData,
        options: validOptions?.map(text => ({ text, votes: 0 })),
        id: Date.now(),
        status: 'active',
        createdAt: new Date()?.toISOString(),
        endDate: new Date(Date.now() + parseInt(pollData.duration) * 24 * 60 * 60 * 1000)?.toISOString(),
        commentsCount: 0,
        hasUserVoted: false
      };
      
      onCreatePoll(newPoll);
      setPollData({
        title: '',
        description: '',
        options: ['', ''],
        category: 'general',
        duration: '7'
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Poll</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Poll Title"
            type="text"
            placeholder="Enter poll title"
            value={pollData?.title}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            error={errors?.title}
            required
          />
          
          <Input
            label="Description"
            type="text"
            placeholder="Describe what this poll is about"
            value={pollData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            error={errors?.description}
            required
          />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Poll Options</label>
              {errors?.options && (
                <span className="text-sm text-error">{errors?.options}</span>
              )}
            </div>
            
            {pollData?.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e?.target?.value)}
                  className="flex-1"
                />
                {pollData?.options?.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
            ))}
            
            {pollData?.options?.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Icon name="Plus" size={16} />
                <span className="ml-2">Add Option</span>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={pollData?.category}
                onChange={(e) => handleInputChange('category', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="environment">Environment</option>
                <option value="safety">Public Safety</option>
                <option value="transportation">Transportation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Duration</label>
              <select
                value={pollData?.duration}
                onChange={(e) => handleInputChange('duration', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">1 Week</option>
                <option value="14">2 Weeks</option>
                <option value="30">1 Month</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Create Poll
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
