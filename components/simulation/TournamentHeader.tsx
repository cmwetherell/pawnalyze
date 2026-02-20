interface TournamentHeaderProps {
  name: string;
  description: string;
  format: string;
  website: string;
}

export default function TournamentHeader({
  name,
  description,
  format,
  website,
}: TournamentHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 sm:px-8 sm:py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {name}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {format} &middot; {description}{' '}
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            FIDE &rarr;
          </a>
        </p>
      </div>
    </div>
  );
}
