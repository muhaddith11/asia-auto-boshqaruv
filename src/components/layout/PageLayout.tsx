'use client';
import React from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  filterPanel?: React.ReactNode;
  children: React.ReactNode;
  px?: number | string; // Optional custom horizontal padding
}

export default function PageLayout({
  title,
  subtitle,
  headerActions,
  filterPanel,
  children,
  px = 40 // Default: Airy 40px
}: PageLayoutProps) {
  const horizontalPadding = typeof px === 'number' ? `${px}px` : px;

  // pl-* klasslar: telefonda paddinglar kichrayadi, sarlavha va tugmalar
  // qatorlarga bo'linadi (globals.css). Kompyuterdagi ko'rinish shu inline stillarda.
  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">

      {/* ── CONSTANT HEADER ── */}
      <header
        className="pl-head pt-8 pb-4 flex items-start justify-between shrink-0"
        style={{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding }}
      >
        <div className="pl-title-block">
          <h1 className="pl-title text-[20px] font-bold text-white tracking-tight leading-none">{title}</h1>
          {subtitle && (
            <p className="text-[12px] text-slate-400 font-medium mt-2">{subtitle}</p>
          )}
        </div>
        {headerActions && (
          <div className="pl-head-actions flex items-center gap-3">
            {headerActions}
          </div>
        )}
      </header>

      {/* ── FILTER / STATS PANEL (Floating Frame) ── */}
      {filterPanel && (
        <div
          className="pl-filter-wrap shrink-0"
          style={{
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
            marginTop: 8 // Small gap before the frame
          }}
        >
          <div
            className="pl-filter bg-surface border border-border rounded-2xl shadow-sm overflow-hidden"
            style={{ padding: 32 }}
          >
            {filterPanel}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <main
        className="pl-main flex-1 overflow-auto"
        style={{ 
          paddingLeft: horizontalPadding, 
          paddingRight: horizontalPadding, 
          paddingTop: 32, 
          paddingBottom: 40 
        }}
      >
        {children}
      </main>
    </div>
  );
}
