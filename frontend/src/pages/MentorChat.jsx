import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Circle } from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export default function MentorChat({ studentId }) {
  const { chatHistory, chatWithMentor, loading } = useStudent();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Default welcome message if chat history is empty
  const defaultMessages = [
    { role: 'assistant', content: 'Hi Abhinav! I\'m your AI career mentor. How can I help you today?' }
  ];

  const displayMessages = chatHistory.length > 0 ? chatHistory : defaultMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, loading.mentor]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading.mentor) return;
    
    const userMessage = input;
    setInput('');
    
    try {
      await chatWithMentor(studentId || 1, userMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[calc(100vh-10rem)] transition-colors duration-300">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 dark:bg-[#6366F1]/20 flex items-center justify-center">
            <Bot size={24} className="text-[#8B5CF6]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Mentor</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#10B981] font-medium px-3 py-1 bg-[#10B981]/10 rounded-full">
          <Circle size={8} fill="currentColor" /> Online
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
        {displayMessages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6]' : 'bg-[#6366F1]/10 dark:bg-[#6366F1]/20'}`}>
              {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-[#8B5CF6]" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[#8B5CF6] text-white rounded-tr-none' : 'bg-slate-50 dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-tl-none'}`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
            </div>

          </div>
        ))}
        {loading.mentor && (
          <div className="flex items-start gap-4">
             <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#6366F1]/10 dark:bg-[#6366F1]/20">
               <Bot size={16} className="text-[#8B5CF6]" />
             </div>
             <div className="bg-slate-50 dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4">
                <div className="flex space-x-2 justify-center items-center h-5">
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
          {['Improve my Resume', 'How to improve DSA?', 'Give me Interview Tips', 'Career Advice for my Goal', 'Suggest a Project for me'].map((action, i) => (
            <button 
              key={i}
              onClick={() => {
                if (!loading.mentor) {
                   chatWithMentor(studentId || 1, action);
                }
              }}
              disabled={loading.mentor}
              className="text-xs font-medium text-[#6366F1] bg-[#6366F1]/10 hover:bg-[#6366F1]/20 px-3 py-1.5 rounded-lg transition-colors border border-[#6366F1]/20 disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading.mentor}
            placeholder="Type your message..." 
            className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-4 pr-16 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all disabled:opacity-50"
          />
          <button type="submit" disabled={loading.mentor} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-slate-400 rounded-lg flex items-center justify-center text-white transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
