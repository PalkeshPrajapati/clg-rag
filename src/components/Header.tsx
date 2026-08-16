'use client';

import React from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  activeNav?: string;
  onNavClick?: (nav: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeNav = 'Home',
  onNavClick,
}) => {
  const navItems = [
    'Home',
    'Ask Campus Saathi',
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Campus Saathi
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 -mt-1">
              AI COMPANION
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeNav === item;
            return (
              <button
                key={item}
                onClick={() => onNavClick && onNavClick(item)}
                className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Admin Button */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
            title="Admin Access Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
