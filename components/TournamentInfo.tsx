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
    <div className="bg-white shadow-md rounded-lg p-4">
      {/* If internalLink is not provided, use the website link */}
      {internalLink ? (
        <Link
          href={internalLink}
          className="text-2xl font-bold mb-2"
          >
          <h2 className="text-2xl font-bold mb-2 text-blue">{name}</h2> {/* Tournament name is more prominent */}
        </Link>
      ) : (
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
      )}
      <p className="text-md mb-1"><strong>Website:</strong> <a href={website} className="text-blue-600 hover:text-blue-800 visited:text-purple-600">{website}</a></p>
      <p className="text-md mb-1"><strong>Description:</strong> {description}</p>
      <p className="text-md mb-1"><strong>Format:</strong> {format}</p>
    </div>
  );
};

export default TournamentInfo;
