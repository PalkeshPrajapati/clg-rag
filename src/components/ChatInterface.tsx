'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BookOpen, Layers, Filter, CheckCircle2, FileText, Compass, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import { ChatMessage, Category, Citation } from '@/lib/types';

const SUGGESTED_PROMPTS = [
  { label: 'Attendance Criteria', category: 'Academics', text: 'What is the minimum attendance percentage required to sit for semester examinations?' },
  { label: 'CS301 Syllabus', category: 'Academics', text: 'What are the main modules and reference books for Data Structures & Algorithms?' },
  { label: 'Hostel Leave Rules', category: 'Hostel & Mess', text: 'How do students apply for outstation leave from the college hostel?' },
  { label: 'Placement Eligibility', category: 'Placements', text: 'What CGPA cut-off and arrears criteria apply for upcoming software engineering placement drives?' },
];

const CATEGORIES: (Category | 'All')[] = ['All', 'Academics', 'Examinations', 'Hostel & Mess', 'Placements', 'Events', 'General'];
const DEPARTMENTS = ['All', 'Computer Science & Engg', 'Electronics & Comm', 'Mechanical Engg', 'Civil Engg', 'Information Tech'];

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Welcome to **CampusBrain**! I am your AI campus assistant powered by Google Gemini and Supabase Vector Search. Ask me anything about course syllabi, exam schedules, hostel rules, library timings, or placement criteria.',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputQuery.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          category: selectedCategory,
          department: selectedDepartment,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'No response returned from server.',
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an issue retrieving information from the college knowledge base. Please check if your Supabase and Gemini credentials are configured correctly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 lg:px-8 py-4 gap-4">
      {/* Top Filter & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">Knowledge Scope:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
              className="bg-slate-950 text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Department:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 overflow-y-auto rounded-3xl bg-slate-950/60 border border-slate-800/80 p-4 sm:p-6 space-y-6 shadow-inner custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            {/* Sender Badge */}
            <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
              {msg.role === 'user' ? (
                <>
                  <span className="font-semibold text-indigo-400">You</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CampusBrain AI</span>
                  </div>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/15'
                  : 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-none shadow-md'
              }`}
            >
              <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Source Citations Badges */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-800/90 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Retrieved Knowledge Sources ({msg.citations.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((citation, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveCitation(citation)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-all shadow-sm hover:border-indigo-500/50"
                      >
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span className="font-medium truncate max-w-[180px]">{citation.documentTitle}</span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          {citation.similarityScore}% match
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-slate-300 text-sm animate-pulse max-w-md">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
            <span>Retrieving context & generating answer with Gemini...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Pills */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-indigo-400" /> Quick Topics:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.text)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <MessageSquare className="w-3 h-3 text-indigo-400" />
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask any question about college syllabus, exams, hostel, library, placement drives..."
          disabled={isLoading}
          className="w-full pl-5 pr-14 py-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-xl transition-all"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim() || isLoading}
          className="absolute right-2.5 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/30 hover:opacity-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Citation Detail Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-slate-100">{activeCitation.documentTitle}</h3>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  {activeCitation.category}
                </span>
                <span>Department: <strong className="text-slate-200">{activeCitation.department}</strong></span>
                <span>Match Score: <strong className="text-emerald-400">{activeCitation.similarityScore}%</strong></span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto">
                {activeCitation.contentSnippet}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveCitation(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
