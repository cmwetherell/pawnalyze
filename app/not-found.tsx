import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        {/* 404 Display */}
        <div className="relative mb-8">
          <span className="
            text-[150px] md:text-[200px] 
            font-display font-bold 
            text-gradient
            opacity-20
            leading-none
            select-none
          ">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">♔</span>
          </div>
        </div>
        
        {/* Message */}
        <h1 className="font-display text-display-sm text-text-primary mb-4">
          Page Not Found
        </h1>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for seems to have made an illegal move. 
          Let&apos;s get you back to a legal position.
        </p>
        
        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
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
        
        {/* Helper text */}
        <p className="mt-8 text-sm text-text-muted">
          Looking for the older version of Pawnalyze?{' '}
          <Link 
            href="https://blog.pawnalyze.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-light transition-colors"
          >
            Click here
          </Link>
        </p>
      </div>
    </div>
  );
}
