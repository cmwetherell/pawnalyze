// components/TournamentInfo.tsx
'use client';

import Link from "next/link";

interface TournamentInfoProps {
  name: string;
  internalLink?: string;
  website: string;
  description: string;
  format: string;
  status?: 'live' | 'upcoming' | 'completed';
}

const TournamentInfo = ({ 
  name, 
  internalLink, 
  website, 
  description, 
  format,
  status = 'completed'
}: TournamentInfoProps) => {
  const StatusBadge = () => {
    const statusStyles = {
      live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      upcoming: 'bg-accent/10 text-accent border-accent/20',
      completed: 'bg-text-muted/10 text-text-muted border-text-muted/20'
    };
    
    const statusLabels = {
      live: 'Live',
      upcoming: 'Upcoming',
      completed: 'Completed'
    };
    
    return (
      <span className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 
        text-xs font-medium uppercase tracking-wider
        rounded-full border
        ${statusStyles[status]}
      `}>
        {status === 'live' && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
        {statusLabels[status]}
      </span>
    );
  };

  const CardContent = () => (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="
          font-display text-heading-lg 
          text-text-primary
          transition-colors duration-300
          group-hover:text-accent
        ">
          {name}
        </h2>
        <StatusBadge />
      </div>
      
      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed mb-6">
        {description}
      </p>
      
      {/* Meta Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-text-muted w-16">Format</span>
          <span className="text-text-secondary">{format}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-text-muted w-16">Website</span>
          <a 
            href={website} 
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="
              text-accent 
              transition-colors duration-300
              hover:text-accent-light
              truncate
            "
          >
            {website.replace('https://', '').replace('www.', '')}
          </a>
        </div>
      </div>
      
      {/* Action */}
      {internalLink && (
        <div className="
          flex items-center gap-2
          pt-4 border-t border-border-subtle
          text-sm font-medium
          text-accent
          transition-all duration-300
          group-hover:gap-3
        ">
          <span>View Simulations</span>
          <svg 
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      )}
    </>
  );

  if (internalLink) {
    return (
      <Link 
        href={internalLink}
        className="
          group
          glass-card glass-card-hover gold-glow-hover
          p-6
          block
        "
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="glass-card p-6">
      <CardContent />
    </div>
  );
};

export default TournamentInfo;
