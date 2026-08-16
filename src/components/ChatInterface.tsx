'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BookOpen, FileText, ArrowRight, Mic, ThumbsUp, ThumbsDown, MessageSquare, AlertCircle } from 'lucide-react';
import { ChatMessage, Category, Citation } from '@/lib/types';

interface ChatInterfaceProps {
  initialQuery?: string;
  onNavigateHome?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialQuery = '',
  onNavigateHome,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Welcome to **Campus Saathi**! I am your AI campus assistant powered by Google Gemini and Supabase Vector Search. Ask me anything about admissions, course syllabi, exam schedules, hostel rules, library timings, or placement criteria.',
      citations: [
        {
          documentId: 'doc-1',
          documentTitle: 'Admission Brochure 2026',
          category: 'Admission',
          department: 'All',
          contentSnippet: 'Admissions are primarily based on merit scores in board qualifiers and JEE Mains.',
          similarityScore: 92,
        },
        {
          documentId: 'doc-2',
          documentTitle: 'University Website',
          category: 'General',
          department: 'All',
          contentSnippet: 'Official information portal for students and faculty.',
          similarityScore: 88,
        },
        {
          documentId: 'doc-3',
          documentTitle: 'UGC Guidelines',
          category: 'Academics',
          department: 'All',
          contentSnippet: 'Higher education institutional compliance and rules.',
          similarityScore: 85,
        },
      ],
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

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
          category: 'All',
          department: 'All',
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

  const followUpPills = ['Fee structure', 'Scholarship options', 'Important dates'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ask Campus Saathi</h1>
        </div>
      </div>

      {/* Messages Stream Container (No popup, inline page view) */}
      <div className="space-y-6 min-h-[50vh] py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            {msg.role === 'user' ? (
              /* User Bubble (Right Aligned Light Blue Pill) */
              <div className="bg-blue-50 text-blue-600 font-semibold rounded-2xl rounded-tr-none px-5 py-3.5 text-sm border border-blue-100 shadow-2xs max-w-xl">
                {msg.content}
              </div>
            ) : (
              /* AI Response Card (Left Aligned White Card) */
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-6 shadow-2xs space-y-4 max-w-2xl text-slate-800 text-sm leading-relaxed">
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Sources Section */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      SOURCES
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {msg.citations.map((citation, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCitation(citation)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>{citation.documentTitle}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Controls */}
                <div className="flex items-center gap-2 pt-1">
                  <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors" title="Helpful">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors" title="Not Helpful">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm animate-pulse max-w-md shadow-2xs">
            <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
            <span>Searching college database & generating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up Quick Topic Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        {followUpPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pill)}
            className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-blue-600 font-semibold text-xs hover:bg-blue-50 shadow-2xs transition-all"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Full-width Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="pt-1">
        <div className="relative flex items-center rounded-2xl bg-white border-2 border-blue-500 shadow-xl shadow-blue-500/5 p-2">
          <div className="pl-3 text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Campus Saathi..."
            disabled={isLoading}
            className="w-full pl-3 pr-20 py-2.5 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
          />

          <div className="absolute right-3 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Voice Query"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 shadow-xs transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Citation Detail Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">{activeCitation.documentTitle}</h3>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold border border-blue-200">
                  {activeCitation.category}
                </span>
                <span>Match Score: <strong className="text-emerald-600">{activeCitation.similarityScore}%</strong></span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto">
                {activeCitation.contentSnippet}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
