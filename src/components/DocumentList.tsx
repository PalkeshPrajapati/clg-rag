'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Trash2, Database, FileText, RefreshCw, Tag, Calendar, Layers } from 'lucide-react';
import { DocumentRecord } from '@/lib/types';

interface DocumentListProps {
  userRole: 'STUDENT' | 'ADMIN';
  refreshTrigger: number;
}

export const DocumentList: React.FC<DocumentListProps> = ({ userRole, refreshTrigger }) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents/list');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" and all its vector embeddings from Supabase?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/delete?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Indexed Knowledge Hub</h2>
            <p className="text-xs text-slate-500">
              {documents.length} verified college document(s) stored in Supabase pgvector
            </p>
          </div>
        </div>

        <button
          onClick={fetchDocuments}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse h-40" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
          <Database className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">No Documents Indexed Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The knowledge base is currently clean. Use the <strong>Document Upload</strong> tab to index syllabi, circulars, exam schedules, or regulations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500/50 transition-all space-y-4 shadow-2xs hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2">{doc.title}</h3>
                  </div>

                  {userRole === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      disabled={deletingId === doc.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 font-semibold">
                    {doc.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                    {doc.department}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{doc.chunk_count || 1} vector chunks</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
