'use client'
import Link from "next/link"
import ChessButton from "@/components/Button";

export default function Custom404() {
    return(
        <main className="flex flex-col min-h-screen items-center justify-center px-6 lg:px-12 py-20">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8 animate-fade-in-up">
                    <div className="inline-block mb-4">
                        <div className="h-px w-24 bg-gold mx-auto mb-4"></div>
                        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-gold mb-4">
                            404
                        </h1>
                        <div className="h-px w-24 bg-gold mx-auto mt-4"></div>
                    </div>
                </div>
                
                <h2 className="font-display text-3xl md:text-4xl font-bold text-ivory mb-6 animate-fade-in-up animate-delay-200">
                    Page Not Found
                </h2>
                
                <p className="font-body text-lg text-ivory/70 mb-8 leading-relaxed animate-fade-in-up animate-delay-300">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 animate-fade-in-up animate-delay-400">
                    <ChessButton
                        text="Return Home"
                        link="/"
                        variant="primary"
                    />
                    <Link 
                        href="https://blog.pawnalyze.com/" 
                        className="text-gold hover:text-gold-light transition-elegant font-body font-semibold underline decoration-gold/30 hover:decoration-gold"
                    >
                        Looking for the older version?
                    </Link>
                </div>
            </div>
        </main>
    )
  }