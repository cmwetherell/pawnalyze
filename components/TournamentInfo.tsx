// components/TournamentInfo.tsx
import Link from "next/link";

interface TournamentInfoProps {
  name: string;
  internalLink?: string;
  website: string;
  description: string;
  format: string;
}

const TournamentInfo = ({ name, internalLink, website, description, format }: TournamentInfoProps) => {
  const containerClasses = "glass-panel accent-border flex flex-col gap-3 p-6";

  const destination = internalLink || website;
  const isExternal = destination?.startsWith("http");

  const renderTitle = () => {
    if (internalLink) {
      return (
        <Link href={internalLink}>
          <h2 className="font-display text-xl uppercase tracking-[0.35em] text-paper">{name}</h2>
        </Link>
      );
    }

    if (isExternal && destination) {
      return (
        <a href={destination} target="_blank" rel="noreferrer">
          <h2 className="font-display text-xl uppercase tracking-[0.35em] text-paper">{name}</h2>
        </a>
      );
    }

    return <h2 className="font-display text-xl uppercase tracking-[0.35em] text-paper">{name}</h2>;
  };

  return (
    <div className={containerClasses}>
      {renderTitle()}
      <p className="text-sm text-slate">{description}</p>
      <p className="text-xs uppercase tracking-[0.35em] text-mint/80">{format}</p>
      {destination &&
        (isExternal ? (
          <a
            href={destination}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-paper"
          >
            Visit
            <span className="inline-block h-[1px] w-10 bg-gradient-to-r from-mint to-brass" />
          </a>
        ) : (
          <Link href={destination} className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-paper">
            Visit
            <span className="inline-block h-[1px] w-10 bg-gradient-to-r from-mint to-brass" />
          </Link>
        ))}
    </div>
  );
};

export default TournamentInfo;
