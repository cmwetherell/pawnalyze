import Link from "next/link";

interface TournamentCardProps {
  name: string;
  href: string;
  description: string;
  format: string;
  status: 'live' | 'completed';
}

export default function TournamentCard({ name, href, description, format, status }: TournamentCardProps) {
  return (
    <Link
      href={href}
      className="group surface-card p-6 hover:border-chess-gold/30 transition-all block"
    >
      <div className="flex items-center gap-2 mb-3">
        {status === 'live' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />
            Live
          </span>
        ) : (
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Completed
          </span>
        )}
      </div>

      <h3 className="font-heading text-lg text-[var(--text-primary)] mb-2 group-hover:text-chess-gold transition-colors">
        {name}
      </h3>

      <p className="text-sm text-[var(--text-muted)] mb-3">{description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">{format}</span>
        <span className="text-sm text-chess-gold group-hover:translate-x-1 transition-transform inline-block">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
