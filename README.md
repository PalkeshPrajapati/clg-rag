# CampusBrain AI - College RAG (Retrieval-Augmented Generation) System

**CampusBrain AI** is an intelligent, high-performance RAG web application built for colleges and universities using **Next.js 16 (App Router)**, **Google Gemini API**, and **Supabase PostgreSQL (`pgvector`)**.

It empowers students to instantly ask questions about course syllabi, exam timetables, hostel regulations, and placement drives with verified source citations, while providing administrators with a secure portal to ingest and index campus documents.

---

## ✨ Features

- 🎓 **Zero-Login Student Q&A Portal (`/`)**:
  - Interactive AI Chat interface for students to ask any college query.
  - Interactive **Citation Badges** showing document source title, department, category, and match confidence score.
  - Scope filters by **Category** (*Academics*, *Examinations*, *Hostel & Mess*, *Placements*, *Events*, *General*) and **Department**.
  - Quick Topic Prompt pills for common student questions.

- 🔐 **Protected Admin Ingestion Hub (`/admin`)**:
  - Hidden route protected by a secret Admin Password (`ADMIN_PASSWORD`).
  - Drag-and-drop document uploader supporting **PDF**, **TXT**, **Markdown**, and **DOCX** files.
  - Manual text notice input for fast circular announcements.
  - Automated text chunking with overlapping windows and Gemini vector embedding generation (`text-embedding-004`).
  - Visual **Indexed Knowledge Base Explorer** with document metadata and delete capabilities.

- ⚡ **Hybrid RAG Retrieval Engine**:
  - Powered by Supabase PostgreSQL `pgvector` HNSW cosine similarity search.
  - Built-in fallback text matching to guarantee 100% document chunk retrieval.
  - Grounded response generation using Google Gemini (`gemini-1.5-flash`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism UI
- **Database & Vector Store**: Supabase PostgreSQL with `pgvector` extension
- **LLM & Embeddings**: Google Gemini API (`gemini-1.5-flash` & `text-embedding-004`)
- **Document Parsers**: `pdf-parse`, `mammoth` (DOCX)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/PalkeshPrajapati/clg-rag.git
cd clg-rag
npm install
```

---

### 2. Set Up Supabase Database (`pgvector`)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy and run the contents of [`supabase/schema.sql`](./supabase/schema.sql) to:
   - Enable the `vector` extension.
   - Create `documents` and `document_chunks` tables with 768-dimensional vector columns.
   - Create the HNSW vector index and `match_documents` SQL RPC function.

---

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key

# Secret Admin Password (for accessing /admin route)
ADMIN_PASSWORD=admin123
```

> **Where to get Supabase keys:**
> - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: In Supabase Dashboard → **Project Settings** → **API**.
> - `SUPABASE_SERVICE_ROLE_KEY`: Under **Project API Keys** → `service_role` (click *Reveal*).

---

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser:
- **Student Q&A View**: `http://localhost:3000`
- **Admin Document Ingestion**: `http://localhost:3000/admin` (Password: `admin123`)

---

## 📁 Project Structure

```
clg-rag/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Student Q&A Homepage
│   │   ├── admin/
│   │   │   └── page.tsx                 # Protected Admin Portal (/admin)
│   │   ├── api/
│   │   │   ├── chat/route.ts            # RAG Streaming Q&A Endpoint
│   │   │   ├── admin/verify/route.ts    # Secret Password Verification
│   │   │   └── documents/
│   │   │       ├── upload/route.ts      # Document Ingestion & Vector Indexer
│   │   │       ├── list/route.ts        # Fetch Indexed Documents List
│   │   │       └── delete/route.ts      # Delete Document & Embeddings
│   ├── components/
│   │   ├── Header.tsx                   # Student Navigation Bar
│   │   ├── ChatInterface.tsx            # Student AI Q&A Component
│   │   ├── AdminIngestion.tsx           # Document Upload Hub
│   │   └── DocumentList.tsx             # Knowledge Base Explorer
│   └── lib/
│       ├── rag/
│       │   ├── gemini.ts                # Gemini Embeddings & Fallback Generator
│       │   └── chunker.ts               # Overlapping Text Chunker
│       ├── supabase/
│       │   ├── client.ts                # Supabase Browser Client
│       │   └── server.ts                # Supabase Service Role Admin Client
│       └── types.ts                     # TypeScript Interfaces
├── supabase/
│   └── schema.sql                       # Database & pgvector Migration Script
└── README.md
```

---

## ⚡ Deployment on Vercel

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ADMIN_PASSWORD`) under **Project Settings → Environment Variables**.
4. Deploy! Next.js will automatically compile and optimize production builds.
