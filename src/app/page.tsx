'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { ChatInterface } from '@/components/ChatInterface';
import { Sparkles, Mic, ArrowRight, ArrowUpRight, GraduationCap, Briefcase, Volume2, Grid } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [activeNav, setActiveNav] = useState<string>('Home');

  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery || searchQuery.trim();
    if (!q) return;
    setActiveQuery(q);
    setActiveNav('Ask Campus Saathi');
  };

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    if (nav === 'Home') {
      setActiveQuery('');
    }
  };

  const quickPills = [
    'How do I apply for admission?',
    'What are the placement stats?',
    'Track my complaint',
    'Campus facilities',
  ];

  const quickServices = [
    {
      title: 'Admission',
      desc: 'Check eligibility status, cutoff trends, checklist criteria.',
      icon: GraduationCap,
      query: 'What is the admission process for B.Tech Computer Science?',
    },
    {
      title: 'Training & Placement',
      desc: 'Track visited companies, average salary, prepare mock interviews.',
      icon: Briefcase,
      query: 'What are the upcoming placement drives, visited companies, and eligibility criteria?',
    },
    {
      title: 'Complaints & Redressal',
      desc: 'File, track, and escalate grievances to student cell.',
      icon: Volume2,
      query: 'How do I register a complaint or grievance with the student welfare cell?',
    },
    {
      title: 'Student Services',
      desc: 'Fee dues, library reservations, scholarship portals.',
      icon: Grid,
      query: 'What student services, fee payment rules, and library facilities are available?',
    },
  ];

  const announcements = [
    {
      date: 'SEP 28, 2026',
      title: 'Autumn Semester Registrations Open',
      desc: 'Registrations for the upcoming autumn semester are open until October 15th. Please complete fee payments through the Student Services portal.',
      query: 'When is the deadline for autumn semester registration and fee payment?',
    },
    {
      date: 'SEP 25, 2026',
      title: 'Placement Drive: Microsoft & Oracle',
      desc: 'Microsoft and Oracle placement recruitment drives are scheduled for next week. Eligible B.Tech and MCA candidates must upload resumes today.',
      query: 'What are the details and eligibility for Microsoft and Oracle placement drive?',
    },
    {
      date: 'SEP 22, 2026',
      title: "National Level Youth Festival (Udaan '26)",
      desc: 'Annual cultural youth festival registrations are now active. Submit project abstracts, dramatic entries, and musical requests before Thursday.',
      query: "How can students register for National Level Youth Festival Udaan '26?",
    },
  ];

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900">
      {/* Top Navbar Header */}
      <Header activeNav={activeNav} onNavClick={handleNavClick} />

      {/* Main Body: Home View vs Ask Campus Saathi Dedicated View */}
      <main className="transition-all">
        {activeNav === 'Ask Campus Saathi' ? (
          /* DEDICATED INLINE ASK CAMPUS SAATHI PAGE VIEW (NO POPUP) */
          <div className="py-6">
            <ChatInterface initialQuery={activeQuery} />
          </div>
        ) : (
          /* HOME LANDING PAGE VIEW */
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-16">
            {/* HERO SECTION */}
            <section className="text-center max-w-4xl mx-auto pt-4 pb-2 space-y-6">
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="uppercase tracking-wider">RAG-POWERED AI PORTAL ACTIVE</span>
              </div>

              {/* Hero Heading */}
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Campus Saathi — Your AI Campus Companion
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
                Ask anything about your campus — admissions, placements, complaints, and more. Certified institutional knowledge curated for students.
              </p>

              {/* Centered Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto pt-2">
                <div className="relative flex items-center rounded-2xl bg-white border-2 border-blue-500 shadow-xl shadow-blue-500/5">
                  <div className="pl-4 text-blue-600">
                    <Sparkles className="w-5 h-5" />
                  </div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask Campus Saathi..."
                    className="w-full pl-3 pr-24 py-4 rounded-2xl bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
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
                      disabled={!searchQuery.trim()}
                      className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 shadow-xs transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Topic Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {quickPills.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(undefined, pill)}
                    className="px-4 py-2 rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-semibold shadow-2xs transition-all"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </section>

            {/* QUICK ACCESS SERVICES SECTION */}
            <section className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Quick Access Services
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {quickServices.map((service, idx) => {
                  const IconComp = service.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSearchSubmit(undefined, service.query)}
                      className="group relative p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-lg hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <IconComp className="w-5 h-5" />
                        </div>

                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                          {service.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-normal">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* RECENT ANNOUNCEMENTS SECTION */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Recent Announcements
                </h2>

                <button
                  onClick={() => handleSearchSubmit(undefined, 'What are all recent college announcements and circular bulletins?')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All Announcement Bulletins
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {announcements.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearchSubmit(undefined, item.query)}
                    className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-lg hover:border-blue-500/50 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        {item.date}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base tracking-tight group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-3">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-200 py-8 px-4 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              🎓
            </div>
            <span>Campus Saathi © 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Contact IT Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
