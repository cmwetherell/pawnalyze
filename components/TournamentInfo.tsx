// components/TournamentInfo.tsx
import Link from "next/link";

interface TournamentInfoProps {
  name: string;
  internalLink?: string;
  website: string;
  description: string;
  format: string;
}

const TournamentInfo = ({
  name,
  internalLink,
  website,
  description,
  format,
}: TournamentInfoProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-soft/95 via-ink/90 to-black/80 p-6 shadow-subtle">
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber/60 to-transparent opacity-60"></span>
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex-1 space-y-3">
          {internalLink ? (
            <Link href={internalLink} className="font-display text-2xl text-sand transition hover:text-amber">
              {name}
            </Link>
          ) : (
            <h2 className="font-display text-2xl text-sand">{name}</h2>
          )}
          <p className="text-base text-sand-muted">{description}</p>
        </div>
        <div className="w-full max-w-xs space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.3em] text-sand-muted">
          <div>
            <span className="text-[0.65rem] text-sand-muted">Format</span>
            <p className="font-display text-base normal-case tracking-normal text-sand">{format}</p>
          </div>
          <div>
            <span className="text-[0.65rem] text-sand-muted">Website</span>
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block font-display text-base normal-case tracking-normal text-mint transition hover:text-amber"
            >
              Visit {'->'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentInfo;
