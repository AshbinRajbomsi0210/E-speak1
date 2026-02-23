import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIAssistant = ({ formData, onSuggestionApply, onSuggestionsGenerated, appliedFields = new Set() }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const mockSuggestions = [
    {
      id: 1,
      type: 'category',
      title: 'Suggested Category: Infrastructure',
      description: 'Based on keywords like "pothole" and "road", this appears to be an infrastructure issue.',
      benefit: 'Helps route your report to the right department faster',
      confidence: 92,
      field: 'category',
      value: 'infrastructure'
    },
    {
      id: 2,
      type: 'priority',
      title: 'Recommended Priority: High',
      description: 'Safety-related keywords detected. This may require urgent attention.',
      benefit: 'Ensures faster response time from authorities',
      confidence: 87,
      field: 'priority',
      value: 'high'
    },
    {
      id: 4,
      type: 'photo',
      title: '📸 Photo Reminder',
      description: 'Adding photos helps authorities understand and resolve issues 3x faster.',
      benefit: '70% of reports with photos get resolved within 7 days',
      confidence: 95,
      field: 'reminder',
      value: 'photo'
    },
    {
      id: 5,
      type: 'description',
      title: '✍️ Description Tips',
      description: 'Include specific details like timing, frequency, and exact location for better assistance.',
      benefit: 'Detailed reports get assigned to the right team 2x faster',
      confidence: 88,
      field: 'tip',
      value: 'description'
    }
  ];

  // Generate creative title enhancements
  const generateTitleEnhancement = (title, description) => {
    if (!title || !description || title.length < 5) return null;

    const lowerDesc = description.toLowerCase();
    const lowerTitle = title.toLowerCase();
    let enhancedTitle = title;
    let improved = false;

    // Simple improvements based on keywords
    const improvements = {
      'noise': () => !lowerTitle.includes('noise') ? `Noise Issue: ${title}` : null,
      'pothole': () => !lowerTitle.includes('dangerous') && !lowerTitle.includes('large') ? `Large ${title}` : null,
      'garbage': () => !lowerTitle.includes('uncollected') ? `Uncollected Garbage: ${title}` : null,
      'trash': () => !lowerTitle.includes('overflow') ? `Overflowing ${title}` : null,
      'broken': () => !lowerTitle.includes('damaged') ? title.replace(/broken/i, 'Damaged') : null,
      'light': () => lowerDesc.includes('street') && !lowerTitle.includes('street') ? `Broken Street Light: ${title}` : null,
      'water leak': () => !lowerTitle.includes('leak') ? `Water Leak: ${title}` : null,
      'graffiti': () => !lowerTitle.includes('vandalism') ? `Graffiti: ${title}` : null
    };

    // Apply first matching improvement
    for (const [keyword, improver] of Object.entries(improvements)) {
      if (lowerDesc.includes(keyword)) {
        const improved = improver();
        if (improved) {
          enhancedTitle = improved;
          return enhancedTitle.length <= 80 ? enhancedTitle : null;
        }
      }
    }

    // Add simple location context if very specific
    const streetMatch = description.match(/\b([A-Z][a-z]+\s+(?:Street|St|Road|Rd|Avenue|Ave))\b/);
    if (streetMatch && !title.includes(streetMatch[1]) && title.length < 40) {
      enhancedTitle = `${title} on ${streetMatch[1]}`;
      return enhancedTitle.length <= 80 ? enhancedTitle : null;
    }

    // Only add urgency for truly urgent cases
    if ((lowerDesc.includes('dangerous') || lowerDesc.includes('emergency')) && 
        !lowerTitle.includes('urgent') && !lowerTitle.includes('emergency')) {
      enhancedTitle = `Urgent: ${title}`;
      return enhancedTitle.length <= 80 ? enhancedTitle : null;
    }

    return null;
  };

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

  // Fetch AI insights from civic AI chatbot
  const fetchAIInsights = async () => {
    if (!formData?.description || formData.description.length < 20) {
      setAiInsights(null);
      return;
    }

    setIsAnalyzing(true);

    try {
      // Build a concise, specific question
      const question = `In 2-3 sentences: For ${formData.category || 'civic'} issues like "${formData.description.substring(0, 80)}", which department handles this and typical resolution time?`;

      const response = await fetch('http://localhost:8000/api/civic-ai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Parse answer into bullet points (2-3 max)
        const sentences = data.answer.split(/[.!?]\s+/).filter(s => s.trim().length > 15);
        const bulletPoints = sentences.slice(0, 3).map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
        
        setAiInsights({
          points: bulletPoints,
          confidence: data.confidence,
          context: data.context
        });
      }
    } catch (error) {
      console.error('AI insights error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (formData?.title && formData?.description) {
      setIsAnalyzing(true);
      
      // Debounce AI analysis
      const timer = setTimeout(() => {
        // Check for potential duplicates
        if (formData?.title?.toLowerCase()?.includes('pothole') || 
            formData?.description?.toLowerCase()?.includes('road damage')) {
          setDuplicateWarning(mockDuplicates?.[0]);
        } else {
          setDuplicateWarning(null);
        }
        
        // Generate suggestions based on content — skip fields already applied
        const relevantSuggestions = mockSuggestions?.filter(suggestion => {
          // Skip if this field had a suggestion already applied
          if (appliedFields.has(suggestion?.field)) return false;

          if (suggestion?.type === 'category') {
            return formData?.description?.toLowerCase()?.includes('road') || 
                   formData?.description?.toLowerCase()?.includes('pothole');
          }
          if (suggestion?.type === 'priority') {
            return formData?.description?.toLowerCase()?.includes('safety') ||
                   formData?.description?.toLowerCase()?.includes('dangerous');
          }
          if (suggestion?.type === 'photo') {
            return (!formData?.photos || formData.photos.length === 0);
          }
          if (suggestion?.type === 'description') {
            return formData?.description && formData.description.length < 100;
          }
          return false;
        });

        // Add creative title enhancement if possible (skip if title already had suggestion applied)
        const enhancedTitle = appliedFields.has('title') ? null : generateTitleEnhancement(formData.title, formData.description);
        if (enhancedTitle) {
          relevantSuggestions.push({
            id: 3,
            type: 'enhancement',
            title: '✨ Enhanced Title Suggestion',
            description: 'We\'ve crafted a more descriptive and attention-grabbing title for your report.',
            benefit: 'Clear titles help officials prioritize and respond faster',
            enhancedTitle: enhancedTitle,
            confidence: 85,
            field: 'title',
            value: enhancedTitle
          });
        }
        
        setSuggestions(relevantSuggestions);

        // Emit suggestions to parent for inline display in the form
        if (onSuggestionsGenerated) {
          onSuggestionsGenerated(relevantSuggestions);
        }
        
        // Fetch real AI insights
        fetchAIInsights();
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setDuplicateWarning(null);
      setAiInsights(null);
    }
  }, [formData?.title, formData?.description, formData?.category]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-green-500';
    return 'text-text-secondary';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 90) return 'bg-green-50 border-green-200';
    if (confidence >= 75) return 'bg-green-50 border-green-200';
    return 'bg-muted border-border';
  };

  const sendChatMessage = async (messageText) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim() || isSendingMessage) return;

    const userMessage = { role: 'user', content: textToSend };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsSendingMessage(true);

    try {
      // Handle simple conversational queries without RAG
      const lowerText = textToSend.toLowerCase().trim();
      let aiResponse = null;

      // Greetings
      if (['hi', 'hello', 'hey', 'greetings'].some(greeting => lowerText === greeting)) {
        aiResponse = "Hello! 👋 I'm here to help you understand civic issues and how cities handle them. You can ask me about departments, resolution times, common issues, or anything related to civic services. What would you like to know?";
      }
      // Thanks
      else if (['thanks', 'thank you', 'thx'].some(thanks => lowerText.includes(thanks))) {
        aiResponse = "You're welcome! Feel free to ask if you have any other questions about civic issues. I'm here to help! 😊";
      }
      // Help
      else if (lowerText.includes('help') && lowerText.length < 20) {
        aiResponse = "I can help you with:\n\n• Understanding how cities handle different types of civic issues\n• Typical resolution times for complaints\n• Which departments manage specific problems\n• Common patterns in civic service delivery\n\nJust ask me a specific question about any civic issue!";
      }
      // Who are you
      else if (lowerText.includes('who are you') || lowerText.includes('what are you')) {
        aiResponse = "I'm Civic AI Assistant, trained on thousands of civic service cases from urban areas worldwide. I use this knowledge to help you understand how cities typically handle civic issues, which departments are responsible, and what to expect for resolution times. Ask me anything about civic services!";
      }

      // If we have a conversational response, use it
      if (aiResponse) {
        const aiMessage = { role: 'assistant', content: aiResponse };
        setChatMessages(prev => [...prev, aiMessage]);
        setIsSendingMessage(false);
        return;
      }

      // Otherwise, use RAG for civic-specific questions
      const response = await fetch('http://localhost:8000/api/civic-ai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = { role: 'assistant', content: data.answer };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'assistant', content: 'Connection error. Please make sure the backend is running.' };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // Initialize chat with welcome message when opened
  React.useEffect(() => {
    if (showChat && chatMessages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `👋 Hello! I'm your Civic AI Assistant, trained on thousands of civic service cases from around the world.

I can help you understand:
• How cities typically handle different types of issues
• Expected resolution times for civic complaints
• Which departments manage specific problems
• Best practices for reporting civic issues

Feel free to ask me anything about civic services!`
      };
      setChatMessages([welcomeMessage]);
    }
  }, [showChat]);

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
      {/* Inline suggestions indicator */}
      {suggestions?.length > 0 && (
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Icon name="Sparkles" size={16} />
            <span className="font-medium">{suggestions.filter(s => s.type === 'category' || s.type === 'priority' || s.type === 'enhancement').length} suggestion{suggestions.filter(s => s.type === 'category' || s.type === 'priority' || s.type === 'enhancement').length !== 1 ? 's' : ''} available</span>
          </div>
          <p className="text-xs text-text-secondary mt-1 ml-6">Look for the suggestion chips next to form fields</p>
        </div>
      )}

      {/* AI Civic Insights - Compact */}
      {aiInsights ? (
        <div className="mt-6 p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-lg border border-green-200 shadow-sm">
          <div className="flex items-start gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <Icon name="Bot" size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-900 mb-2">Quick Insights</p>
              <ul className="space-y-1">
                {aiInsights.points?.map((point, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            💡 Based on similar civic cases
          </div>
        </div>
      ) : formData?.description && formData.description.length > 20 ? (
        <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-xs text-green-600">
            <div className="animate-spin">
              <Icon name="Loader2" size={14} />
            </div>
            <span>Analyzing your issue...</span>
          </div>
        </div>
      ) : null}

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
          <li>• AI learns from thousands of civic cases worldwide</li>
        </ul>
      </div>

    </div>
  );
};

export default AIAssistant;