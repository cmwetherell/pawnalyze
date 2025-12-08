import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {/* Large 404 */}
        <div className="relative mb-8">
          <span className="font-display text-[12rem] sm:text-[16rem] font-bold text-obsidian-900 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-6xl sm:text-7xl font-bold text-gradient">
              Oops!
            </span>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ivory-100 mb-4">
          Page Not Found
        </h1>
        <p className="text-obsidian-400 text-lg max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link 
            href="https://blog.pawnalyze.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Visit Blog
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-obsidian-500 text-sm">
          Looking for the older version of Pawnalyze?{' '}
          <Link 
            href="https://blog.pawnalyze.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Click here
          </Link>
        </p>
      </div>
    </main>
  );
}
