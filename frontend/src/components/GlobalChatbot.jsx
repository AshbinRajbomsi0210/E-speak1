import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';

const GlobalChatbot = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Listen for open chatbot event
  useEffect(() => {
    const handleOpenChatbot = () => setShowChatbot(true);
    window.addEventListener('openCivicChatbot', handleOpenChatbot);
    return () => window.removeEventListener('openCivicChatbot', handleOpenChatbot);
  }, []);

  useEffect(() => {
    if (showChatbot && chatMessages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `👋 Hello! I'm your Civic AI Assistant, trained on thousands of civic service cases from around the world.

I can help you understand:
• How cities typically handle different types of issues
• Which departments manage specific problems
• Best practices for reporting civic issues

Feel free to ask me anything about civic services!`
      };
      setChatMessages([welcomeMessage]);
    }
  }, [showChatbot]);

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
        aiResponse = "Hello! 👋 I'm here to help you understand civic issues and how cities handle them. You can ask me about departments, common issues, or anything related to civic services. What would you like to know?";
      }
      // Thanks
      else if (['thanks', 'thank you', 'thx'].some(thanks => lowerText.includes(thanks))) {
        aiResponse = "You're welcome! Feel free to ask if you have any other questions about civic issues. I'm here to help! 😊";
      }
      // Help
      else if (lowerText.includes('help') && lowerText.length < 20) {
        aiResponse = "I can help you with:\n\n• Understanding how cities handle different types of civic issues\n• Which departments manage specific problems\n• Common patterns in civic service delivery\n\nJust ask me a specific question about any civic issue!";
      }
      // Who are you
      else if (lowerText.includes('who are you') || lowerText.includes('what are you')) {
        aiResponse = "I'm Civic AI Assistant, trained on thousands of civic service cases from urban areas worldwide. I use this knowledge to help you understand how cities typically handle civic issues, which departments are responsible, and what to expect. Ask me anything about civic services!";
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
        const errorMessage = { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I couldn\'t connect to the server. Please check your connection.' 
      };
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

  return (
    <>
      {/* Floating Chatbot Button */}
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
          title="Open Civic AI Chatbot"
        >
          <Icon name="MessageCircle" size={24} className="text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Civic AI Chatbot - Right Corner */}
      {showChatbot && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Icon name="Bot" size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Civic AI Chatbot
                </h3>
                <p className="text-xs text-gray-600">
                  Ask about civic issues
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChatbot(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-200 rounded"
                title="Minimize"
              >
                <Icon name="Minimize2" size={16} />
              </button>
              <button
                onClick={() => {
                  setShowChatbot(false);
                  setChatMessages([]);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-200 rounded"
                title="Close"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg p-2 text-xs ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      {msg.role === 'assistant' && (
                        <Icon name="Bot" size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isSendingMessage && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Icon name="Bot" size={12} className="text-green-600" />
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about civic issues..."
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={() => sendChatMessage()}
                disabled={!chatInput.trim() || isSendingMessage}
                className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Icon name="Send" size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Ask about departments, resolution times & more
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalChatbot;
