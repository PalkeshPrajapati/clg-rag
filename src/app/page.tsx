'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Student Portal Header */}
      <Header />

      {/* Main Student Q&A Chat Interface */}
      <main className="transition-all duration-300">
        <ChatInterface />
      </main>
    </div>
  );
}
