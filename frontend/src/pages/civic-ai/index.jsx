import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Database, Info, Sparkles } from 'lucide-react';
import Header from '../../components/ui/Header';

const CivicAI = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your Civic AI Assistant - trained on urban civic service patterns from around the world.

🎓 **What I've Learned:**
I've analyzed thousands of civic service cases to understand how cities handle:
• Waste management and sanitation
• Noise complaints and public disturbances  
• Water system issues
• Road and infrastructure problems
• Public safety concerns

💡 **How I Help:**
I provide insights based on patterns from successful civic systems. My knowledge applies to ANY city - whether you're in Kathmandu, New York, or anywhere else.

🔍 **Ask Me About:**
• "What's the typical timeline for resolving road issues?"
• "How do cities handle noise complaints effectively?"
• "What departments typically manage water system problems?"
• "What are common patterns in civic issue resolution?"

My insights are based on real civic data patterns, not tied to any specific city!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch stats
    fetch('http://localhost:8000/api/civic-ai/stats/')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/civic-ai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.answer, confidence: data.confidence },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ Error: ${data.error || 'Failed to get response'}`,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Connection error. Please ensure the backend server is running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exampleQuestions = [
    'What are common civic complaints in urban areas?',
    'How long does it take to resolve noise complaints typically?',
    'Which departments handle infrastructure issues?',
    'What are effective patterns for waste management?',
    'How can cities improve civic response times?',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Civic AI Assistant
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Universal Civic Insights from Global Patterns
                  </p>
                </div>
              </div>
            </div>

            {stats && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-2 font-semibold">
                  <Database size={18} />
                  <span>Knowledge Base</span>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between gap-4">
                    <span>Documents:</span>
                    <span className="font-semibold">
                      {stats.total_documents?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Dimension:</span>
                    <span className="font-semibold">{stats.dimension}D</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Index:</span>
                    <span className="font-semibold capitalize">{stats.index_type}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-900">
              <strong>How it works:</strong> This AI learns from analyzing thousands of
              civic service cases worldwide using RAG (Retrieval-Augmented Generation).
              It identifies universal patterns in how cities handle civic issues -
              response times, department responsibilities, and resolution methods.
              <strong> The insights apply to ANY city,</strong> helping you understand
              what to expect when reporting issues through e-Speak.
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Messages Area */}
          <div className="h-[550px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-fade-in`}
              >
                {message.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot size={20} className="text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  {message.confidence !== undefined && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Confidence: {(message.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Example Questions */}
          {messages.length === 1 && !loading && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">
                💡 Try asking (works for ANY city):
              </p>
              <div className="grid grid-cols-1 gap-2">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-3 rounded-lg transition-all border border-transparent hover:border-blue-200"
                  >
                    → {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about civic patterns, resolution timelines, or best practices..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Send size={20} />
                <span className="hidden sm:inline font-medium">Send</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicAI;
