export type Category = 
  | 'Academics' 
  | 'Examinations' 
  | 'Hostel & Mess' 
  | 'Placements' 
  | 'Events' 
  | 'General';

export interface DocumentRecord {
  id: string;
  title: string;
  category: Category;
  department: string;
  file_type: string;
  chunk_count: number;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: {
    title: string;
    category: Category;
    department: string;
    chunk_index: number;
  };
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  category: Category;
  department: string;
  contentSnippet: string;
  similarityScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export type UserRole = 'STUDENT' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
