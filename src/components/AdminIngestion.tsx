'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Database, Layers, Tag, Plus, ArrowRight, Lock, Key } from 'lucide-react';
import { Category } from '@/lib/types';

const CATEGORIES: Category[] = [
  'Admission',
  'Training & Placement',
  'Complaints',
  'Student Services',
  'Academics',
  'Examinations',
  'Hostel & Mess',
  'Events',
  'General',
];
const DEPARTMENTS = ['All Departments', 'Computer Science & Engg', 'Electronics & Comm', 'Mechanical Engg', 'Civil Engg', 'Information Tech'];

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
        <div className="p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Admin Authorization Required</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Document upload & vector indexing privileges are strictly restricted to <strong>College Staff & Faculty Admins</strong> to protect knowledge base integrity.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all"
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/80 shadow-xs relative overflow-hidden">
        <div className="relative flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-xs">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Admin Document Ingestion Hub</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase">
                Vector Indexer
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Upload official college circulars, course syllabi, examination schedules, hostel manuals, or placement rules. Content is automatically chunked, embedded using Gemini, and indexed into Supabase pgvector.
            </p>
          </div>
        </div>
      </div>

      {/* Ingestion Mode Toggle */}
      <div className="flex p-1 rounded-2xl bg-slate-200/80 border border-slate-200 text-sm font-semibold max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'file'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Upload File (PDF / TXT / DOCX)</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'text'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
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
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleFileUpload} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-blue-500/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Title */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., CS301 Syllabus 2026 or Placement Drive Circular No. 4"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 text-sm font-semibold cursor-pointer transition-all"
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Department / Batch</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 text-sm font-semibold cursor-pointer transition-all"
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Document File (.pdf, .txt, .md, .docx)
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/60 hover:bg-blue-50/20 transition-all">
              <input
                type="file"
                accept=".pdf,.txt,.md,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                  <FileText className="w-8 h-8" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-600">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Click to browse or drag and drop college file
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, Markdown, TXT, DOCX files</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Circular / Notice Content
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste official notice text, guidelines, syllabus rules, or exam instructions here..."
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 text-sm leading-relaxed transition-all font-medium"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
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
