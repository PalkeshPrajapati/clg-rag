'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, ShieldCheck, Key, Sparkles, Upload, BookOpen, LogOut, ArrowRight, Database, AlertCircle } from 'lucide-react';
import { AdminIngestion } from '@/components/AdminIngestion';
import { DocumentList } from '@/components/DocumentList';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'documents'>('upload');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if session token exists in sessionStorage
    const savedToken = sessionStorage.getItem('campusbrain_admin_token');
    if (savedToken === 'admin-authorized') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Incorrect admin password');
      }

      sessionStorage.setItem('campusbrain_admin_token', 'admin-authorized');
      setIsAuthenticated(true);
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('campusbrain_admin_token');
    setIsAuthenticated(false);
  };

  const handleDocumentAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 1. Password Verification Screen (Campus Saathi Light Theme)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Saathi Admin</h1>
            <p className="text-xs text-slate-500">Enter institutional secret password to access document ingestion & vector store</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Admin Secret Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Unlock Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center">
            <Link href="/" className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">
              ← Return to Student Q&A Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unlocked Admin Dashboard Screen (Campus Saathi Light Theme)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Campus Saathi Admin</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                  Authorized
                </span>
              </div>
              <p className="text-xs text-slate-500">Knowledge Ingestion & Vector Control Hub</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Document Upload</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Indexed Knowledge Base</span>
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors"
            >
              Student Portal
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <main className="py-6">
        {activeTab === 'upload' && (
          <AdminIngestion
            onDocumentAdded={handleDocumentAdded}
            userRole="ADMIN"
            onOpenAuth={() => {}}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentList userRole="ADMIN" refreshTrigger={refreshTrigger} />
        )}
      </main>
    </div>
  );
}
