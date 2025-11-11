import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIAssistant = ({ formData, onSuggestionApply }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mockSuggestions = [
    {
      id: 1,
      type: 'category',
      title: 'Suggested Category: Infrastructure',
      description: 'Based on keywords like "pothole" and "road", this appears to be an infrastructure issue.',
      confidence: 92,
      action: () => onSuggestionApply('category', 'infrastructure')
    },
    {
      id: 2,
      type: 'priority',
      title: 'Recommended Priority: High',
      description: 'Safety-related keywords detected. This may require urgent attention.',
      confidence: 87,
      action: () => onSuggestionApply('priority', 'high')
    },
    {
      id: 3,
      type: 'enhancement',
      title: 'Title Enhancement',
      description: 'Consider adding location details to make the title more specific.',
      confidence: 78,
      action: () => onSuggestionApply('title', `${formData?.title} - Main Street Area`)
    }
  ];

  const mockDuplicates = [
    {
      id: 'dup-1',
      title: 'Large pothole on Main Street causing vehicle damage',
      reportedDate: '2025-11-08',
      status: 'Under Review',
      similarity: 94,
      reportId: 'RPT-2025-1108-001'
    },
    {
      id: 'dup-2', 
      title: 'Road damage near downtown intersection',
      reportedDate: '2025-11-07',
      status: 'In Progress',
      similarity: 76,
      reportId: 'RPT-2025-1107-003'
    }
  ];

  useEffect(() => {
    if (formData?.title && formData?.description) {
      setIsAnalyzing(true);
      
      // Simulate AI analysis delay
      const timer = setTimeout(() => {
        // Check for potential duplicates
        if (formData?.title?.toLowerCase()?.includes('pothole') || 
            formData?.description?.toLowerCase()?.includes('road damage')) {
          setDuplicateWarning(mockDuplicates?.[0]);
        } else {
          setDuplicateWarning(null);
        }
        
        // Generate suggestions based on content
        const relevantSuggestions = mockSuggestions?.filter(suggestion => {
          if (suggestion?.type === 'category') {
            return formData?.description?.toLowerCase()?.includes('road') || 
                   formData?.description?.toLowerCase()?.includes('pothole');
          }
          if (suggestion?.type === 'priority') {
            return formData?.description?.toLowerCase()?.includes('safety') ||
                   formData?.description?.toLowerCase()?.includes('dangerous');
          }
          return true;
        });
        
        setSuggestions(relevantSuggestions);
        setIsAnalyzing(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setDuplicateWarning(null);
    }
  }, [formData?.title, formData?.description]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 75) return 'text-warning';
    return 'text-text-secondary';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 90) return 'bg-success/10 border-success/20';
    if (confidence >= 75) return 'bg-warning/10 border-warning/20';
    return 'bg-muted border-border';
  };

  if (!formData?.title && !formData?.description) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 civic-shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Icon name="Bot" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">AI Assistant</h2>
            <p className="text-sm text-text-secondary">Get smart suggestions as you type</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Icon name="MessageSquare" size={48} className="text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Start filling out the form to receive AI-powered suggestions and duplicate detection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 civic-shadow-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Icon name="Bot" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">AI Assistant</h2>
          <p className="text-sm text-text-secondary">Smart suggestions for your report</p>
        </div>
      </div>
      {isAnalyzing && (
        <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg mb-4">
          <div className="animate-spin">
            <Icon name="Loader2" size={20} className="text-primary" />
          </div>
          <span className="text-sm text-text-secondary">Analyzing your report...</span>
        </div>
      )}
      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Potential Duplicate Detected ({duplicateWarning?.similarity}% match)
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                A similar issue may already be reported:
              </p>
              <div className="bg-background rounded p-3 mb-3">
                <p className="text-sm font-medium text-foreground">{duplicateWarning?.title}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-text-secondary">
                  <span>ID: {duplicateWarning?.reportId}</span>
                  <span>Reported: {duplicateWarning?.reportedDate}</span>
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded">
                    {duplicateWarning?.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  View Existing Report
                </Button>
                <Button variant="ghost" size="sm">
                  Continue Anyway
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* AI Suggestions */}
      {suggestions?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Smart Suggestions</h3>
          
          {suggestions?.map((suggestion) => (
            <div
              key={suggestion?.id}
              className={`p-4 rounded-lg border ${getConfidenceBg(suggestion?.confidence)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-foreground">
                      {suggestion?.title}
                    </h4>
                    <span className={`text-xs font-medium ${getConfidenceColor(suggestion?.confidence)}`}>
                      {suggestion?.confidence}% confident
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    {suggestion?.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={suggestion?.action}
                    iconName="Check"
                    iconPosition="left"
                  >
                    Apply Suggestion
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* AI Tips */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
          <Icon name="Sparkles" size={16} className="mr-2 text-primary" />
          AI Tips
        </h4>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• Include specific keywords for better categorization</li>
          <li>• Mention safety concerns to get appropriate priority</li>
          <li>• Add location details for more accurate duplicate detection</li>
          <li>• Use clear, descriptive language for better AI analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default AIAssistant;