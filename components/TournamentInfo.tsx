'use client';

import Link from "next/link";

interface TournamentInfoProps {
  name: string;
  internalLink?: string;
  website: string;
  description: string;
  format: string;
  isActive?: boolean;
}

const TournamentInfo = ({ 
  name, 
  internalLink, 
  website, 
  description, 
  format,
  isActive = false 
}: TournamentInfoProps) => {
  const cardContent = (
    <>
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-green-400 text-xs font-medium uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Tournament Name */}
      <h3 className={`
        font-display text-xl md:text-2xl font-semibold mb-4 pr-20
        transition-colors duration-300
        ${internalLink ? 'text-ivory-100 group-hover:text-amber-400' : 'text-ivory-100'}
      `}>
        {name}
      </h3>

      {/* Description */}
      <p className="text-obsidian-300 text-sm md:text-base leading-relaxed mb-6">
        {description}
      </p>

      {/* Meta Info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-amber-400/60">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className="text-obsidian-500 text-xs uppercase tracking-wider block mb-0.5">Format</span>
            <span className="text-obsidian-300 text-sm">{format}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-amber-400/60">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <span className="text-obsidian-500 text-xs uppercase tracking-wider block mb-0.5">Official Website</span>
            <a 
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          </div>
        </div>
      </div>

      {/* View Details Arrow */}
      {internalLink && (
        <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-obsidian-400 text-sm">View simulations & predictions</span>
          <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-obsidian-950 transition-all duration-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      )}

      {/* Hover Gradient */}
      {internalLink && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </>
  );

  const cardClasses = `
    group block glass-card p-6 md:p-8 relative overflow-hidden
    ${internalLink ? 'cursor-pointer' : ''}
  `;

  if (internalLink) {
    return (
      <Link href={internalLink} className={cardClasses}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  );
};

export default TournamentInfo;
