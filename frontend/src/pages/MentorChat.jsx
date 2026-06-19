import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Circle, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/app-store';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function MentorChat() {
  const { user, profile } = useAuth();
  const messages = useAppStore((state) => state.mentorMessages) || [];
  const setMessages = useAppStore((state) => state.setMentorMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef(null);

  // Monitor network online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    const firstName = profile?.full_name?.split(' ')[0] || 'there';
    const expectedGreeting = `Hi ${firstName}! 👋 I'm your AI career mentor powered by NextStep AI. I can help you with interview prep, career guidance, resume tips, DSA questions, and project ideas. What would you like to work on today?`;

    if (messages.length === 0) {
      setMessages([
        { role: 'assistant', content: expectedGreeting }
      ]);
    } else {
      const firstMsg = messages[0];
      if (firstMsg?.role === 'assistant' && firstMsg?.content && firstMsg.content.includes("I'm your AI career mentor powered by NextStep AI")) {
        const expectedGreetingStart = `Hi ${firstName}! 👋`;
        if (!firstMsg.content.startsWith(expectedGreetingStart)) {
          const updated = [...messages];
          updated[0] = { ...firstMsg, content: expectedGreeting };
          setMessages(updated);
        }
      }
    }
  }, [messages.length, profile, setMessages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection.');
      }

      const res = await fetch(`${API_URL}/api/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          student_id: user?.id || 'anon',
          career_goal: profile?.career_goal || 'Software Engineer',
          history: updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success === false) {
        throw new Error(data.error || 'Failed to generate AI response');
      }

      setMessages([
        ...updatedMessages, 
        { 
          role: 'assistant', 
          content: data.response || 'Let me think about that...', 
          model: data.model_used 
        }
      ]);
    } catch (err) {
      const friendlyError = `⚠️ Connection Error: ${err.message || 'Unable to connect to the AI Mentor service.'} Please try again.`;
      setMessages([
        ...updatedMessages, 
        { 
          role: 'assistant', 
          content: friendlyError, 
          isError: true 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quickActions = [
    'Improve my Resume', 'How to improve DSA?', 'Interview Tips',
    `Career path for ${profile?.career_goal || 'Software Engineer'}`, 'Suggest a Project idea'
  ];

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[calc(100vh-10rem)] transition-colors duration-300">

      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 dark:bg-[#6366F1]/20 flex items-center justify-center">
            <BrainCircuit size={24} className="text-[#8B5CF6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Mentor</h2>
            <p className="text-xs text-slate-500">Powered by NextStep AI</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${isOnline ? 'text-[#10B981] bg-[#10B981]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}>
          <Circle size={8} fill="currentColor" /> {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6]' : 'bg-[#6366F1]/10 dark:bg-[#6366F1]/20'}`}>
              {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-[#8B5CF6]" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-[#8B5CF6] text-white rounded-tr-none' 
                : msg.isError
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-tl-none'
                  : 'bg-slate-50 dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              {msg.model && (
                <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 italic text-right">
                  Answered by: {msg.model}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#6366F1]/10">
              <Bot size={16} className="text-[#8B5CF6]" />
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4">
              <div className="flex space-x-2 items-center h-5">
                <div className="h-2 w-2 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-[#8B5CF6] rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => sendMessage(action)}
              disabled={isLoading}
              className="text-xs font-medium text-[#6366F1] bg-[#6366F1]/10 hover:bg-[#6366F1]/20 px-3 py-1.5 rounded-lg transition-colors border border-[#6366F1]/20 disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask me anything about your career..."
            className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-4 pr-16 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all disabled:opacity-50"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-slate-400 rounded-lg flex items-center justify-center text-white transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
