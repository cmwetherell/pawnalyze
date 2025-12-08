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
  const content = (
    <div className="group relative bg-charcoal/50 backdrop-blur-sm border border-gold/20 rounded-lg p-6 md:p-8 hover:border-gold/40 transition-elegant shadow-soft hover:shadow-elegant">
      <div className="absolute inset-0 bg-gradient-luxury rounded-lg opacity-0 group-hover:opacity-100 transition-elegant"></div>
      <div className="relative z-10">
        {internalLink ? (
          <Link href={internalLink} className="block">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gold mb-4 group-hover:text-gold-light transition-elegant">
              {name}
            </h2>
          </Link>
        ) : (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gold mb-4">
            {name}
          </h2>
        )}
        <div className="space-y-3 font-body text-ivory/70">
          <p className="text-base">
            <span className="text-gold/80 font-semibold">Website:</span>{' '}
            <a 
              href={website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-elegant underline decoration-gold/30 hover:decoration-gold"
            >
              {website}
            </a>
          </p>
          <p className="text-base leading-relaxed">
            <span className="text-gold/80 font-semibold">Description:</span> {description}
          </p>
          <p className="text-base">
            <span className="text-gold/80 font-semibold">Format:</span> {format}
          </p>
        </div>
        {internalLink && (
          <div className="mt-6 flex items-center text-gold group-hover:text-gold-light transition-elegant">
            <span className="font-body text-sm font-semibold mr-2">View Details</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-elegant" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  return <div className="mb-6">{content}</div>;
};

export default TournamentInfo;
