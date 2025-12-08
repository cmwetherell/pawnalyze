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
  return (
    <div className="group relative bg-luxury-charcoal/40 backdrop-blur-sm border border-luxury-amber/20 rounded-lg p-6 lg:p-8 shadow-luxury hover-glow transition-all duration-500">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-luxury-amber/20 rounded-tr-lg" />
      
      {internalLink ? (
        <Link href={internalLink} className="block">
          <h3 className="font-display text-2xl lg:text-3xl font-bold text-luxury-gold mb-4 group-hover:text-luxury-amber transition-colors duration-300">
            {name}
          </h3>
        </Link>
      ) : (
        <h3 className="font-display text-2xl lg:text-3xl font-bold text-luxury-gold mb-4">
          {name}
        </h3>
      )}
      
      <div className="space-y-3 mt-6">
        <p className="text-luxury-cream/80 font-body">
          <span className="text-luxury-amber font-semibold">Website:</span>{' '}
          <a 
            href={website} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-luxury-gold hover:text-luxury-amber transition-colors duration-300 underline decoration-luxury-amber/50 hover:decoration-luxury-amber underline-offset-4"
          >
            {website}
          </a>
        </p>
        <p className="text-luxury-cream/90 font-body leading-relaxed">
          <span className="text-luxury-amber font-semibold">Description:</span> {description}
        </p>
        <p className="text-luxury-cream/80 font-body">
          <span className="text-luxury-amber font-semibold">Format:</span> {format}
        </p>
      </div>
      
      {internalLink && (
        <div className="mt-6 pt-6 border-t border-luxury-amber/10">
          <Link 
            href={internalLink}
            className="inline-flex items-center text-luxury-gold hover:text-luxury-amber transition-colors duration-300 font-body font-medium group/link"
          >
            View Simulations
            <svg 
              className="ml-2 w-5 h-5 transform group-hover/link:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default TournamentInfo;
