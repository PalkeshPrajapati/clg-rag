'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Database, Layers, Tag, Plus, ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';

const CATEGORIES: Category[] = ['Academics', 'Examinations', 'Hostel & Mess', 'Placements', 'Events', 'General'];
const DEPARTMENTS = ['All Departments', 'Computer Science & Engg', 'Electronics & Comm', 'Mechanical Engg', 'Civil Engg', 'Information Tech'];

import { Lock, ShieldAlert, Key } from 'lucide-react';

interface AdminIngestionProps {
  onDocumentAdded: () => void;
  userRole: 'STUDENT' | 'ADMIN';
  onOpenAuth: () => void;
}

export const AdminIngestion: React.FC<AdminIngestionProps> = ({ onDocumentAdded, userRole, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Academics');
  const [department, setDepartment] = useState('All Departments');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (userRole !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-100">Admin Authorization Required</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Document upload & vector indexing privileges are strictly restricted to <strong>College Staff & Faculty Admins</strong> to protect knowledge base integrity. Students cannot upload or modify official campus documents.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-amber-500/20 transition-all"
            >
              <Key className="w-4 h-4" />
              <span>Log In as Admin / Faculty</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a document title.' });
      return;
    }

    if (activeTab === 'file' && !file) {
      setStatusMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    if (activeTab === 'text' && !rawText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter circular/notice text content.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('department', department);

      if (activeTab === 'file' && file) {
        formData.append('file', file);
      } else if (activeTab === 'text') {
        formData.append('text', rawText.trim());
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Document ingestion failed');
      }

      setStatusMessage({
        type: 'success',
        text: data.message || `Successfully indexed "${title}" with ${data.chunkCount} vector chunks!`,
      });

      // Reset form
      setTitle('');
      setFile(null);
      setRawText('');
      onDocumentAdded();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred during ingestion.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Upload className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">Admin Document Ingestion Hub</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Vector Indexer
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-xl">
              Upload official college circulars, course syllabi, examination schedules, hostel manuals, or placement rules. Content is automatically parsed, chunked, embedded using Google Gemini, and indexed into Supabase pgvector.
            </p>
          </div>
        </div>
      </div>

      {/* Ingestion Mode Toggle */}
      <div className="flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-semibold max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'file'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Upload File (PDF / TXT / DOCX)</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'text'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Manual Text Notice</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/50 border-red-500/40 text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleFileUpload} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Title */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Document Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., CS301 Syllabus 2026 or Hostel Regulation Circular No. 4"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-medium cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Department / Batch</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm font-medium cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input area: File Upload or Raw Text */}
        {activeTab === 'file' ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Document File (.pdf, .txt, .md, .docx)
            </label>
            <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 text-center bg-slate-950/50 transition-all">
              <input
                type="file"
                accept=".pdf,.txt,.md,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                  <FileText className="w-8 h-8" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Click to browse or drag and drop college file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, Markdown, TXT, DOCX files</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Circular / Notice Content
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste official notice text, guidelines, syllabus rules, or exam instructions here..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm leading-relaxed"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 disabled:opacity-50 transition-all"
          >
            {isUploading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Chunking & Embedding Vector...</span>
              </>
            ) : (
              <>
                <span>Index into Vector Store</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
