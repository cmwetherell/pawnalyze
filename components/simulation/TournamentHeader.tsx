import PlayerAvatar from './PlayerAvatar';
import Flag from '@/components/ui/Flag';

interface TournamentHeaderProps {
  name: string;
  description: string;
  format: string;
  website: string;
  websiteLabel?: string;
  players?: string[];
  /** Federation codes rendered as a flag stack (used instead of player avatars). */
  flags?: { code: string; title?: string }[];
  /** Small status pill, e.g. "Round 4 of 11" */
  statusPill?: { text: string; live?: boolean };
}

export default function TournamentHeader({
  name,
  description,
  format,
  website,
  websiteLabel = 'FIDE',
  players,
  flags,
  statusPill,
}: TournamentHeaderProps) {
  const pillStyle = {
    backgroundColor: 'var(--header-pill-bg)',
    color: 'var(--header-pill-text)',
    border: '1px solid var(--header-pill-border)',
  } as const;

  return (
    <div className="relative px-6 py-8 sm:px-8 sm:py-10 overflow-hidden" style={{
      background: `linear-gradient(to bottom, var(--header-from), var(--header-to))`,
    }}>
      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-chess-gold/50 to-transparent" />

      {/* Subtle chess pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-conic-gradient(var(--header-pattern-color) 0% 25%, transparent 0% 50%)`,
        backgroundSize: '30px 30px',
      }} />

      <div className="relative max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--header-text-muted)' }}>
          <a href="/simulations" className="hover:text-chess-gold transition-colors">Simulations</a>
          <span>/</span>
          <span style={{ color: 'var(--header-text)' }}>{name}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading tracking-tight" style={{ color: 'var(--header-text)' }}>
          {name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {statusPill && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={statusPill.live
                ? { backgroundColor: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }
                : pillStyle}
            >
              {statusPill.live && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />}
              {statusPill.text}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={pillStyle}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {format}
          </span>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:text-chess-gold hover:border-chess-gold/30 transition-colors"
            style={pillStyle}
          >
            {websiteLabel}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <p className="mt-3 text-sm max-w-2xl" style={{ color: 'var(--header-text-muted)' }}>
          {description}
        </p>

        {/* Player avatars */}
        {players && players.length > 0 && (
          <div className="mt-4 flex items-center">
            <div className="flex -space-x-2">
              {players.map((player) => (
                <PlayerAvatar
                  key={player}
                  name={player}
                  size="md"
                  className="ring-2 ring-[var(--header-avatar-ring)]"
                />
              ))}
            </div>
          </div>
        )}

        {/* Flag stack */}
        {flags && flags.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            {flags.map((f, i) => (
              <Flag key={`${f.code}-${i}`} code={f.code} title={f.title} size="lg" className="!ring-2 !ring-[var(--header-avatar-ring)]" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
